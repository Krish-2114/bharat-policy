"""
LangChain Tool Wrappers.
Each agent is wrapped as a LangChain structured tool so the AgentExecutor
can call them via tool-use when the LLM decides to.
"""

from __future__ import annotations

import json
import logging

from langchain_core.tools import tool
from langchain_aws import ChatBedrock

# langchain 0.3+ agents
try:
    from langchain.agents import AgentExecutor, create_structured_chat_agent
except ImportError:
    from langchain_community.agents import AgentExecutor, create_structured_chat_agent  # type: ignore

# langchain 0.3+ memory
try:
    from langchain_community.memory import ConversationBufferWindowMemory
except ImportError:
    from langchain.memory import ConversationBufferWindowMemory  # type: ignore

from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

from apps.api.config import (
    AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, BEDROCK_LLM_MODEL_ID
)

logger = logging.getLogger(__name__)


# ──────────────────────────────────────────────
# LangChain LLM (Bedrock)
# ──────────────────────────────────────────────

def get_langchain_llm():
    """Get LangChain-compatible Bedrock LLM."""
    kwargs = {
        "region_name": AWS_REGION,
        "model_id": BEDROCK_LLM_MODEL_ID,
        "model_kwargs": {"temperature": 0.1, "max_tokens": 2048},
    }
    if AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY:
        import boto3
        import os
        os.environ["AWS_ACCESS_KEY_ID"] = AWS_ACCESS_KEY_ID
        os.environ["AWS_SECRET_ACCESS_KEY"] = AWS_SECRET_ACCESS_KEY
    return ChatBedrock(**kwargs)


# ──────────────────────────────────────────────
# Tool factory
# ──────────────────────────────────────────────

def build_langchain_tools(db, policy_id: int | None = None):
    """
    Build all LangChain tools bound to a specific DB session.
    Each tool wraps one agent.
    """
    from apps.api.agents.policy_analyst import PolicyAnalystAgent
    from apps.api.agents.compliance_agent import ComplianceAgent
    from apps.api.agents.gap_analysis_agent import GapAnalysisAgent
    from apps.api.agents.risk_agent import RiskAssessmentAgent
    from apps.api.agents.simulation_agent import ImpactSimulationAgent
    from apps.api.agents.amendment_agent import AmendmentDraftingAgent
    from apps.api.agents.stakeholder_agent import StakeholderImpactAgent
    from apps.api.agents.conflict_agent import ConflictDetectionAgent
    from apps.api.agents.clause_relationship_agent import ClauseRelationshipAgent

    tools = []

    def _policy_analyst_fn(query: str) -> str:
        result = PolicyAnalystAgent().run(db, query=query, policy_id=policy_id)
        return json.dumps(result, indent=2)
    _policy_analyst_fn.__doc__ = (
        "Summarize a policy. Extract obligations, deadlines, penalties, stakeholders. "
        "Input: your question or 'summarize policy'."
    )
    tools.append(tool(_policy_analyst_fn, name="policy_analyst"))

    def _compliance_fn(scenario: str) -> str:
        result = ComplianceAgent().run(db, scenario=scenario, policy_id=policy_id)
        return json.dumps(result, indent=2)
    _compliance_fn.__doc__ = (
        "Check if a scenario violates policy. Returns verdict (VIOLATION/NO_VIOLATION), "
        "risk level, and which clauses are involved. Input: describe the scenario."
    )
    tools.append(tool(_compliance_fn, name="compliance_evaluator"))

    def _gap_fn(focus_area: str) -> str:
        result = GapAnalysisAgent().run(db, focus_area=focus_area, policy_id=policy_id)
        return json.dumps(result, indent=2)
    _gap_fn.__doc__ = (
        "Find gaps in the policy — missing compliance areas, undefined responsibilities, "
        "weak enforcement. Input: area to focus on or 'full gap analysis'."
    )
    tools.append(tool(_gap_fn, name="gap_analyzer"))

    def _risk_fn(context: str) -> str:
        result = RiskAssessmentAgent().run(db, context=context, policy_id=policy_id)
        return json.dumps(result, indent=2)
    _risk_fn.__doc__ = (
        "Score policy risks: ambiguity, enforcement weakness, financial exposure, "
        "operational risk. Returns scores 0-10 per dimension. Input: risk context."
    )
    tools.append(tool(_risk_fn, name="risk_assessor"))

    def _sim_fn(proposed_change: str) -> str:
        result = ImpactSimulationAgent().run(db, proposed_change=proposed_change, policy_id=policy_id)
        return json.dumps(result, indent=2)
    _sim_fn.__doc__ = (
        "Simulate what happens if a policy change is made. "
        "Input: describe the proposed change."
    )
    tools.append(tool(_sim_fn, name="impact_simulator"))

    def _amend_fn(focus: str) -> str:
        result = AmendmentDraftingAgent().run(db, focus=focus, policy_id=policy_id)
        return json.dumps(result, indent=2)
    _amend_fn.__doc__ = (
        "Draft improved clause wording, suggest new clauses, "
        "recommend legal tightening. Input: which area to improve."
    )
    tools.append(tool(_amend_fn, name="amendment_drafter"))

    def _stake_fn(context: str) -> str:
        result = StakeholderImpactAgent().run(db, context=context, policy_id=policy_id)
        return json.dumps(result, indent=2)
    _stake_fn.__doc__ = (
        "Analyze impact on employees, government, vendors, and citizens. "
        "Input: context or 'full stakeholder analysis'."
    )
    tools.append(tool(_stake_fn, name="stakeholder_analyzer"))

    def _conflict_fn(dummy: str = "detect") -> str:
        result = ConflictDetectionAgent().run(db, policy_id=policy_id)
        return json.dumps(result, indent=2)
    _conflict_fn.__doc__ = (
        "Detect contradictions and logical inconsistencies between clauses. "
        "Input: 'detect conflicts' or any string."
    )
    tools.append(tool(_conflict_fn, name="conflict_detector"))

    def _kg_fn(dummy: str = "build") -> str:
        result = ClauseRelationshipAgent().run(db, policy_id=policy_id)
        return json.dumps(result, indent=2)
    _kg_fn.__doc__ = (
        "Build a dependency graph and cross-reference map of all policy clauses. "
        "Input: 'build graph' or any string."
    )
    tools.append(tool(_kg_fn, name="knowledge_graph_builder"))

    return tools


# ──────────────────────────────────────────────
# LangChain Agent Executor
# ──────────────────────────────────────────────

SYSTEM_PROMPT = """You are Bharat Policy Twin — an advanced AI system for analysing Indian government policies.

You have access to specialised tools. Use them to answer questions accurately.

IMPORTANT:
- Always use tools — never guess from memory
- For compliance questions: use compliance_evaluator
- For policy overview: use policy_analyst
- For risks: use risk_assessor
- For proposed changes: use impact_simulator
- For policy quality: use gap_analyzer + amendment_drafter
- For conflicts: use conflict_detector
- For structure: use knowledge_graph_builder
- For stakeholders: use stakeholder_analyzer

Previous conversation:
{chat_history}

{agent_scratchpad}"""


def run_langchain_agent(
    db,
    user_message: str,
    policy_id: int | None = None,
    memory: ConversationBufferWindowMemory | None = None,
) -> dict:
    """
    Run the LangChain conversational agent with tool-calling.
    Returns structured response.
    """
    try:
        llm = get_langchain_llm()
        tools = build_langchain_tools(db, policy_id)

        if memory is None:
            memory = ConversationBufferWindowMemory(
                k=10,
                memory_key="chat_history",
                return_messages=True,
            )

        prompt = ChatPromptTemplate.from_messages([
            ("system", SYSTEM_PROMPT),
            MessagesPlaceholder("chat_history"),
            ("human", "{input}"),
            MessagesPlaceholder("agent_scratchpad"),
        ])

        agent = create_structured_chat_agent(llm, tools, prompt)
        executor = AgentExecutor(
            agent=agent,
            tools=tools,
            memory=memory,
            verbose=True,
            handle_parsing_errors=True,
            max_iterations=5,
            return_intermediate_steps=True,
        )

        response = executor.invoke({"input": user_message})

        tools_used = [
            step[0].tool
            for step in response.get("intermediate_steps", [])
        ]

        return {
            "answer": response.get("output", ""),
            "tools_used": tools_used,
            "mode": "langchain_agent",
        }

    except Exception as e:
        logger.error(f"LangChain agent error: {e}")
        return {"answer": f"Agent error: {str(e)}", "tools_used": [], "mode": "error"}
