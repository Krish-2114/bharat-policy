# 🇮🇳 Bharat Policy Twin — Full Stack

**Agentic AI system for Indian policy analysis with OTP-based authentication.**

---

## 📁 Project Structure

```
bharat-policy-twin/
├── backend/                  ← FastAPI + LangGraph + pgvector
│   ├── apps/api/
│   │   ├── agents/           ← 13 specialized AI agents
│   │   ├── orchestrator/     ← LangGraph multi-agent workflow
│   │   ├── routers/          ← REST API routes (auth, upload, query...)
│   │   ├── rag/              ← AWS Bedrock embeddings + pgvector
│   │   └── main.py           ← FastAPI app entry point
│   ├── infra/
│   │   ├── Dockerfile
│   │   ├── docker-compose.yml
│   │   └── init.sql          ← pgvector schema setup
│   ├── .env                  ← Backend secrets (JWT, SMTP, AWS)
│   └── requirements.txt
│
├── frontend/                 ← Next.js 16 + Tailwind + TypeScript
│   ├── app/                  ← Next.js App Router pages
│   │   ├── dashboard/        ← Main dashboard
│   │   ├── login/            ← OTP login
│   │   ├── signup/           ← Registration
│   │   ├── upload/           ← Policy upload
│   │   ├── policies/         ← Policy browser
│   │   └── query/            ← AI chat interface
│   ├── components/           ← React components
│   ├── context/AuthContext.tsx ← JWT auth state
│   ├── lib/
│   │   ├── auth.ts           ← OTP + JWT auth (connected to backend)
│   │   └── api.ts            ← All API calls with JWT Bearer headers
│   └── .env.local            ← NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
│
└── docker-compose.yml        ← Runs db + api + frontend together
```

---

## 🚀 How to Run (Docker — Recommended)

```bash
# 1. Clone / unzip this project
# 2. Configure backend secrets
cp backend/.env backend/.env   # already pre-filled, check AWS + SMTP keys

# 3. Start everything
docker-compose up --build
```

| Service  | URL                       |
|----------|---------------------------|
| Frontend | http://localhost:3000     |
| Backend  | http://localhost:8000     |
| API Docs | http://localhost:8000/docs|

---

## 🔐 Authentication Flow

```
User enters email → POST /auth/send-otp → Gmail sends 6-digit OTP
User enters OTP  → POST /auth/verify-otp → Backend returns JWT token
Frontend stores JWT in localStorage → All API calls use Bearer <token>
```

- OTP expires in **10 minutes**
- JWT expires in **60 minutes** (configurable in backend `.env`)
- Backend: `JWT_SECRET_KEY` in `backend/.env` — **change this before production!**

---

## 🖥️ How to Run Locally (Without Docker)

### Backend
```bash
cd backend
pip install -r requirements.txt

# Start PostgreSQL separately (or use Docker just for db):
# docker run -e POSTGRES_PASSWORD=postgres -p 5432:5432 pgvector/pgvector:pg16

uvicorn apps.api.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:3000
```

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET_KEY` | Change to a strong random secret |
| `SMTP_USER` / `SMTP_PASSWORD` | Gmail App Password for OTP emails |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | AWS Bedrock credentials |
| `BEDROCK_LLM_MODEL_ID` | Claude model for agents |

### Frontend (`frontend/.env.local`)
| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | Backend URL (default: http://localhost:8000) |

---

## 🤖 AI Agents (13 Total)
- **Policy Analyst** — Core policy understanding
- **Risk Agent** — Risk identification
- **Compliance Agent** — Regulatory compliance checks
- **Gap Analysis Agent** — Policy gap detection
- **Amendment Agent** — Suggests amendments
- **Conflict Agent** — Identifies conflicts between policies
- **Comparison Agent** — Side-by-side policy comparison
- **Stakeholder Agent** — Stakeholder impact analysis
- **Simulation Agent** — Policy simulation
- **Clause Relationship Agent** — Clause dependency mapping
- **Memory Agent** — Conversation memory
- And more via `/orchestrator/` multi-agent workflow

---

## 📝 Notes
- **AWS credentials** in `backend/.env` are pre-filled — rotate them before deploying
- **Gmail SMTP** is pre-configured — the App Password is in `.env`
- **Aadhaar field** on signup is frontend-only (not stored in backend currently)
- The `backend/.dockerignore` excludes `__pycache__`, `.venv`, etc.
