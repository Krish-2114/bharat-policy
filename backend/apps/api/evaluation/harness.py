"""
Agent Evaluation Harness.

Runs predefined scenarios against agents, measures:
  - Verdict accuracy (for compliance)
  - Field completeness (all expected fields present)
  - Confidence score quality
  - Retrieval precision
  - Latency
  - Pass/fail per scenario
"""

from __future__ import annotations

import uuid
import time
import logging
from typing import Any

from sqlalchemy import text
from sqlalchemy.orm import Session

from apps.api.evaluation.scenarios import EVAL_SCENARIOS

logger = logging.getLogger(__name__)


def run_eval_suite(
    db: Session,
    policy_id: int,
    scenario_tags: list[str] | None = None,
    run_id: str | None = None,
) -> dict:
    """
    Run all (or filtered) evaluation scenarios.
    Returns full benchmark report.
    """
    from apps.api.agents.compliance_agent import ComplianceAgent
    from apps.api.agents.policy_analyst import PolicyAnalystAgent
    from apps.api.agents.risk_agent import RiskAssessmentAgent
    from apps.api.agents.gap_analysis_agent import GapAnalysisAgent
    from apps.api.agents.amendment_agent import AmendmentDraftingAgent

    agent_map = {
        "compliance": ComplianceAgent,
        "policy_analyst": PolicyAnalystAgent,
        "risk_assessment": RiskAssessmentAgent,
        "gap_analysis": GapAnalysisAgent,
        "amendment_drafting": AmendmentDraftingAgent,
    }

    run_id = run_id or str(uuid.uuid4())[:8]
    scenarios = EVAL_SCENARIOS

    if scenario_tags:
        scenarios = [s for s in scenarios if any(t in s.get("tags", []) for t in scenario_tags)]

    results = []
    for scenario in scenarios:
        agent_name = scenario["agent"]
        agent_cls = agent_map.get(agent_name)
        if not agent_cls:
            continue

        logger.info(f"🧪 Eval: {scenario['name']}")
        start = time.time()
        passed = False
        notes = []
        verdict = None
        confidence = None
        retrieval_precision = None

        try:
            agent = agent_cls()
            query = scenario["input"]

            if agent_name == "compliance":
                output = agent.run(db, scenario=query, policy_id=policy_id)
                verdict = output.get("verdict", "")
                expected_verdicts = scenario.get("expected_verdict_contains", [])
                if expected_verdicts:
                    passed = verdict in expected_verdicts
                    if not passed:
                        notes.append(f"Expected verdict in {expected_verdicts}, got '{verdict}'")

            elif agent_name == "policy_analyst":
                output = agent.run(db, query=query, policy_id=policy_id)
                expected_fields = scenario.get("expected_fields", [])
                missing = [f for f in expected_fields if f not in output or not output[f]]
                passed = len(missing) == 0
                if missing:
                    notes.append(f"Missing fields: {missing}")

            elif agent_name == "risk_assessment":
                output = agent.run(db, context=query, policy_id=policy_id)
                expected_fields = scenario.get("expected_fields", [])
                score_range = scenario.get("expected_score_range")
                missing = [f for f in expected_fields if f not in output]
                score_ok = True
                if score_range and "overall_risk_score" in output:
                    s = output["overall_risk_score"]
                    score_ok = score_range[0] <= s <= score_range[1]
                    if not score_ok:
                        notes.append(f"Risk score {s} out of range {score_range}")
                passed = len(missing) == 0 and score_ok

            elif agent_name == "gap_analysis":
                output = agent.run(db, focus_area=query, policy_id=policy_id)
                expected_fields = scenario.get("expected_fields", [])
                missing = [f for f in expected_fields if f not in output or not output[f]]
                passed = len(missing) == 0

            elif agent_name == "amendment_drafting":
                output = agent.run(db, focus=query, policy_id=policy_id)
                expected_fields = scenario.get("expected_fields", [])
                missing = [f for f in expected_fields if f not in output]
                passed = len(missing) == 0

            else:
                output = {}
                notes.append("Unknown agent")

            # Extract confidence
            conf_data = output.get("confidence", {})
            confidence = conf_data.get("score") if isinstance(conf_data, dict) else None

            # Retrieval precision = avg score of source clauses
            source_clauses = output.get("source_clauses", [])
            if source_clauses:
                scores = [c.get("score", 0) for c in source_clauses if isinstance(c, dict)]
                retrieval_precision = round(sum(scores) / len(scores), 4) if scores else None

            # Check for errors
            if output.get("error") == "insufficient_information":
                passed = False
                notes.append("Insufficient information returned")

        except Exception as e:
            notes.append(f"Exception: {str(e)}")
            output = {}
            passed = False

        latency_ms = int((time.time() - start) * 1000)

        result = {
            "eval_run_id": run_id,
            "scenario_name": scenario["name"],
            "agent_name": agent_name,
            "policy_id": policy_id,
            "input_query": scenario["input"],
            "expected_verdict": str(scenario.get("expected_verdict_contains", "")),
            "actual_verdict": verdict,
            "verdict_correct": passed if verdict else None,
            "confidence_score": confidence,
            "retrieval_precision": retrieval_precision,
            "latency_ms": latency_ms,
            "passed": passed,
            "notes": "; ".join(notes) if notes else None,
        }

        # Save to DB
        try:
            db.execute(text("""
                INSERT INTO eval_results (
                    eval_run_id, scenario_name, agent_name, policy_id,
                    input_query, expected_verdict, actual_verdict, verdict_correct,
                    confidence_score, retrieval_precision, latency_ms, passed, notes
                ) VALUES (
                    :eval_run_id, :scenario_name, :agent_name, :policy_id,
                    :input_query, :expected_verdict, :actual_verdict, :verdict_correct,
                    :confidence_score, :retrieval_precision, :latency_ms, :passed, :notes
                )
            """), result)
            db.commit()
        except Exception as e:
            logger.error(f"Failed to save eval result: {e}")

        results.append(result)
        logger.info(f"  {'✅' if passed else '❌'} {scenario['name']} — {latency_ms}ms")

    # Summary stats
    total = len(results)
    passed_count = sum(1 for r in results if r["passed"])
    avg_latency = round(sum(r["latency_ms"] for r in results) / total, 0) if total else 0
    avg_confidence = None
    conf_vals = [r["confidence_score"] for r in results if r["confidence_score"] is not None]
    if conf_vals:
        avg_confidence = round(sum(conf_vals) / len(conf_vals), 4)

    return {
        "eval_run_id": run_id,
        "policy_id": policy_id,
        "total_scenarios": total,
        "passed": passed_count,
        "failed": total - passed_count,
        "pass_rate": round(passed_count / total, 4) if total else 0,
        "avg_latency_ms": avg_latency,
        "avg_confidence": avg_confidence,
        "results": results,
    }


def get_eval_history(db: Session, limit: int = 50) -> dict:
    """Get recent evaluation run summaries."""
    rows = db.execute(text(f"""
        SELECT eval_run_id,
               COUNT(*) as total,
               SUM(CASE WHEN passed THEN 1 ELSE 0 END) as passed,
               ROUND(AVG(confidence_score)::numeric, 4) as avg_confidence,
               ROUND(AVG(retrieval_precision)::numeric, 4) as avg_retrieval,
               ROUND(AVG(latency_ms)::numeric, 0) as avg_latency,
               MAX(created_at) as run_time
        FROM eval_results
        GROUP BY eval_run_id
        ORDER BY MAX(created_at) DESC
        LIMIT {limit}
    """)).fetchall()

    return {
        "runs": [
            {
                "eval_run_id": r.eval_run_id,
                "total": r.total,
                "passed": r.passed,
                "pass_rate": round(r.passed / r.total, 4) if r.total else 0,
                "avg_confidence": float(r.avg_confidence or 0),
                "avg_retrieval": float(r.avg_retrieval or 0),
                "avg_latency_ms": int(r.avg_latency or 0),
                "run_time": r.run_time.isoformat() if r.run_time else None,
            }
            for r in rows
        ]
    }
