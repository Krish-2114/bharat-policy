"""
Structured Logging + Agent Execution Tracing.

Every agent call is:
  - timed (latency_ms)
  - token-counted (estimated)
  - logged to DB (agent_logs table)
  - logged to structured JSON log

Usage:
    with AgentTrace(db, agent_name="compliance", session_id=..., policy_id=...) as trace:
        result = agent.run(...)
        trace.record(result, retrieval_scores=[0.87, 0.82])
"""

from __future__ import annotations

import json
import logging
import time
import uuid
from contextlib import contextmanager
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any

from sqlalchemy import text
from sqlalchemy.orm import Session

# ── Structured JSON logger ──────────────────────────────────────────
class JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        log = {
            "ts": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "msg": record.getMessage(),
        }
        if hasattr(record, "extra"):
            log.update(record.extra)
        return json.dumps(log)


def get_logger(name: str) -> logging.Logger:
    logger = logging.getLogger(name)
    if not logger.handlers:
        handler = logging.StreamHandler()
        handler.setFormatter(JsonFormatter())
        logger.addHandler(handler)
        logger.setLevel(logging.INFO)
        logger.propagate = False
    return logger


# ── Token estimation (simple heuristic: 1 token ≈ 4 chars) ─────────
def estimate_tokens(text: str) -> int:
    return max(1, len(text) // 4)


# ── Agent Trace context manager ─────────────────────────────────────
@dataclass
class AgentTrace:
    db: Session
    agent_name: str
    session_id: str | None = None
    workflow_type: str | None = None
    policy_id: int | None = None
    query: str = ""

    # filled during execution
    _start_time: float = field(default_factory=time.time, init=False)
    _llm_start: float | None = field(default=None, init=False)
    _llm_latency_ms: int = field(default=0, init=False)
    _status: str = field(default="success", init=False)
    _confidence: float | None = field(default=None, init=False)
    _retrieval_avg: float | None = field(default=None, init=False)
    _retrieval_count: int = field(default=0, init=False)
    _input_tokens: int = field(default=0, init=False)
    _output_tokens: int = field(default=0, init=False)
    _error: str | None = field(default=None, init=False)

    _logger: logging.Logger = field(init=False)

    def __post_init__(self):
        self._logger = get_logger(f"agent.{self.agent_name}")
        self._start_time = time.time()

    def __enter__(self):
        self._logger.info(
            f"▶ START {self.agent_name}",
            extra={"extra": {
                "agent": self.agent_name,
                "session_id": self.session_id,
                "policy_id": self.policy_id,
                "query_preview": (self.query or "")[:80],
            }}
        )
        return self

    def mark_llm_start(self, prompt: str = ""):
        self._llm_start = time.time()
        self._input_tokens = estimate_tokens(prompt)

    def mark_llm_end(self, output: str = ""):
        if self._llm_start:
            self._llm_latency_ms = int((time.time() - self._llm_start) * 1000)
        self._output_tokens = estimate_tokens(output)

    def record(
        self,
        result: dict,
        retrieval_scores: list[float] | None = None,
        confidence: float | None = None,
    ):
        """Record agent result into the trace."""
        if retrieval_scores:
            self._retrieval_avg = round(sum(retrieval_scores) / len(retrieval_scores), 4)
            self._retrieval_count = len(retrieval_scores)

        if confidence is not None:
            self._confidence = confidence
        elif retrieval_scores:
            # derive confidence from retrieval quality
            self._confidence = round(min(self._retrieval_avg * 1.1, 1.0), 4)

        if "error" in result and result.get("error"):
            self._status = "error" if "fallback" not in str(result.get("error", "")) else "fallback"

    def set_error(self, error: str):
        self._status = "error"
        self._error = error

    def __exit__(self, exc_type, exc_val, exc_tb):
        total_ms = int((time.time() - self._start_time) * 1000)

        if exc_type is not None:
            self._status = "error"
            self._error = str(exc_val)

        self._logger.info(
            f"■ END {self.agent_name} [{self._status}] {total_ms}ms",
            extra={"extra": {
                "agent": self.agent_name,
                "status": self._status,
                "total_latency_ms": total_ms,
                "llm_latency_ms": self._llm_latency_ms,
                "confidence": self._confidence,
                "retrieval_avg": self._retrieval_avg,
                "input_tokens": self._input_tokens,
                "output_tokens": self._output_tokens,
            }}
        )

        # Write to DB
        try:
            self.db.execute(text("""
                INSERT INTO agent_logs (
                    session_id, agent_name, workflow_type, policy_id, query,
                    status, confidence_score, retrieval_score_avg,
                    retrieval_clause_count, llm_latency_ms, total_latency_ms,
                    input_tokens, output_tokens, error_message
                ) VALUES (
                    :sid, :agent, :wf, :pid, :q,
                    :status, :conf, :ret_avg,
                    :ret_cnt, :llm_ms, :total_ms,
                    :in_tok, :out_tok, :err
                )
            """), {
                "sid": self.session_id,
                "agent": self.agent_name,
                "wf": self.workflow_type,
                "pid": self.policy_id,
                "q": (self.query or "")[:500],
                "status": self._status,
                "conf": self._confidence,
                "ret_avg": self._retrieval_avg,
                "ret_cnt": self._retrieval_count,
                "llm_ms": self._llm_latency_ms,
                "total_ms": total_ms,
                "in_tok": self._input_tokens,
                "out_tok": self._output_tokens,
                "err": self._error,
            })
            self.db.commit()
        except Exception as e:
            self._logger.error(f"Failed to write agent log: {e}")

        return False  # don't suppress exceptions
