"""Agent 3 — Policy Comparison Agent.
Compares two policies: added, removed, modified clauses, risk differences.
"""

from sqlalchemy import text
from sqlalchemy.orm import Session
from apps.api.agents.base_agent import BaseAgent


class ComparisonAgent(BaseAgent):
    agent_name = "ComparisonAgent"

    SYSTEM_PROMPT = """You are a policy comparison expert. Compare Policy A and Policy B clauses.

Return EXACTLY this JSON format:
{{
  "added_clauses": ["clauses present in B but not A"],
  "removed_clauses": ["clauses present in A but not B"],
  "modified_clauses": ["clauses that changed between A and B"],
  "risk_differences": ["key risk changes between policies"],
  "stricter_in_b": ["areas where B is stricter than A"],
  "relaxed_in_b": ["areas where B is more relaxed than A"],
  "recommendation": "overall recommendation on which policy is more robust",
  "summary": "brief comparison summary",
  "agent": "ComparisonAgent"
}}

Return ONLY valid JSON.

Policy A Clauses:
{clauses_a}

Policy B Clauses:
{clauses_b}"""

    def _get_all_clauses_for_policy(self, db: Session, policy_id: int) -> str:
        stmt = text("SELECT clause_number, text FROM clauses WHERE policy_id = :pid ORDER BY id")
        rows = db.execute(stmt, {"pid": policy_id}).fetchall()
        return "\n\n".join(f"[Clause {r.clause_number}]\n{r.text}" for r in rows)

    def run(self, db: Session, policy_id_a: int, policy_id_b: int) -> dict:
        clauses_a = self._get_all_clauses_for_policy(db, policy_id_a)
        clauses_b = self._get_all_clauses_for_policy(db, policy_id_b)

        if not clauses_a or not clauses_b:
            return {"error": "One or both policies have no clauses", "agent": self.agent_name}

        prompt = self.SYSTEM_PROMPT.format(clauses_a=clauses_a, clauses_b=clauses_b)
        raw, _, _ = self.call_llm(prompt, max_tokens=2048)
        result = self.parse_json_output(raw)
        result["policy_a_id"] = policy_id_a
        result["policy_b_id"] = policy_id_b
        return result
