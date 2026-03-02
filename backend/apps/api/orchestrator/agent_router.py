"""Agent 11 — Task Router Agent.
Decides which agent to call and in what sequence based on the user query.
"""

from __future__ import annotations
import json
import logging
from sqlalchemy.orm import Session

from apps.api.agents.base_agent import BaseAgent
from apps.api.agents.policy_analyst import PolicyAnalystAgent
from apps.api.agents.compliance_agent import ComplianceAgent
from apps.api.agents.comparison_agent import ComparisonAgent
from apps.api.agents.gap_analysis_agent import GapAnalysisAgent
from apps.api.agents.risk_agent import RiskAssessmentAgent
from apps.api.agents.simulation_agent import ImpactSimulationAgent
from apps.api.agents.amendment_agent import AmendmentDraftingAgent
from apps.api.agents.stakeholder_agent import StakeholderImpactAgent
from apps.api.agents.conflict_agent import ConflictDetectionAgent
from apps.api.agents.clause_relationship_agent import ClauseRelationshipAgent

logger = logging.getLogger(__name__)

AGENT_REGISTRY = {
    "policy_analyst": PolicyAnalystAgent,
    "compliance": ComplianceAgent,
    "comparison": ComparisonAgent,
    "gap_analysis": GapAnalysisAgent,
    "risk_assessment": RiskAssessmentAgent,
    "impact_simulation": ImpactSimulationAgent,
    "amendment_drafting": AmendmentDraftingAgent,
    "stakeholder_impact": StakeholderImpactAgent,
    "conflict_detection": ConflictDetectionAgent,
    "clause_relationship": ClauseRelationshipAgent,
}

ROUTING_PROMPT = """You are an AI task router for a policy analysis system. Based on the user query, decide which agents to call and in what order.

Available agents:
- policy_analyst: Summarize policy, extract obligations, deadlines, penalties, stakeholders
- compliance: Evaluate if a scenario violates policy rules
- comparison: Compare two policies side by side
- gap_analysis: Find missing areas, weak enforcement, undefined responsibilities
- risk_assessment: Score risks — ambiguity, financial, operational, legal
- impact_simulation: Simulate what happens if a policy change is made
- amendment_drafting: Suggest improved clause wording and new clauses
- stakeholder_impact: Analyze impact on employees, government, vendors, citizens
- conflict_detection: Find contradictions and inconsistencies between clauses
- clause_relationship: Build knowledge graph of clause dependencies

User query: {query}

Return EXACTLY this JSON (no explanation):
{{
  "agents_to_call": ["agent1", "agent2"],
  "sequence": "sequential" | "parallel",
  "reasoning": "why these agents were chosen"
}}

Choose 1-3 most relevant agents. Return ONLY valid JSON."""


class AgentRouter:
    """Routes user queries to the correct agents."""

    def __init__(self):
        self._router_agent = PolicyAnalystAgent()  # use base LLM from any agent

    def route(self, query: str) -> dict:
        """Determine which agents to call for this query."""
        prompt = ROUTING_PROMPT.format(query=query)
        raw, _, _ = self._router_agent.call_llm(prompt, max_tokens=512)
        routing = self._router_agent.parse_json_output(raw)

        # Validate agent names
        valid_agents = [
            a for a in routing.get("agents_to_call", [])
            if a in AGENT_REGISTRY
        ]
        if not valid_agents:
            valid_agents = ["policy_analyst"]

        routing["agents_to_call"] = valid_agents
        return routing

    def execute_routing(
        self,
        db: Session,
        query: str,
        policy_id: int | None = None,
        policy_id_b: int | None = None,
        **kwargs,
    ) -> dict:
        """Route query and execute the chosen agents."""
        routing = self.route(query)
        results = {}

        for agent_name in routing["agents_to_call"]:
            agent_cls = AGENT_REGISTRY[agent_name]
            agent = agent_cls()

            try:
                # Each agent has slightly different signatures
                if agent_name == "compliance":
                    result = agent.run(db, scenario=query, policy_id=policy_id)
                elif agent_name == "comparison":
                    pid_b = policy_id_b or policy_id
                    result = agent.run(db, policy_id_a=policy_id or 1, policy_id_b=pid_b or 2)
                elif agent_name == "gap_analysis":
                    result = agent.run(db, focus_area=query, policy_id=policy_id)
                elif agent_name == "risk_assessment":
                    result = agent.run(db, context=query, policy_id=policy_id)
                elif agent_name == "impact_simulation":
                    result = agent.run(db, proposed_change=query, policy_id=policy_id)
                elif agent_name == "amendment_drafting":
                    result = agent.run(db, focus=query, policy_id=policy_id)
                elif agent_name == "stakeholder_impact":
                    result = agent.run(db, context=query, policy_id=policy_id)
                elif agent_name == "conflict_detection":
                    result = agent.run(db, policy_id=policy_id)
                elif agent_name == "clause_relationship":
                    result = agent.run(db, policy_id=policy_id)
                else:
                    result = agent.run(db, query=query, policy_id=policy_id)

                results[agent_name] = result
            except Exception as e:
                logger.error(f"Agent {agent_name} failed: {e}")
                results[agent_name] = {"error": str(e), "agent": agent_name}

        return {
            "routing": routing,
            "results": results,
            "query": query,
            "policy_id": policy_id,
        }
