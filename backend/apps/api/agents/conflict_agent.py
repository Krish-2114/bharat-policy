"""Agent 9 — Conflict Detection Agent.
Detects contradictions, logical inconsistencies between clauses.
"""

from sqlalchemy import text
from sqlalchemy.orm import Session
from apps.api.agents.base_agent import BaseAgent


class ConflictDetectionAgent(BaseAgent):
    agent_name = "ConflictDetectionAgent"

    SYSTEM_PROMPT = """You are a legal conflict detection expert. Identify all contradictions, inconsistencies, and logical conflicts within or between policies.

Return EXACTLY this JSON format:
{{
  "conflicts": [
    {{
      "conflict_id": "C1",
      "type": "direct_contradiction | logical_inconsistency | scope_overlap | definitional_conflict",
      "clause_a": "clause number",
      "clause_b": "clause number",
      "description": "detailed description of conflict",
      "severity": "LOW | MEDIUM | HIGH | CRITICAL",
      "resolution_suggestion": "how to resolve"
    }}
  ],
  "total_conflicts": 0,
  "critical_conflicts": 0,
  "conflict_clusters": ["groups of related conflicting clauses"],
  "safe_clauses": ["clauses with no conflicts"],
  "overall_consistency_score": 0-10,
  "resolution_priority": ["ordered list of conflicts to resolve first"],
  "agent": "ConflictDetectionAgent"
}}

Return ONLY valid JSON.

Policy Clauses:
{clauses}"""

    def _get_all_clauses(self, db: Session, policy_id: int | None) -> str:
        if policy_id:
            stmt = text("SELECT clause_number, text FROM clauses WHERE policy_id = :pid ORDER BY id")
            rows = db.execute(stmt, {"pid": policy_id}).fetchall()
        else:
            stmt = text("SELECT clause_number, text, policy_id FROM clauses ORDER BY policy_id, id LIMIT 30")
            rows = db.execute(stmt).fetchall()
        return "\n\n".join(f"[Clause {r.clause_number}]\n{r.text}" for r in rows)

    def run(self, db: Session, policy_id: int | None = None) -> dict:
        clauses_text = self._get_all_clauses(db, policy_id)
        if not clauses_text:
            return {"error": "No clauses found", "agent": self.agent_name}

        prompt = self.SYSTEM_PROMPT.format(clauses=clauses_text)
        raw, _, _ = self.call_llm(prompt, max_tokens=2048)
        result = self.parse_json_output(raw)
        return result
