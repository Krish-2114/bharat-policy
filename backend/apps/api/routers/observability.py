"""
/observability router — metrics, traces, token usage, error reports.
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from apps.api.database import get_db
from apps.api.observability.metrics import (
    get_agent_metrics, get_session_trace, get_error_report, get_token_usage_summary
)

router = APIRouter(prefix="/observability", tags=["📊 Observability"])


@router.get("/metrics", summary="📈 Agent Performance Metrics")
def agent_metrics(hours: int = Query(24, description="Time window in hours"), db: Session = Depends(get_db)):
    """Latency percentiles, success rates, confidence averages per agent."""
    return get_agent_metrics(db, hours=hours)


@router.get("/trace/{session_id}", summary="🔍 Session Execution Trace")
def session_trace(session_id: str, db: Session = Depends(get_db)):
    """Full step-by-step trace for a session — all agents, latencies, tokens."""
    return get_session_trace(db, session_id)


@router.get("/errors", summary="🚨 Error Report")
def error_report(hours: int = Query(24, description="Time window in hours"), db: Session = Depends(get_db)):
    """Recent errors and failure patterns by agent."""
    return get_error_report(db, hours=hours)


@router.get("/tokens", summary="🪙 Token Usage & Cost")
def token_usage(hours: int = Query(24, description="Time window in hours"), db: Session = Depends(get_db)):
    """Total tokens consumed, estimated AWS Bedrock cost."""
    return get_token_usage_summary(db, hours=hours)


@router.get("/health-detailed", summary="🏥 Detailed System Health")
def detailed_health(db: Session = Depends(get_db)):
    """System health with DB stats, vector store status, recent activity."""
    from sqlalchemy import text
    try:
        policy_count = db.execute(text("SELECT COUNT(*) FROM policies")).scalar()
        clause_count = db.execute(text("SELECT COUNT(*) FROM clauses")).scalar()
        embedded_count = db.execute(text("SELECT COUNT(*) FROM clauses WHERE embedding IS NOT NULL")).scalar()
        log_count = db.execute(text("SELECT COUNT(*) FROM agent_logs")).scalar()
        recent_calls = db.execute(text(
            "SELECT COUNT(*) FROM agent_logs WHERE created_at > NOW() - INTERVAL '1 hour'"
        )).scalar()

        return {
            "status": "healthy",
            "database": "connected",
            "vector_store": {
                "policies": policy_count,
                "total_clauses": clause_count,
                "embedded_clauses": embedded_count,
                "embedding_coverage": round(embedded_count / clause_count, 4) if clause_count else 0,
            },
            "observability": {
                "total_agent_calls_logged": log_count,
                "calls_last_hour": recent_calls,
            }
        }
    except Exception as e:
        return {"status": "degraded", "error": str(e)}
