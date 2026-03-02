"""Agent 4 — Gap Analysis Agent (Elite)."""
from sqlalchemy.orm import Session
from apps.api.agents.base_agent import BaseAgent, GUARDRAIL_SUFFIX
from apps.api.observability.logger import AgentTrace

PROMPT = """You are a policy gap analysis expert. Identify gaps and weaknesses.

Return EXACTLY this JSON:
{{
  "missing_compliance_areas": ["compliance domains not covered"],
  "undefined_responsibilities": ["vague or unassigned roles"],
  "weak_enforcement_areas": ["clauses with poor enforcement"],
  "ambiguous_clauses": ["clauses with unclear language"],
  "missing_definitions": ["terms used but not defined"],
  "regulatory_gaps": ["incomplete regulatory areas"],
  "recommendations": ["specific improvements"],
  "severity_score": 0,
  "gap_summary": "overall gap summary",
  "insufficient_information": false,
  "agent": "GapAnalysisAgent"
}}
Return ONLY valid JSON.{guardrail}

Policy Clauses:
{clauses}
Focus area: {focus_area}"""

class GapAnalysisAgent(BaseAgent):
    agent_name = "GapAnalysisAgent"

    def run(self, db: Session, focus_area: str = "Complete policy gaps", policy_id: int | None = None,
            session_id: str | None = None, workflow_type: str | None = None) -> dict:
        with AgentTrace(db, self.agent_name, session_id, workflow_type, policy_id, focus_area) as trace:
            clauses, avg_score = self.retrieve_context(db, focus_area, top_k=12, policy_id=policy_id)
            if not self.check_insufficient_info(clauses, avg_score):
                result = self.insufficient_info_response(); trace.record(result); return result
            prompt = PROMPT.format(clauses=self._format_clauses(clauses), focus_area=focus_area, guardrail=GUARDRAIL_SUFFIX)
            trace.mark_llm_start(prompt)
            raw, _, _ = self.call_llm(prompt, max_tokens=2048)
            trace.mark_llm_end(raw)
            result = self.parse_json_output(raw)
            confidence = self.compute_confidence(avg_score, len(clauses), not result.get("insufficient_information"))
            result["confidence"] = confidence
            result["source_clauses"] = [{"clause_number": c["clause_number"], "score": c["score"]} for c in clauses]
            trace.record(result, retrieval_scores=[c["score"] for c in clauses], confidence=confidence["score"])
            return result
