"""Ask router - RAG: retrieve clauses + Bedrock LLM with citations."""

import json

import boto3
from botocore.config import Config
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.orm import Session

from apps.api.config import (
    AWS_ACCESS_KEY_ID,
    AWS_REGION,
    AWS_SECRET_ACCESS_KEY,
    BEDROCK_LLM_MODEL_ID,
)
from apps.api.database import get_db
from apps.api.rag.embedder import EmbeddingService

router = APIRouter(tags=["ask"])

_PROMPT_TEMPLATE = """You are a policy assistant. Answer the question using ONLY the provided clauses. If the answer is not contained in the clauses, say 'Insufficient information.' Cite clause numbers in your answer.

Clauses:
{clauses_text}

Question: {question}
"""


class AskRequest(BaseModel):
    question: str
    policy_id: int | None = None


class Citation(BaseModel):
    clause_number: str
    clause_id: int


class AskResponse(BaseModel):
    answer: str
    citations: list[Citation]


def _retrieve_clauses(db: Session, query_vector: list[float], policy_id: int | None = None) -> list:
    vec_str = "[" + ",".join(str(x) for x in query_vector) + "]"
    if policy_id:
        stmt = text("""
            SELECT id, policy_id, clause_number, text
            FROM clauses
            WHERE embedding IS NOT NULL AND policy_id = :pid
            ORDER BY embedding <=> CAST(:vec AS vector)
            LIMIT 5
        """)
        return db.execute(stmt, {"vec": vec_str, "pid": policy_id}).fetchall()
    else:
        stmt = text("""
            SELECT id, policy_id, clause_number, text
            FROM clauses
            WHERE embedding IS NOT NULL
            ORDER BY embedding <=> CAST(:vec AS vector)
            LIMIT 5
        """)
        return db.execute(stmt, {"vec": vec_str}).fetchall()


def _call_llm(prompt: str) -> str:
    kwargs: dict = {"region_name": AWS_REGION}
    if AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY:
        kwargs["aws_access_key_id"] = AWS_ACCESS_KEY_ID
        kwargs["aws_secret_access_key"] = AWS_SECRET_ACCESS_KEY

    client = boto3.client(
        "bedrock-runtime",
        **kwargs,
        config=Config(retries={"mode": "standard", "max_attempts": 3}),
    )

    model_id = BEDROCK_LLM_MODEL_ID

    if model_id.startswith("anthropic."):
        body = json.dumps({
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 1024,
            "temperature": 0.2,
            "messages": [{"role": "user", "content": prompt}],
        })
        response = client.invoke_model(
            modelId=model_id,
            contentType="application/json",
            accept="application/json",
            body=body,
        )
        result = json.loads(response["body"].read())
        content = result.get("content", [])
        output = next(
            (block["text"] for block in content if block.get("type") == "text"),
            "",
        )
    else:
        body = json.dumps({
            "inputText": prompt,
            "textGenerationConfig": {
                "maxTokenCount": 1024,
                "temperature": 0.2,
            },
        })
        response = client.invoke_model(
            modelId=model_id,
            contentType="application/json",
            accept="application/json",
            body=body,
        )
        result = json.loads(response["body"].read())
        output = result.get("results", [{}])[0].get("outputText", "")

    return output.strip()


@router.post("/ask", response_model=AskResponse)
def ask(
    request: AskRequest,
    db: Session = Depends(get_db),
) -> AskResponse:
    """
    RAG: embed question, retrieve top 5 clauses via pgvector, generate answer
    using only those clauses. Citations list the retrieved clauses.
    """
    try:
        embedder = EmbeddingService()
        query_vector = embedder.embed_text(request.question)
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Embedding service error: {str(e)}")

    rows = _retrieve_clauses(db, query_vector, request.policy_id)
    citations = [Citation(clause_number=r.clause_number, clause_id=r.id) for r in rows]

    if not rows:
        return AskResponse(answer="Insufficient information.", citations=[])

    clauses_text = "\n\n".join(
        f"Clause {r.clause_number} (id={r.id}): {r.text}" for r in rows
    )
    prompt = _PROMPT_TEMPLATE.format(
        clauses_text=clauses_text,
        question=request.question,
    )

    try:
        answer = _call_llm(prompt)
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"LLM service error: {str(e)}")

    return AskResponse(answer=answer, citations=citations)
