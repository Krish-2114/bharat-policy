"""
/orchestrator router — LangGraph multi-step workflows + LangChain agent.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from apps.api.database import get_db
from apps.api.orchestrator.agent_router import AgentRouter
from apps.api.orchestrator.workflow_graph import execute_workflow
from apps.api.agents.memory_agent import SessionMemory

router = APIRouter(prefix="/orchestrator", tags=["🧠 Orchestrator"])


class AutoRouteRequest(BaseModel):
    query: str
    policy_id: int | None = None
    policy_id_b: int | None = None
    session_id: str | None = None


class WorkflowRequest(BaseModel):
    query: str
    workflow_type: str = "compliance_investigation"
    policy_id: int | None = None
    policy_id_b: int | None = None
    session_id: str | None = None


class SessionRequest(BaseModel):
    session_id: str


class SetPolicyRequest(BaseModel):
    session_id: str
    policy_id: int


@router.post("/auto", summary="🤖 Auto-Route (Task Router Agent)")
def auto_route(req: AutoRouteRequest, db: Session = Depends(get_db)):
    """
    Agent 11 — Task Router Agent.
    LLM decides which agents to call based on your query.
    """
    try:
        session_id, session = SessionMemory.get_or_create(req.session_id)
        previous_context = SessionMemory.get_context_string(session_id)

        router_agent = AgentRouter()
        result = router_agent.execute_routing(
            db,
            query=req.query,
            policy_id=req.policy_id or session.get("active_policy_id"),
            policy_id_b=req.policy_id_b,
        )

        SessionMemory.add_interaction(
            session_id,
            query=req.query,
            agent_results=result.get("results", {}),
            agents_used=list(result.get("results", {}).keys()),
        )

        result["session_id"] = session_id
        return result
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Orchestrator error: {str(e)}")


@router.post("/workflow", summary="🔀 LangGraph Multi-Step Workflow")
def run_workflow(req: WorkflowRequest, db: Session = Depends(get_db)):
    """
    Agent 12 — Multi-Step Planning Agent (LangGraph).

    Available workflows:
    - **compliance_investigation**: analyst → compliance → risk → amendment
    - **deep_audit**: analyst → gap → stakeholder → conflict → risk → amendment
    - **comparison**: analyst → compare → stakeholder
    - **impact_simulation**: analyst → simulate → risk → amendment
    - **knowledge_graph**: analyst → clause_graph → conflict
    """
    try:
        session_id, session = SessionMemory.get_or_create(req.session_id)
        previous_context = SessionMemory.get_context_string(session_id)

        result = execute_workflow(
            db=db,
            query=req.query,
            workflow_type=req.workflow_type,
            policy_id=req.policy_id or session.get("active_policy_id"),
            policy_id_b=req.policy_id_b,
            session_id=session_id,
            previous_context=previous_context,
        )

        SessionMemory.add_interaction(
            session_id,
            query=req.query,
            agent_results=result.get("agent_results", {}),
            agents_used=result.get("agents_executed", []),
        )

        result["session_id"] = session_id
        return result
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Workflow error: {str(e)}")


@router.get("/workflows", summary="📋 List Available Workflows")
def list_workflows():
    """List all available LangGraph workflows."""
    return {
        "workflows": [
            {
                "type": "compliance_investigation",
                "description": "Investigate compliance violations",
                "agents": ["policy_analyst", "compliance", "risk_assessment", "amendment_drafting"],
                "best_for": "Checking if a scenario violates policy",
            },
            {
                "type": "deep_audit",
                "description": "Full deep policy audit",
                "agents": ["policy_analyst", "gap_analysis", "stakeholder_impact", "conflict_detection", "risk_assessment", "amendment_drafting"],
                "best_for": "Complete policy review",
            },
            {
                "type": "comparison",
                "description": "Compare two policies",
                "agents": ["policy_analyst", "comparison", "stakeholder_impact"],
                "best_for": "Comparing policy versions",
            },
            {
                "type": "impact_simulation",
                "description": "Simulate policy change impacts",
                "agents": ["policy_analyst", "impact_simulation", "risk_assessment", "amendment_drafting"],
                "best_for": "What-if analysis before changes",
            },
            {
                "type": "knowledge_graph",
                "description": "Build clause dependency graph",
                "agents": ["policy_analyst", "clause_relationship", "conflict_detection"],
                "best_for": "Understanding clause structure",
            },
        ]
    }


@router.get("/session/{session_id}", summary="🧠 Get Session Memory")
def get_session(session_id: str):
    """Agent 13 — Memory Agent. Get conversation history and context."""
    return SessionMemory.get_session_summary(session_id)


@router.post("/session/set-policy", summary="📌 Set Active Policy in Session")
def set_policy(req: SetPolicyRequest):
    """Set which policy is active in this session."""
    SessionMemory.set_policy_context(req.session_id, req.policy_id)
    return {"session_id": req.session_id, "active_policy_id": req.policy_id, "status": "set"}


@router.delete("/session/{session_id}", summary="🗑️ Clear Session")
def clear_session(session_id: str):
    """Clear session memory."""
    SessionMemory.clear_session(session_id)
    return {"session_id": session_id, "status": "cleared"}
