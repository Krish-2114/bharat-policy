"""
/agents router — direct single-agent calls.
Each endpoint hits one specific agent.
All AWS/DB errors are caught and returned as proper HTTP 503/400 responses
instead of raw 500 Internal Server Errors.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from apps.api.database import get_db
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

router = APIRouter(prefix="/agents", tags=["🤖 Agents"])


def _safe_run(agent_fn):
    """Wrap agent execution to return 503 instead of 500 on AWS/infra errors."""
    try:
        return agent_fn()
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Agent error: {str(e)}")


# ── Request models ─────────────────────────────

class PolicyQueryRequest(BaseModel):
    query: str = "Summarize this policy"
    policy_id: int | None = None


class ScenarioRequest(BaseModel):
    scenario: str
    policy_id: int | None = None


class ComparisonRequest(BaseModel):
    policy_id_a: int
    policy_id_b: int


class FocusRequest(BaseModel):
    focus: str = "Full analysis"
    policy_id: int | None = None


class SimulationRequest(BaseModel):
    proposed_change: str
    policy_id: int | None = None


class PolicyIdRequest(BaseModel):
    policy_id: int | None = None


# ── Endpoints ─────────────────────────────────

@router.post("/analyze", summary="📄 Policy Analyst Agent")
def run_policy_analyst(req: PolicyQueryRequest, db: Session = Depends(get_db)):
    """Summarize policy, extract obligations, deadlines, penalties, stakeholders."""
    return _safe_run(lambda: PolicyAnalystAgent().run(db, query=req.query, policy_id=req.policy_id))


@router.post("/compliance", summary="⚖️ Compliance Evaluation Agent")
def run_compliance(req: ScenarioRequest, db: Session = Depends(get_db)):
    """Evaluate if a scenario violates policy. Returns verdict + risk level."""
    return _safe_run(lambda: ComplianceAgent().run(db, scenario=req.scenario, policy_id=req.policy_id))


@router.post("/compare", summary="🔄 Policy Comparison Agent")
def run_comparison(req: ComparisonRequest, db: Session = Depends(get_db)):
    """Compare two policies side by side."""
    return _safe_run(lambda: ComparisonAgent().run(db, policy_id_a=req.policy_id_a, policy_id_b=req.policy_id_b))


@router.post("/gap-analysis", summary="🔎 Gap Analysis Agent")
def run_gap_analysis(req: FocusRequest, db: Session = Depends(get_db)):
    """Find missing compliance areas, undefined responsibilities, weak enforcement."""
    return _safe_run(lambda: GapAnalysisAgent().run(db, focus_area=req.focus, policy_id=req.policy_id))


@router.post("/risk", summary="🚨 Risk Assessment Agent")
def run_risk_assessment(req: FocusRequest, db: Session = Depends(get_db)):
    """Score ambiguity, enforcement weakness, financial exposure, operational risk."""
    return _safe_run(lambda: RiskAssessmentAgent().run(db, context=req.focus, policy_id=req.policy_id))


@router.post("/simulate", summary="🧪 Impact Simulation Agent")
def run_simulation(req: SimulationRequest, db: Session = Depends(get_db)):
    """Simulate what happens if a policy change is made."""
    return _safe_run(lambda: ImpactSimulationAgent().run(db, proposed_change=req.proposed_change, policy_id=req.policy_id))


@router.post("/amend", summary="✏️ Amendment Drafting Agent")
def run_amendment(req: FocusRequest, db: Session = Depends(get_db)):
    """Suggest improved clause wording and stronger compliance language."""
    return _safe_run(lambda: AmendmentDraftingAgent().run(db, focus=req.focus, policy_id=req.policy_id))


@router.post("/stakeholders", summary="👥 Stakeholder Impact Agent")
def run_stakeholder(req: FocusRequest, db: Session = Depends(get_db)):
    """Analyze impact on employees, government, vendors, and citizens."""
    return _safe_run(lambda: StakeholderImpactAgent().run(db, context=req.focus, policy_id=req.policy_id))


@router.post("/conflicts", summary="⚡ Conflict Detection Agent")
def run_conflict_detection(req: PolicyIdRequest, db: Session = Depends(get_db)):
    """Detect contradictions and logical inconsistencies between clauses."""
    return _safe_run(lambda: ConflictDetectionAgent().run(db, policy_id=req.policy_id))


@router.post("/knowledge-graph", summary="🕸️ Clause Relationship Agent")
def run_knowledge_graph(req: PolicyIdRequest, db: Session = Depends(get_db)):
    """Build dependency graph and cross-reference map of all clauses."""
    return _safe_run(lambda: ClauseRelationshipAgent().run(db, policy_id=req.policy_id))
