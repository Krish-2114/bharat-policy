"""Bharat Policy Twin v3.0 — Elite Tier."""

import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from apps.api.database import engine, Base
import apps.api.models  # noqa

from apps.api.routers.auth import router as auth_router
from apps.api.routers.health import router as health_router
from apps.api.routers.upload import router as upload_router
from apps.api.routers.policy import router as policy_router
from apps.api.routers.query import router as query_router
from apps.api.routers.ask import router as ask_router
from apps.api.routers.agents import router as agents_router
from apps.api.routers.orchestrator import router as orchestrator_router
from apps.api.routers.observability import router as observability_router
from apps.api.routers.evaluation import router as evaluation_router

# Configure root logger for structured output
logging.basicConfig(
    level=logging.INFO,
    format='{"ts":"%(asctime)s","level":"%(levelname)s","logger":"%(name)s","msg":"%(message)s"}',
)

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="🇮🇳 Bharat Policy Twin — Elite",
    description="""
## National-Scale Agentic AI System — Elite Tier v3.0

### ✅ Elite Capabilities
| Layer | Status |
|---|---|
| Persistent PGVector Store (IVFFlat index) | ✅ Production |
| Confidence Scoring & Guardrails | ✅ All agents |
| Insufficient Info Detection | ✅ Hallucination-safe |
| LangGraph with Error Recovery | ✅ Adaptive |
| Self-Evaluation Node | ✅ Quality scored |
| Structured Observability | ✅ Full traces |
| Token Usage & Cost Tracking | ✅ Per call |
| Evaluation & Benchmarking | ✅ Automated |
| 13 Specialized Agents | ✅ Complete |

### API Groups
- `/agents/*` — Direct single-agent calls
- `/orchestrator/*` — Multi-agent workflows (LangGraph)
- `/observability/*` — Metrics, traces, costs
- `/evaluation/*` — Benchmark runner
    """,
    version="3.0.0",
)

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

app.include_router(auth_router)
app.include_router(health_router)
app.include_router(upload_router)
app.include_router(policy_router)
app.include_router(query_router)
app.include_router(ask_router)
app.include_router(agents_router)
app.include_router(orchestrator_router)
app.include_router(observability_router)
app.include_router(evaluation_router)


@app.get("/", include_in_schema=False)
def root():
    return {"name": "Bharat Policy Twin", "version": "3.0.0", "tier": "Elite", "docs": "/docs"}
