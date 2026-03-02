"""
Metrics aggregation — reads from agent_logs table.
Provides: agent performance, token usage, latency percentiles, error rates.
"""

from sqlalchemy import text
from sqlalchemy.orm import Session


def get_agent_metrics(db: Session, hours: int = 24) -> dict:
    """Agent-level performance metrics over last N hours."""
    rows = db.execute(text("""
        SELECT
            agent_name,
            COUNT(*) AS total_calls,
            SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) AS successes,
            SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) AS errors,
            SUM(CASE WHEN status = 'fallback' THEN 1 ELSE 0 END) AS fallbacks,
            ROUND(AVG(total_latency_ms)::numeric, 0) AS avg_latency_ms,
            ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY total_latency_ms)::numeric, 0) AS p50_latency_ms,
            ROUND(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY total_latency_ms)::numeric, 0) AS p95_latency_ms,
            ROUND(AVG(confidence_score)::numeric, 4) AS avg_confidence,
            ROUND(AVG(retrieval_score_avg)::numeric, 4) AS avg_retrieval_score,
            SUM(input_tokens) AS total_input_tokens,
            SUM(output_tokens) AS total_output_tokens,
            ROUND(AVG(llm_latency_ms)::numeric, 0) AS avg_llm_latency_ms
        FROM agent_logs
        WHERE created_at > NOW() - INTERVAL ':hours hours'
        GROUP BY agent_name
        ORDER BY total_calls DESC
    """.replace(":hours hours", f"{hours} hours"))).fetchall()

    return {
        "window_hours": hours,
        "agents": [
            {
                "agent_name": r.agent_name,
                "total_calls": r.total_calls,
                "successes": r.successes,
                "errors": r.errors,
                "fallbacks": r.fallbacks,
                "success_rate": round(r.successes / r.total_calls, 4) if r.total_calls else 0,
                "avg_latency_ms": int(r.avg_latency_ms or 0),
                "p50_latency_ms": int(r.p50_latency_ms or 0),
                "p95_latency_ms": int(r.p95_latency_ms or 0),
                "avg_confidence": float(r.avg_confidence or 0),
                "avg_retrieval_score": float(r.avg_retrieval_score or 0),
                "total_input_tokens": r.total_input_tokens or 0,
                "total_output_tokens": r.total_output_tokens or 0,
                "avg_llm_latency_ms": int(r.avg_llm_latency_ms or 0),
            }
            for r in rows
        ],
    }


def get_session_trace(db: Session, session_id: str) -> dict:
    """Full execution trace for a session."""
    rows = db.execute(text("""
        SELECT agent_name, status, confidence_score, retrieval_score_avg,
               llm_latency_ms, total_latency_ms, input_tokens, output_tokens,
               error_message, created_at
        FROM agent_logs
        WHERE session_id = :sid
        ORDER BY created_at ASC
    """), {"sid": session_id}).fetchall()

    return {
        "session_id": session_id,
        "total_steps": len(rows),
        "total_tokens": sum((r.input_tokens or 0) + (r.output_tokens or 0) for r in rows),
        "total_latency_ms": sum(r.total_latency_ms or 0 for r in rows),
        "trace": [
            {
                "agent": r.agent_name,
                "status": r.status,
                "confidence": r.confidence_score,
                "retrieval_avg": r.retrieval_score_avg,
                "llm_ms": r.llm_latency_ms,
                "total_ms": r.total_latency_ms,
                "tokens_in": r.input_tokens,
                "tokens_out": r.output_tokens,
                "error": r.error_message,
                "timestamp": r.created_at.isoformat() if r.created_at else None,
            }
            for r in rows
        ],
    }


def get_error_report(db: Session, hours: int = 24) -> dict:
    """Recent errors and failure patterns."""
    rows = db.execute(text(f"""
        SELECT agent_name, error_message, COUNT(*) as occurrences,
               MAX(created_at) as last_seen
        FROM agent_logs
        WHERE status = 'error'
          AND created_at > NOW() - INTERVAL '{hours} hours'
          AND error_message IS NOT NULL
        GROUP BY agent_name, error_message
        ORDER BY occurrences DESC
        LIMIT 20
    """)).fetchall()

    return {
        "window_hours": hours,
        "errors": [
            {
                "agent": r.agent_name,
                "error": r.error_message,
                "occurrences": r.occurrences,
                "last_seen": r.last_seen.isoformat() if r.last_seen else None,
            }
            for r in rows
        ],
    }


def get_token_usage_summary(db: Session, hours: int = 24) -> dict:
    """Token usage and estimated cost summary."""
    row = db.execute(text(f"""
        SELECT
            SUM(input_tokens) AS total_input,
            SUM(output_tokens) AS total_output,
            COUNT(*) AS total_calls,
            AVG(input_tokens) AS avg_input,
            AVG(output_tokens) AS avg_output
        FROM agent_logs
        WHERE created_at > NOW() - INTERVAL '{hours} hours'
    """)).fetchone()

    total_input = row.total_input or 0
    total_output = row.total_output or 0

    # Claude Haiku approximate pricing: $0.00025/1K input, $0.00125/1K output
    est_cost_usd = (total_input / 1000 * 0.00025) + (total_output / 1000 * 0.00125)

    return {
        "window_hours": hours,
        "total_input_tokens": total_input,
        "total_output_tokens": total_output,
        "total_tokens": total_input + total_output,
        "total_calls": row.total_calls or 0,
        "avg_input_tokens": round(float(row.avg_input or 0), 1),
        "avg_output_tokens": round(float(row.avg_output or 0), 1),
        "estimated_cost_usd": round(est_cost_usd, 6),
    }
