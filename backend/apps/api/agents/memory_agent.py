"""Agent 13 — Memory Agent.
Maintains session context, previous queries, iterative refinement.
Uses LangChain ConversationBufferMemory + in-DB session storage.
"""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

# langchain 0.3+: memory lives in langchain_community
try:
    from langchain_community.memory import ConversationBufferWindowMemory
except ImportError:
    from langchain.memory import ConversationBufferWindowMemory  # type: ignore

from langchain_core.messages import AIMessage, HumanMessage


class SessionMemory:
    """
    In-memory session store keyed by session_id.
    Each session has:
     - conversation history (LangChain messages)
     - agent results history
     - current policy context
    """

    _sessions: dict[str, dict] = {}

    @classmethod
    def get_or_create(cls, session_id: str | None = None) -> tuple[str, dict]:
        if not session_id or session_id not in cls._sessions:
            session_id = session_id or str(uuid.uuid4())
            cls._sessions[session_id] = {
                "session_id": session_id,
                "created_at": datetime.utcnow().isoformat(),
                "memory": ConversationBufferWindowMemory(k=10, return_messages=True),
                "history": [],
                "active_policy_id": None,
                "agent_results_cache": {},
            }
        return session_id, cls._sessions[session_id]

    @classmethod
    def add_interaction(
        cls,
        session_id: str,
        query: str,
        agent_results: dict,
        agents_used: list[str],
    ) -> None:
        _, session = cls.get_or_create(session_id)

        # Add to LangChain memory
        summary = cls._summarize_results(agent_results)
        session["memory"].chat_memory.add_user_message(query)
        session["memory"].chat_memory.add_ai_message(summary)

        # Add to history log
        session["history"].append({
            "timestamp": datetime.utcnow().isoformat(),
            "query": query,
            "agents_used": agents_used,
            "summary": summary,
        })

        # Cache agent results
        for agent_name, result in agent_results.items():
            session["agent_results_cache"][agent_name] = result

    @classmethod
    def get_context_string(cls, session_id: str) -> str:
        """Get conversation history as context string for prompts."""
        _, session = cls.get_or_create(session_id)
        messages = session["memory"].chat_memory.messages
        if not messages:
            return "No previous context."

        lines = []
        for msg in messages[-6:]:  # last 6 messages
            role = "User" if isinstance(msg, HumanMessage) else "Assistant"
            lines.append(f"{role}: {msg.content}")
        return "\n".join(lines)

    @classmethod
    def get_session_summary(cls, session_id: str) -> dict:
        if session_id not in cls._sessions:
            return {"error": "Session not found"}
        session = cls._sessions[session_id]
        return {
            "session_id": session_id,
            "created_at": session["created_at"],
            "total_interactions": len(session["history"]),
            "history": session["history"],
            "active_policy_id": session["active_policy_id"],
            "cached_agents": list(session["agent_results_cache"].keys()),
        }

    @classmethod
    def set_policy_context(cls, session_id: str, policy_id: int) -> None:
        _, session = cls.get_or_create(session_id)
        session["active_policy_id"] = policy_id

    @classmethod
    def clear_session(cls, session_id: str) -> None:
        if session_id in cls._sessions:
            del cls._sessions[session_id]

    @staticmethod
    def _summarize_results(agent_results: dict) -> str:
        parts = []
        for agent, result in agent_results.items():
            if "error" in result:
                parts.append(f"[{agent}] Error: {result['error']}")
            elif "summary" in result:
                parts.append(f"[{agent}] {result['summary']}")
            elif "verdict" in result:
                parts.append(f"[{agent}] Verdict: {result['verdict']} | Risk: {result.get('risk_level', 'N/A')}")
            elif "overall_risk_score" in result:
                parts.append(f"[{agent}] Risk Score: {result['overall_risk_score']}/10")
            else:
                parts.append(f"[{agent}] Completed.")
        return " | ".join(parts) if parts else "Analysis completed."
