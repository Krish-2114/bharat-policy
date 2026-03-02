"""Agent 6 — Impact Simulation Agent (Elite)."""
from sqlalchemy.orm import Session
from apps.api.agents.base_agent import BaseAgent, GUARDRAIL_SUFFIX
from apps.api.observability.logger import AgentTrace

PROMPT = """You are a policy impact simulation expert. Simulate consequences of the proposed change.

Return EXACTLY this JSON:
{{
  "proposed_change": "description of change",
  "immediate_impacts": ["0-30 day impacts"],
  "short_term_impacts": ["1-6 month impacts"],
  "long_term_impacts": ["6+ month impacts"],
  "stakeholder_impacts": {{"employees": "", "government": "", "citizens": "", "vendors": ""}},
  "financial_impact": {{"estimated_cost": "", "revenue_impact": "", "budget_implication": ""}},
  "risk_of_change": "LOW",
  "unintended_consequences": ["potential unintended consequences"],
  "success_probability": "percentage",
  "recommendation": "proceed | revise | reject",
  "reasoning": "explanation",
  "insufficient_information": false,
  "agent": "ImpactSimulationAgent"
}}
Return ONLY valid JSON.{guardrail}

Current Policy Clauses:
{clauses}
Proposed Change: {proposed_change}"""

class ImpactSimulationAgent(BaseAgent):
    agent_name = "ImpactSimulationAgent"

    def run(self, db: Session, proposed_change: str = "", policy_id: int | None = None,
            session_id: str | None = None, workflow_type: str | None = None) -> dict:
        with AgentTrace(db, self.agent_name, session_id, workflow_type, policy_id, proposed_change) as trace:
            clauses, avg_score = self.retrieve_context(db, proposed_change, top_k=10, policy_id=policy_id)
            if not self.check_insufficient_info(clauses, avg_score):
                result = self.insufficient_info_response(); trace.record(result); return result
            prompt = PROMPT.format(clauses=self._format_clauses(clauses), proposed_change=proposed_change, guardrail=GUARDRAIL_SUFFIX)
            trace.mark_llm_start(prompt)
            raw, _, _ = self.call_llm(prompt, max_tokens=2048)
            trace.mark_llm_end(raw)
            result = self.parse_json_output(raw)
            confidence = self.compute_confidence(avg_score, len(clauses), not result.get("insufficient_information"))
            result["confidence"] = confidence
            result["source_clauses"] = [{"clause_number": c["clause_number"], "score": c["score"]} for c in clauses]
            trace.record(result, retrieval_scores=[c["score"] for c in clauses], confidence=confidence["score"])
            return result
