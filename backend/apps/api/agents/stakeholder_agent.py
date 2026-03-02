"""Agent 8 — Stakeholder Impact Agent (Elite)."""
from sqlalchemy.orm import Session
from apps.api.agents.base_agent import BaseAgent, GUARDRAIL_SUFFIX
from apps.api.observability.logger import AgentTrace

PROMPT = """You are a stakeholder impact analysis expert. Analyze how this policy affects each group.

Return EXACTLY this JSON:
{{
  "stakeholder_groups": {{
    "employees": {{"impact_level": "LOW", "positive_impacts": [], "negative_impacts": [], "key_concerns": [], "compliance_burden": ""}},
    "government": {{"impact_level": "LOW", "positive_impacts": [], "negative_impacts": [], "enforcement_challenges": [], "resource_requirements": ""}},
    "citizens": {{"impact_level": "LOW", "positive_impacts": [], "negative_impacts": [], "access_and_rights": ""}},
    "vendors": {{"impact_level": "LOW", "positive_impacts": [], "negative_impacts": [], "contractual_implications": ""}}
  }},
  "most_affected_stakeholder": "",
  "conflict_of_interest": ["potential conflicts"],
  "consultation_recommendations": ["who to consult"],
  "insufficient_information": false,
  "agent": "StakeholderImpactAgent"
}}
Return ONLY valid JSON.{guardrail}

Policy Clauses:
{clauses}
Context: {context}"""

class StakeholderImpactAgent(BaseAgent):
    agent_name = "StakeholderImpactAgent"

    def run(self, db: Session, context: str = "Full stakeholder analysis", policy_id: int | None = None,
            session_id: str | None = None, workflow_type: str | None = None) -> dict:
        with AgentTrace(db, self.agent_name, session_id, workflow_type, policy_id, context) as trace:
            clauses, avg_score = self.retrieve_context(db, context, top_k=10, policy_id=policy_id)
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
