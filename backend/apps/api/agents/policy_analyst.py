"""Agent 1 — Policy Analyst Agent (Elite)."""

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

Query: {query}"""


class PolicyAnalystAgent(BaseAgent):
    agent_name = "PolicyAnalystAgent"

    def run(self, db: Session, query: str = "Analyze this policy", policy_id: int | None = None,
            session_id: str | None = None, workflow_type: str | None = None) -> dict:

        with AgentTrace(db, self.agent_name, session_id, workflow_type, policy_id, query) as trace:
            clauses, avg_score = self.retrieve_context(db, query, top_k=10, policy_id=policy_id)

            if not self.check_insufficient_info(clauses, avg_score):
                result = self.insufficient_info_response()
                trace.record(result)
                return result

            prompt = PROMPT.format(
                clauses=self._format_clauses(clauses),
                query=query,
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
