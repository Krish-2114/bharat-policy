"""
Agent 1 — Policy Analyst Agent (Elite)
Always calls LLM.
Returns structured JSON.
Computes final composite confidence score.
"""

from sqlalchemy.orm import Session
from apps.api.agents.base_agent import BaseAgent, GUARDRAIL_SUFFIX
from apps.api.observability.logger import AgentTrace


PROMPT = """You are a senior policy analyst for the Indian government. Analyze the provided policy clauses.

Return EXACTLY this JSON format:
{{
  "summary": "2-3 sentence summary of the policy",
  "obligations": ["list of obligations"],
  "deadlines": ["list of deadlines with timeframes"],
  "penalties": ["list of penalties for non-compliance"],
  "stakeholders": ["list of stakeholders identified"],
  "key_rules": ["list of key rules"],
  "compliance_requirements": ["list of compliance requirements"],
  "insufficient_information": false,
  "agent": "PolicyAnalystAgent"
}}

Return ONLY valid JSON.{guardrail}

Policy Clauses:
{clauses}

Query: {query}
"""


class PolicyAnalystAgent(BaseAgent):
    agent_name = "PolicyAnalystAgent"

    def run(
        self,
        db: Session,
        query: str = "Analyze this policy",
        policy_id: int | None = None,
        session_id: str | None = None,
        workflow_type: str | None = None,
    ) -> dict:

        with AgentTrace(
            db,
            self.agent_name,
            session_id,
            workflow_type,
            policy_id,
            query,
        ) as trace:

            # --------------------------------------------------
            # 1. Retrieval (NO HARD GATING)
            # --------------------------------------------------
            clauses, avg_score = self.retrieve_context(
                db,
                query,
                top_k=10,
                policy_id=policy_id,
            )

            has_sufficient_info = self.check_insufficient_info(
                clauses,
                avg_score
            )

            # --------------------------------------------------
            # 2. Build Prompt
            # --------------------------------------------------
            prompt = PROMPT.format(
                clauses=self._format_clauses(clauses),
                query=query,
                guardrail=GUARDRAIL_SUFFIX,
            )

            trace.mark_llm_start(prompt)

            # Deterministic generation for governance systems
            raw, in_tok, out_tok = self.call_llm(prompt, max_tokens=2048)

            trace.mark_llm_end(raw)

            # --------------------------------------------------
            # 3. Parse LLM Output (Always Return JSON)
            # --------------------------------------------------
            try:
                result = self.parse_json_output(raw)
            except Exception:
                # Fallback safe structure
                result = {
                    "summary": "Unable to parse structured output from model.",
                    "obligations": [],
                    "deadlines": [],
                    "penalties": [],
                    "stakeholders": [],
                    "key_rules": [],
                    "compliance_requirements": [],
                    "insufficient_information": True,
                    "agent": self.agent_name,
                }

            # Override insufficient flag based on retrieval strength
            result["insufficient_information"] = not has_sufficient_info

            # --------------------------------------------------
            # 4. Compute Final Composite Confidence
            # --------------------------------------------------
            confidence = self.compute_confidence(
                avg_retrieval_score=avg_score,
                clause_count=len(clauses),
                has_sufficient_info=has_sufficient_info,
            )

            result["confidence"] = confidence

            # --------------------------------------------------
            # 5. Attach Source Clauses
            # --------------------------------------------------
            result["source_clauses"] = [
                {
                    "clause_number": c.get("clause_number"),
                    "score": c.get("score"),
                }
                for c in clauses
            ]

            # --------------------------------------------------
            # 6. Record Observability Metrics
            # --------------------------------------------------
            trace.record(
                result,
                retrieval_scores=[c.get("score") for c in clauses],
                confidence=confidence["score"],
            )

            return result

    # ----------------------------------------------------------
    # Composite Confidence Model
    # ----------------------------------------------------------
    def compute_final_confidence(
        self,
        avg_score: float,
        clause_count: int,
        sufficient: bool,
    ) -> dict:

        retrieval_component = min(avg_score or 0.0, 1.0)
        coverage_component = min(clause_count / 10.0, 1.0)
        sufficiency_component = 1.0 if sufficient else 0.5

        final_score = (
            0.5 * retrieval_component
            + 0.3 * coverage_component
            + 0.2 * sufficiency_component
        )

        final_score = round(final_score, 3)

        if final_score >= 0.75:
            level = "high"
        elif final_score >= 0.5:
            level = "medium"
        else:
            level = "low"

        return {
            "score": final_score,
            "level": level,
            "retrieval_score": round(avg_score or 0.0, 3),
            "clause_count": clause_count,
        }
