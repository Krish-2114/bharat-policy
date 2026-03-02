"""Agent 7 — Amendment Drafting Agent (Elite)."""
from sqlalchemy.orm import Session
from apps.api.agents.base_agent import BaseAgent, GUARDRAIL_SUFFIX
from apps.api.observability.logger import AgentTrace

PROMPT = """You are a legal policy drafting expert. Suggest specific amendments to strengthen this policy.

Return EXACTLY this JSON:
{{
  "amendments": [
    {{"clause_number": "", "original_text": "", "amended_text": "", "reason": "", "improvement_type": "clarity|enforcement|compliance|legal_tightening"}}
  ],
  "new_clauses_suggested": [
    {{"suggested_clause_number": "", "text": "", "purpose": ""}}
  ],
  "clauses_to_remove": ["clause numbers to remove and why"],
  "overall_improvement_score": 0,
  "amendment_summary": "summary",
  "insufficient_information": false,
  "agent": "AmendmentDraftingAgent"
}}
Return ONLY valid JSON.{guardrail}

Policy Clauses:
{clauses}
Amendment focus: {focus}"""

class AmendmentDraftingAgent(BaseAgent):
    agent_name = "AmendmentDraftingAgent"

    def run(self, db: Session, focus: str = "Improve all weak areas", policy_id: int | None = None,
            session_id: str | None = None, workflow_type: str | None = None) -> dict:
        with AgentTrace(db, self.agent_name, session_id, workflow_type, policy_id, focus) as trace:
            clauses, avg_score = self.retrieve_context(db, focus, top_k=12, policy_id=policy_id)
            if not self.check_insufficient_info(clauses, avg_score):
                result = self.insufficient_info_response(); trace.record(result); return result
            prompt = PROMPT.format(clauses=self._format_clauses(clauses), focus=focus, guardrail=GUARDRAIL_SUFFIX)
            trace.mark_llm_start(prompt)
            raw, _, _ = self.call_llm(prompt, max_tokens=3000)
            trace.mark_llm_end(raw)
            result = self.parse_json_output(raw)
            confidence = self.compute_confidence(avg_score, len(clauses), not result.get("insufficient_information"))
            result["confidence"] = confidence
            result["source_clauses"] = [{"clause_number": c["clause_number"], "score": c["score"]} for c in clauses]
            trace.record(result, retrieval_scores=[c["score"] for c in clauses], confidence=confidence["score"])
            return result
