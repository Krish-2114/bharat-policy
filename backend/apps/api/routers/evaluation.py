"""
/evaluation router — run benchmarks, view eval history.
"""

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from apps.api.database import get_db
from apps.api.evaluation.harness import run_eval_suite, get_eval_history

router = APIRouter(prefix="/evaluation", tags=["🧪 Evaluation"])


class EvalRequest(BaseModel):
    policy_id: int
    tags: list[str] | None = None
    run_id: str | None = None


@router.post("/run", summary="🧪 Run Evaluation Suite")
def run_evaluation(req: EvalRequest, db: Session = Depends(get_db)):
    """
    Run predefined benchmark scenarios against your agents.
    Measures accuracy, confidence, retrieval precision, latency.
    Returns pass/fail for each scenario + aggregate stats.
    """
    return run_eval_suite(db, policy_id=req.policy_id, scenario_tags=req.tags, run_id=req.run_id)


@router.get("/history", summary="📋 Evaluation Run History")
def eval_history(limit: int = Query(20), db: Session = Depends(get_db)):
    """View all past evaluation runs with aggregate scores."""
    return get_eval_history(db, limit=limit)


@router.get("/scenarios", summary="📝 List Eval Scenarios")
def list_scenarios():
    """List all predefined test scenarios."""
    from apps.api.evaluation.scenarios import EVAL_SCENARIOS
    return {
        "total": len(EVAL_SCENARIOS),
        "scenarios": [
            {"name": s["name"], "agent": s["agent"], "tags": s.get("tags", []), "input": s["input"]}
            for s in EVAL_SCENARIOS
        ]
    }
