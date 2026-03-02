"""Agent 10 — Clause Relationship Agent (Knowledge Graph Agent).
Builds dependency graph and cross-reference mapping.
"""

from sqlalchemy import text
from sqlalchemy.orm import Session
from apps.api.agents.base_agent import BaseAgent


class ClauseRelationshipAgent(BaseAgent):
    agent_name = "ClauseRelationshipAgent"

    SYSTEM_PROMPT = """You are a policy knowledge graph expert. Map all relationships and dependencies between policy clauses.

Return EXACTLY this JSON format:
{{
  "nodes": [
    {{
      "clause_number": "clause id",
      "label": "short label",
      "type": "obligation | definition | penalty | procedure | exemption | general"
    }}
  ],
  "edges": [
    {{
      "from": "clause number",
      "to": "clause number",
      "relationship": "depends_on | references | contradicts | modifies | defines | exempts | enforces",
      "description": "brief relationship description"
    }}
  ],
  "hub_clauses": ["clauses with most connections — most critical"],
  "isolated_clauses": ["clauses with no relationships — potential orphans"],
  "dependency_chains": ["chains of dependent clauses"],
  "knowledge_graph_summary": "summary of policy structure",
  "agent": "ClauseRelationshipAgent"
}}

Return ONLY valid JSON.

Policy Clauses:
{clauses}"""

    def _get_all_clauses(self, db: Session, policy_id: int | None) -> str:
        if policy_id:
            stmt = text("SELECT clause_number, text FROM clauses WHERE policy_id = :pid ORDER BY id")
            rows = db.execute(stmt, {"pid": policy_id}).fetchall()
        else:
            stmt = text("SELECT clause_number, text FROM clauses ORDER BY policy_id, id LIMIT 25")
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
