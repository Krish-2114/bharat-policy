# Bharat Policy Twin v2 — Docker Setup Guide

## Prerequisites
- Docker Desktop (or Docker Engine + Compose v2)
- AWS account with **Amazon Bedrock access enabled** in your region for:
  - `amazon.titan-embed-text-v2:0` (embeddings — 1024-dim)
  - `anthropic.claude-3-haiku-20240307-v1:0` (LLM)

---

## Quick Start

### Step 1 — Configure `.env`

The `.env` file is at the project root (`bharat-fixed/.env`).
Edit it with your real AWS credentials:

```env
DATABASE_URL=postgresql://postgres:postgres@db:5432/bharat

AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=YOUR_KEY_HERE
AWS_SECRET_ACCESS_KEY=YOUR_SECRET_HERE
BEDROCK_EMBEDDING_MODEL_ID=amazon.titan-embed-text-v2:0
BEDROCK_LLM_MODEL_ID=anthropic.claude-3-haiku-20240307-v1:0
```

> ⚠️ Make sure Bedrock model access is enabled in your AWS console under  
> **Amazon Bedrock → Model Access** for both models above.

---

### Step 2 — Build and start

Run from the `infra/` directory:

```bash
cd bharat-fixed/infra
docker compose up --build
```

First run takes ~3–5 minutes to pull images and install Python packages.

---

### Step 3 — Verify

```bash
curl http://localhost:8000/health
# → {"status":"ok"}

curl http://localhost:8000/health/db
# → {"status":"ok","database":"connected"}
```

Open **http://localhost:8000/docs** for the full interactive Swagger UI.

---

## API Usage

### 1. Upload a Policy
```bash
curl -X POST http://localhost:8000/upload-policy \
  -F "title=My Policy" \
  -F "file=@policy.txt"
# → {"policy_id": 1, "clause_count": 12}
```

### 2. Ask a Question (RAG)
```bash
curl -X POST http://localhost:8000/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "What are the penalties?", "policy_id": 1}'
```

### 3. Run an Agent
```bash
curl -X POST http://localhost:8000/agents/analyze \
  -H "Content-Type: application/json" \
  -d '{"query": "Summarize obligations", "policy_id": 1}'
```

### 4. Run a LangGraph Workflow
```bash
curl -X POST http://localhost:8000/orchestrator/workflow \
  -H "Content-Type: application/json" \
  -d '{"query": "Is this compliant?", "workflow_type": "compliance_investigation", "policy_id": 1}'
```

---

## Swagger Endpoints

| Tag | Endpoint | Description |
|-----|----------|-------------|
| health | GET /health | Liveness check |
| health | GET /health/db | DB connectivity |
| upload | POST /upload-policy | Upload .txt or .pdf policy |
| policies | GET /policies | List all policies |
| policies | GET /policies/{id} | Get policy + clauses |
| query | POST /query | Semantic vector search |
| ask | POST /ask | RAG Q&A with citations |
| 🤖 Agents | POST /agents/analyze | Policy Analyst |
| 🤖 Agents | POST /agents/compliance | Compliance Evaluator |
| 🤖 Agents | POST /agents/compare | Policy Comparison |
| 🤖 Agents | POST /agents/gap-analysis | Gap Analysis |
| 🤖 Agents | POST /agents/risk | Risk Assessment |
| 🤖 Agents | POST /agents/simulate | Impact Simulation |
| 🤖 Agents | POST /agents/amend | Amendment Drafting |
| 🤖 Agents | POST /agents/stakeholders | Stakeholder Impact |
| 🤖 Agents | POST /agents/conflicts | Conflict Detection |
| 🤖 Agents | POST /agents/knowledge-graph | Clause Knowledge Graph |
| 🧠 Orchestrator | POST /orchestrator/auto | Auto-Route Agent |
| 🧠 Orchestrator | POST /orchestrator/workflow | LangGraph Workflow |
| 🧠 Orchestrator | GET /orchestrator/workflows | List Workflows |
| 🧠 Orchestrator | GET /orchestrator/session/{id} | Session Memory |

---

## Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| `503 Embedding service error` | AWS creds wrong or Bedrock not enabled | Check `.env` and enable model access in AWS Console |
| `503 LLM service error` | Claude model not accessible | Enable `anthropic.claude-3-haiku-20240307-v1:0` in Bedrock |
| `{"error": "No clauses found"}` | No policies uploaded yet | Upload a policy first via `/upload-policy` |
| DB health check keeps failing | Postgres still starting | Wait 30s, it retries automatically |
| Port 5432 conflict | Local Postgres running | `sudo systemctl stop postgresql` or change port in docker-compose |
| `ModuleNotFoundError` on startup | Wrong working directory | Run `docker compose up` from inside `infra/` folder |
| Hot-reload not working | File mount issue | Run `docker compose down && docker compose up --build` |

---

## Stop / Reset

```bash
# Stop containers (keeps DB data)
docker compose down

# Full reset (wipes DB volume)  
docker compose down -v
```

---

## Architecture

```
bharat-fixed/
├── .env                     ← Your AWS credentials + DB URL
├── apps/api/
│   ├── main.py              ← FastAPI app
│   ├── config.py            ← Env var config
│   ├── database.py          ← SQLAlchemy engine
│   ├── models.py            ← Policy + Clause ORM (pgvector embedding col)
│   ├── agents/              ← 10 specialized AI agents
│   ├── orchestrator/        ← LangGraph workflows + LangChain agent router
│   ├── rag/                 ← Bedrock Titan embeddings
│   └── routers/             ← FastAPI route handlers
├── db/base.py               ← SQLAlchemy declarative base
├── services/policy_service.py ← PDF/TXT ingestion → DB
├── utils/text_parser.py     ← Clause splitting
└── infra/
    ├── Dockerfile
    ├── docker-compose.yml   ← Loads ../.env automatically
    └── init.sql             ← CREATE EXTENSION vector
```
