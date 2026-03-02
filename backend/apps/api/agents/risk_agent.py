"""Agent 5 — Risk Assessment Agent (Elite)."""
from sqlalchemy.orm import Session
from apps.api.agents.base_agent import BaseAgent, GUARDRAIL_SUFFIX
from apps.api.observability.logger import AgentTrace

PROMPT = """You are a policy risk assessment expert. Score each risk dimension.

Return EXACTLY this JSON:
{{
  "overall_risk_score": 0,
  "risk_level": "LOW",
  "ambiguity_score": 0,
  "ambiguity_details": "what is ambiguous",
  "enforcement_weakness_score": 0,
  "enforcement_details": "enforcement weaknesses",
  "financial_exposure_score": 0,
  "financial_details": "financial risks",
  "operational_risk_score": 0,
  "operational_details": "operational risks",
  "legal_risk_score": 0,
  "legal_details": "legal risks",
  "top_risks": ["top 5 risks ranked"],
  "mitigation_strategies": ["mitigations"],
  "insufficient_information": false,
  "agent": "RiskAssessmentAgent"
}}
Return ONLY valid JSON.{guardrail}

Policy Clauses:
{clauses}
Risk context: {context}"""

class RiskAssessmentAgent(BaseAgent):
    agent_name = "RiskAssessmentAgent"

    def run(self, db: Session, context: str = "Full risk assessment", policy_id: int | None = None,
            session_id: str | None = None, workflow_type: str | None = None) -> dict:
        with AgentTrace(db, self.agent_name, session_id, workflow_type, policy_id, context) as trace:
            clauses, avg_score = self.retrieve_context(db, context, top_k=12, policy_id=policy_id)
            if not self.check_insufficient_info(clauses, avg_score):
                result = self.insufficient_info_response(); trace.record(result); return result
            prompt = PROMPT.format(clauses=self._format_clauses(clauses), context=context, guardrail=GUARDRAIL_SUFFIX)
            trace.mark_llm_start(prompt)
            raw, _, _ = self.call_llm(prompt, max_tokens=2048)
            trace.mark_llm_end(raw)
            result = self.parse_json_output(raw)
            confidence = self.compute_confidence(avg_score, len(clauses), not result.get("insufficient_information"))
            result["confidence"] = confidence
            result["source_clauses"] = [{"clause_number": c["clause_number"], "score": c["score"]} for c in clauses]
            trace.record(result, retrieval_scores=[c["score"] for c in clauses], confidence=confidence["score"])
            return result
