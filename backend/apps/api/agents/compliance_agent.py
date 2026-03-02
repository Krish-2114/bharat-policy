"""Agent 2 — Compliance Evaluation Agent (Elite)."""

from sqlalchemy.orm import Session
from apps.api.agents.base_agent import BaseAgent, GUARDRAIL_SUFFIX
from apps.api.observability.logger import AgentTrace

PROMPT = """You are a compliance evaluation expert for Indian policy law. Given a scenario and policy clauses, evaluate strictly.

Return EXACTLY this JSON format:
{{
  "verdict": "VIOLATION" | "NO_VIOLATION" | "PARTIAL_VIOLATION",
  "risk_level": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "violated_clauses": ["clause numbers violated"],
  "compliant_clauses": ["clause numbers satisfied"],
  "explanation": "detailed explanation with clause references",
  "recommended_action": "what should be done",
  "legal_exposure": "description of legal/financial exposure",
  "insufficient_information": false,
  "agent": "ComplianceAgent"
}}

Return ONLY valid JSON.{guardrail}

Policy Clauses:
{clauses}

Scenario to evaluate:
{scenario}"""


class ComplianceAgent(BaseAgent):
    agent_name = "ComplianceAgent"

    def run(self, db: Session, scenario: str = "", policy_id: int | None = None,
            session_id: str | None = None, workflow_type: str | None = None) -> dict:

        with AgentTrace(db, self.agent_name, session_id, workflow_type, policy_id, scenario) as trace:
            clauses, avg_score = self.retrieve_context(db, scenario, top_k=10, policy_id=policy_id)

            if not self.check_insufficient_info(clauses, avg_score):
                result = self.insufficient_info_response()
                trace.record(result)
                return result

            prompt = PROMPT.format(
                clauses=self._format_clauses(clauses),
                scenario=scenario,
                guardrail=GUARDRAIL_SUFFIX,
            )
            trace.mark_llm_start(prompt)
            raw, in_tok, out_tok = self.call_llm(prompt, max_tokens=2048)
            trace.mark_llm_end(raw)

            result = self.parse_json_output(raw)
            confidence = self.compute_confidence(avg_score, len(clauses),
                                                  not result.get("insufficient_information"))
            result["confidence"] = confidence
            result["source_clauses"] = [
                {"clause_number": c["clause_number"], "score": c["score"]} for c in clauses
            ]
            trace.record(result, retrieval_scores=[c["score"] for c in clauses],
                         confidence=confidence["score"])
            return result
