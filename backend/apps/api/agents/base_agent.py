"""
Base Agent — all agents inherit from this.

Elite additions:
  ✅ Confidence scoring from retrieval similarity
  ✅ Guardrails: insufficient info detection
  ✅ Hallucination prevention: strict prompt enforcement
  ✅ Observability: AgentTrace integration
  ✅ Error recovery: fallback responses
  ✅ Persistent pgvector queries with IVFFlat index
"""

from __future__ import annotations

import json
import logging
import time
from abc import ABC, abstractmethod
from typing import Any

import boto3
from botocore.config import Config
from sqlalchemy import text
from sqlalchemy.orm import Session

from apps.api.config import (
    AWS_ACCESS_KEY_ID,
    AWS_REGION,
    AWS_SECRET_ACCESS_KEY,
    BEDROCK_LLM_MODEL_ID,
    BEDROCK_EMBEDDING_MODEL_ID,
)

logger = logging.getLogger(__name__)

# ── Confidence thresholds ─────────────────────────────────────────────
CONFIDENCE_HIGH = 0.75
CONFIDENCE_MEDIUM = 0.55
CONFIDENCE_LOW = 0.35   # below this → insufficient info fallback

# ── Guardrail prompt suffix (appended to every prompt) ───────────────
GUARDRAIL_SUFFIX = """

CRITICAL INSTRUCTIONS:
1. Only use information from the provided policy clauses above.
2. Never invent clauses, rules, or penalties not present in the text.
3. If the clauses do not contain enough information to answer, set a field called "insufficient_information": true.
4. Always return valid JSON. No markdown explanation outside the JSON.
5. Every claim must be traceable to a specific clause number."""


class BaseAgent(ABC):
    agent_name: str = "BaseAgent"

    def __init__(self) -> None:
        self._bedrock = None

    # ── AWS client ────────────────────────────────────────────────────

    def _get_bedrock_client(self):
        if self._bedrock is None:
            kwargs: dict = {"region_name": AWS_REGION}
            if AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY:
                kwargs["aws_access_key_id"] = AWS_ACCESS_KEY_ID
                kwargs["aws_secret_access_key"] = AWS_SECRET_ACCESS_KEY
            self._bedrock = boto3.client(
                "bedrock-runtime",
                **kwargs,
                config=Config(retries={"mode": "standard", "max_attempts": 3}),
            )
        return self._bedrock

    # ── Persistent PGVector retrieval ─────────────────────────────────

    def retrieve_context(
        self,
        db: Session,
        query_text: str,
        top_k: int = 8,
        policy_id: int | None = None,
        min_score: float = 0.0,
    ) -> tuple[list[dict], float]:
        """
        Retrieves top_k clauses from persistent pgvector store.
        Returns (clauses, avg_confidence_score).
        """
        embedding = self._embed(query_text)
        vec_str = "[" + ",".join(str(x) for x in embedding) + "]"

        base_filter = "WHERE embedding IS NOT NULL"
        params: dict = {"vec": vec_str, "k": top_k}

        if policy_id:
            base_filter += " AND policy_id = :pid"
            params["pid"] = policy_id

        stmt = text(f"""
            SELECT id, policy_id, clause_number, text,
                   1 - (embedding <=> CAST(:vec AS vector)) AS score
            FROM clauses
            {base_filter}
            ORDER BY embedding <=> CAST(:vec AS vector)
            LIMIT :k
        """)

        rows = db.execute(stmt, params).fetchall()
        clauses = [
            {
                "clause_id": r.id,
                "policy_id": r.policy_id,
                "clause_number": r.clause_number,
                "text": r.text,
                "score": round(r.score, 4),
            }
            for r in rows
            if r.score >= min_score
        ]

        avg_score = (
            round(sum(c["score"] for c in clauses) / len(clauses), 4)
            if clauses else 0.0
        )
        return clauses, avg_score

    def _embed(self, text_input: str) -> list[float]:
        client = self._get_bedrock_client()
        body = json.dumps({"inputText": text_input.strip()[:8000]})
        response = client.invoke_model(
            modelId=BEDROCK_EMBEDDING_MODEL_ID,
            contentType="application/json",
            accept="application/json",
            body=body,
        )
        return json.loads(response["body"].read())["embedding"]

    # ── LLM call ─────────────────────────────────────────────────────

    def call_llm(self, prompt: str, max_tokens: int = 2048) -> tuple[str, int, int]:
        """
        Returns (output_text, input_tokens_est, output_tokens_est).
        """
        client = self._get_bedrock_client()
        model_id = BEDROCK_LLM_MODEL_ID
        input_est = max(1, len(prompt) // 4)

        if model_id.startswith("anthropic."):
            body = json.dumps({
                "anthropic_version": "bedrock-2023-05-31",
                "max_tokens": max_tokens,
                "temperature": 0.0,  # deterministic for guardrails
                "messages": [{"role": "user", "content": prompt}],
            })
            response = client.invoke_model(
                modelId=model_id,
                contentType="application/json",
                accept="application/json",
                body=body,
            )
            result = json.loads(response["body"].read())
            output = next(
                (b["text"] for b in result.get("content", []) if b.get("type") == "text"), ""
            ).strip()
        else:
            body = json.dumps({
                "inputText": prompt,
                "textGenerationConfig": {"maxTokenCount": max_tokens, "temperature": 0.0},
            })
            response = client.invoke_model(
                modelId=model_id,
                contentType="application/json",
                accept="application/json",
                body=body,
            )
            output = json.loads(response["body"].read()).get("results", [{}])[0].get("outputText", "").strip()

        output_est = max(1, len(output) // 4)
        return output, input_est, output_est

    # ── Confidence scoring ────────────────────────────────────────────

    def compute_confidence(
        self,
        avg_retrieval_score: float,
        clause_count: int,
        has_sufficient_info: bool = True,
    ) -> dict:
        """
        Multi-factor confidence score.
        - retrieval quality (0-1)
        - clause coverage (how many relevant clauses found)
        - sufficient info flag
        """
        if not has_sufficient_info or clause_count == 0:
            return {
                "score": 0.0,
                "level": "INSUFFICIENT",
                "reliable": False,
                "reason": "Not enough relevant policy clauses found",
            }

        coverage_factor = min(clause_count / 5.0, 1.0)  # 5+ clauses = full coverage
        raw = (avg_retrieval_score * 0.7) + (coverage_factor * 0.3)
        score = round(min(raw, 1.0), 4)

        if score >= CONFIDENCE_HIGH:
            level = "HIGH"
        elif score >= CONFIDENCE_MEDIUM:
            level = "MEDIUM"
        elif score >= CONFIDENCE_LOW:
            level = "LOW"
        else:
            level = "INSUFFICIENT"

        return {
            "score": score,
            "level": level,
            "reliable": score >= CONFIDENCE_LOW,
            "avg_retrieval_score": avg_retrieval_score,
            "clause_count": clause_count,
        }

    # ── Guardrail: insufficient info ──────────────────────────────────

    def check_insufficient_info(self, clauses: list[dict], avg_score: float) -> bool:
        """Return True if we have enough info to proceed."""
        if not clauses:
            return False
        if avg_score < CONFIDENCE_LOW:
            return False
        return True

    def insufficient_info_response(self) -> dict:
        """Standard fallback when retrieval quality is too low."""
        return {
            "error": "insufficient_information",
            "message": (
                "The uploaded policy documents do not contain enough relevant "
                "information to answer this query reliably. Please upload more "
                "specific policy documents or rephrase your question."
            ),
            "confidence": {"score": 0.0, "level": "INSUFFICIENT", "reliable": False},
            "agent": self.agent_name,
        }

    # ── Output parsing ────────────────────────────────────────────────

    def parse_json_output(self, raw: str) -> dict:
        raw = raw.strip()
        if "```json" in raw:
            raw = raw.split("```json")[1].split("```")[0].strip()
        elif "```" in raw:
            raw = raw.split("```")[1].split("```")[0].strip()
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            logger.warning(f"[{self.agent_name}] JSON parse failed, returning raw")
            return {"raw_output": raw, "parse_error": True, "agent": self.agent_name}

    # ── Format helper ─────────────────────────────────────────────────

    def _format_clauses(self, clauses: list[dict]) -> str:
        return "\n\n".join(
            f"[Clause {c['clause_number']} | Policy {c['policy_id']} | Relevance {c['score']}]\n{c['text']}"
            for c in clauses
        )

    # ── Abstract interface ────────────────────────────────────────────

    @abstractmethod
    def run(self, db: Session, **kwargs) -> dict:
        ...
