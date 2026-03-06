<div align="center">

# 🇮🇳 Bharat Policy Twin

### National-Scale Agentic AI System for Real-Time Public Policy Execution Intelligence

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115.6-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-16.1.6-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![LangGraph](https://img.shields.io/badge/LangGraph-0.2.45-FF6B35?style=for-the-badge)](https://langgraph.com)
[![AWS Bedrock](https://img.shields.io/badge/AWS_Bedrock-Claude-FF9900?style=for-the-badge&logo=amazon-aws&logoColor=white)](https://aws.amazon.com/bedrock)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-pgvector-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://github.com/pgvector/pgvector)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://docker.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![Version](https://img.shields.io/badge/Version-3.0.0_Elite-gold?style=for-the-badge)](CHANGELOG.md)

---

> **Bharat Policy Twin** is a production-grade, full-stack agentic AI platform that transforms uploaded government policy documents into actionable intelligence — through 13 specialized AI agents, a LangGraph multi-agent orchestration engine, semantic RAG with AWS Bedrock + pgvector, OTP-based authentication, full observability, automated evaluation, and a beautiful Next.js dashboard.

---

<img src="frontend/public/dashboard-mockup.png" alt="Bharat Policy Twin Dashboard" width="880" />

</div>

---

## 📋 Table of Contents

- [🎯 Project Vision](#-project-vision)
- [✨ Feature Highlights](#-feature-highlights)
- [🏗️ System Architecture](#️-system-architecture)
  - [High-Level Layered Design](#high-level-layered-design)
  - [Request Lifecycle](#request-lifecycle)
  - [Data Flow Diagrams](#data-flow-diagrams)
- [📁 Repository Structure](#-repository-structure)
  - [Backend Structure](#backend-structure)
  - [Frontend Structure](#frontend-structure)
- [🤖 The 13 AI Agents — Deep Dive](#-the-13-ai-agents--deep-dive)
  - [BaseAgent — Shared Intelligence Layer](#baseagent--shared-intelligence-layer)
  - [Policy Analyst Agent](#1-policy-analyst-agent)
  - [Compliance Agent](#2-compliance-agent)
  - [Risk Assessment Agent](#3-risk-assessment-agent)
  - [Gap Analysis Agent](#4-gap-analysis-agent)
  - [Amendment Drafting Agent](#5-amendment-drafting-agent)
  - [Conflict Detection Agent](#6-conflict-detection-agent)
  - [Comparison Agent](#7-comparison-agent)
  - [Stakeholder Impact Agent](#8-stakeholder-impact-agent)
  - [Simulation Agent](#9-simulation-agent)
  - [Clause Relationship Agent](#10-clause-relationship-agent)
  - [Memory Agent](#11-memory-agent)
  - [Additional Orchestrated Agents](#additional-orchestrated-agents)
- [🔗 LangGraph Orchestration Engine](#-langgraph-orchestration-engine)
  - [Workflow State Machine](#workflow-state-machine)
  - [Adaptive Branching Logic](#adaptive-branching-logic)
  - [Error Recovery Nodes](#error-recovery-nodes)
  - [Self-Evaluation Node](#self-evaluation-node)
- [🧠 RAG Pipeline — Retrieval-Augmented Generation](#-rag-pipeline--retrieval-augmented-generation)
  - [Document Ingestion Pipeline](#document-ingestion-pipeline)
  - [Embedding Strategy](#embedding-strategy)
  - [pgvector IVFFlat Index](#pgvector-ivfflat-index)
  - [Retrieval & Confidence Scoring](#retrieval--confidence-scoring)
  - [Guardrails & Hallucination Prevention](#guardrails--hallucination-prevention)
- [🔐 Authentication System](#-authentication-system)
  - [OTP Email Flow](#otp-email-flow)
  - [JWT Token Lifecycle](#jwt-token-lifecycle)
  - [Protected Routes](#protected-routes)
- [📡 API Reference](#-api-reference)
  - [Authentication Endpoints](#authentication-endpoints)
  - [Policy Management Endpoints](#policy-management-endpoints)
  - [Agent Endpoints](#agent-endpoints)
  - [Orchestrator Endpoints](#orchestrator-endpoints)
  - [Observability Endpoints](#observability-endpoints)
  - [Evaluation Endpoints](#evaluation-endpoints)
- [📊 Observability & Monitoring](#-observability--monitoring)
  - [AgentTrace System](#agenttrace-system)
  - [Metrics Dashboard](#metrics-dashboard)
  - [Token Usage & Cost Tracking](#token-usage--cost-tracking)
  - [Error Reporting](#error-reporting)
  - [Session Tracing](#session-tracing)
- [🧪 Evaluation & Benchmarking](#-evaluation--benchmarking)
  - [Evaluation Harness](#evaluation-harness)
  - [Predefined Scenarios](#predefined-scenarios)
  - [Benchmark Metrics](#benchmark-metrics)
- [🗄️ Database Schema](#️-database-schema)
  - [Policies Table](#policies-table)
  - [Clauses Table](#clauses-table)
  - [Agent Logs Table](#agent-logs-table)
  - [pgvector IVFFlat Index Setup](#pgvector-ivfflat-index-setup)
- [🖥️ Frontend Deep Dive](#️-frontend-deep-dive)
  - [App Router Pages](#app-router-pages)
  - [Component Architecture](#component-architecture)
  - [Authentication Context](#authentication-context)
  - [API Integration Layer](#api-integration-layer)
  - [UI Components & Design System](#ui-components--design-system)
- [🐳 Docker & Infrastructure](#-docker--infrastructure)
  - [Docker Compose Stack](#docker-compose-stack)
  - [Backend Dockerfile](#backend-dockerfile)
  - [Frontend Dockerfile](#frontend-dockerfile)
  - [Database Initialization](#database-initialization)
- [⚙️ Configuration & Environment Variables](#️-configuration--environment-variables)
  - [Backend Environment](#backend-environment)
  - [Frontend Environment](#frontend-environment)
- [🚀 Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Option 1: Docker (Recommended)](#option-1-docker-recommended)
  - [Option 2: Local Development](#option-2-local-development)
  - [Option 3: Hybrid (DB in Docker, App Local)](#option-3-hybrid-db-in-docker-app-local)
  - [Seeding Synthetic Data](#seeding-synthetic-data)
- [🧩 Technology Stack](#-technology-stack)
  - [Backend Stack](#backend-stack)
  - [Frontend Stack](#frontend-stack)
  - [Infrastructure Stack](#infrastructure-stack)
- [🔧 Development Guide](#-development-guide)
  - [Adding a New Agent](#adding-a-new-agent)
  - [Adding a New API Router](#adding-a-new-api-router)
  - [Extending the Workflow Graph](#extending-the-workflow-graph)
  - [Adding Evaluation Scenarios](#adding-evaluation-scenarios)
- [📈 Performance & Scalability](#-performance--scalability)
  - [Confidence Thresholds](#confidence-thresholds)
  - [pgvector Performance](#pgvector-performance)
  - [LLM Cost Optimization](#llm-cost-optimization)
- [🛡️ Security Considerations](#️-security-considerations)
- [🗺️ Roadmap](#️-roadmap)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## 🎯 Project Vision

**Bharat Policy Twin** was built to solve a national-scale challenge: Indian government policy documents are complex, voluminous, and difficult to analyze at speed. Policymakers, compliance officers, legal researchers, and civil society organizations need a way to:

- **Instantly understand** what a policy document says (natural language Q&A)
- **Detect compliance violations** against uploaded policy clauses
- **Identify risks, gaps, and conflicts** across multiple policy documents
- **Simulate** proposed amendments before implementation
- **Trace every AI decision** for accountability and trust

Bharat Policy Twin is the answer. Upload a policy PDF or text document, and within seconds, 13 specialized AI agents — backed by semantic vector search and Claude on AWS Bedrock — begin analyzing it from every angle: legal, financial, operational, stakeholder, and regulatory.

Unlike generic LLM chat interfaces, Bharat Policy Twin is:

- **Document-grounded**: Every answer is traced to specific policy clause numbers — no hallucination
- **Confidence-aware**: Every agent response carries a numerical confidence score (`HIGH`, `MEDIUM`, `LOW`, `INSUFFICIENT`)
- **Observable**: Every LLM call, token count, retrieval score, and latency is logged in PostgreSQL
- **Evaluatable**: An automated benchmark harness tests agents against predefined scenarios
- **Production-ready**: JWT auth, Docker Compose, pgvector IVFFlat indexing, retry logic, and error recovery

---

## ✨ Feature Highlights

| Category | Feature | Status |
|---|---|---|
| **AI/ML** | 13 Specialized Policy Analysis Agents | ✅ Production |
| **AI/ML** | LangGraph Multi-Agent Orchestration | ✅ Production |
| **AI/ML** | Confidence Scoring on Every Response | ✅ All Agents |
| **AI/ML** | Hallucination Prevention Guardrails | ✅ Hardened |
| **AI/ML** | Insufficient Information Detection | ✅ Active |
| **AI/ML** | Adaptive Branching Workflow | ✅ LangGraph |
| **AI/ML** | Self-Evaluation Quality Scoring Node | ✅ Active |
| **RAG** | AWS Bedrock Titan Embeddings (1024-dim) | ✅ Production |
| **RAG** | pgvector IVFFlat Persistent Vector Store | ✅ Production |
| **RAG** | Semantic Clause Retrieval (top-k) | ✅ Active |
| **Auth** | OTP Email Authentication (Gmail SMTP) | ✅ Production |
| **Auth** | JWT Bearer Token Authorization | ✅ All Endpoints |
| **Auth** | 10-minute OTP expiry + 60-min JWT | ✅ Configurable |
| **Observability** | Per-Call Agent Trace Logging | ✅ PostgreSQL |
| **Observability** | Token Usage & Cost Tracking | ✅ Per-Call |
| **Observability** | Latency Percentiles (p50, p95) | ✅ Aggregated |
| **Observability** | Session-Level Execution Trace | ✅ Full |
| **Observability** | Error Rate & Failure Pattern Reports | ✅ Active |
| **Evaluation** | Automated Benchmark Harness | ✅ Production |
| **Evaluation** | Predefined Policy Scenarios | ✅ Multi-domain |
| **Frontend** | Next.js 16 App Router Dashboard | ✅ Production |
| **Frontend** | OTP Login & Signup UI | ✅ Complete |
| **Frontend** | Policy Upload (Drag & Drop) | ✅ Complete |
| **Frontend** | Policy Browser with Clause Viewer | ✅ Complete |
| **Frontend** | Agent Response Explorer | ✅ Complete |
| **Frontend** | Orchestrator Workflow UI | ✅ Complete |
| **Frontend** | Dark/Light Theme Toggle | ✅ Complete |
| **Frontend** | Interactive Globe, Knowledge Graph | ✅ Landing Page |
| **Infra** | Full Docker Compose Stack | ✅ One-Command |
| **Infra** | Database Health Check & Retry | ✅ Production |
| **Infra** | Synthetic Data Seeder | ✅ Included |

---

## 🏗️ System Architecture

### High-Level Layered Design

Bharat Policy Twin implements a **five-layer architecture**, each with a clearly scoped responsibility:

```
┌───────────────────────────────────────────────────────────────────────┐
│                        OUTPUT INTERFACE LAYER                         │
│          Next.js Dashboard  ·  REST API  ·  /docs (Swagger)          │
└─────────────────────────────────┬─────────────────────────────────────┘
                                  │
┌─────────────────────────────────▼─────────────────────────────────────┐
│                      POLICY INTERVENTION LAYER                        │
│     Recommendation Engine  ·  Validation Agent  ·  Feedback Loop     │
└─────────────────────────────────┬─────────────────────────────────────┘
                                  │
┌─────────────────────────────────▼─────────────────────────────────────┐
│                      AGENTIC ANALYSIS ENGINE                          │
│  LangGraph Orchestrator  ·  13 Specialized Agents  ·  Memory Layer   │
└─────────────────────────────────┬─────────────────────────────────────┘
                                  │
┌─────────────────────────────────▼─────────────────────────────────────┐
│                      DATA INFRASTRUCTURE LAYER                        │
│    PostgreSQL + pgvector  ·  Agent Logs  ·  Evaluation Records       │
└─────────────────────────────────┬─────────────────────────────────────┘
                                  │
┌─────────────────────────────────▼─────────────────────────────────────┐
│                      POLICY INTELLIGENCE LAYER                        │
│       Policy Compiler  ·  PDF/Text Parser  ·  Clause Embedder        │
└───────────────────────────────────────────────────────────────────────┘
```

### Request Lifecycle

Here is the complete end-to-end lifecycle for a user query through the Bharat Policy Twin system:

```
┌──────────┐     POST /orchestrator/run       ┌──────────────────┐
│  Browser │ ─────────────────────────────►  │  FastAPI Backend  │
│ (Next.js)│ ◄──────────────────────────────  │  (uvicorn)        │
└──────────┘     JSON response + confidence   └────────┬─────────┘
                                                       │
                                              JWT Auth Middleware
                                                       │
                                              ┌────────▼─────────┐
                                              │  Agent Router     │
                                              │  (workflow_type)  │
                                              └────────┬─────────┘
                                                       │
                                              ┌────────▼─────────┐
                                              │  LangGraph        │
                                              │  StateGraph       │
                                              │  (PolicyWorkflow) │
                                              └────────┬─────────┘
                                                       │
                        ┌──────────────────────────────┤
                        │                              │
               ┌────────▼────────┐          ┌─────────▼────────┐
               │  Policy Analyst │          │  Compliance Agent │
               │  Agent          │          │                   │
               └────────┬────────┘          └─────────┬────────┘
                        │                              │
                        │    Retrieve from pgvector    │
                        │ ◄─────────────────────────── │
                        │                              │
               ┌────────▼──────────────────────────────▼────────┐
               │         AWS Bedrock (Titan Embeddings)          │
               │         AWS Bedrock (Claude LLM)                │
               └────────────────────────────┬────────────────────┘
                                            │
                                   ┌────────▼────────┐
                                   │  Self-Eval Node  │
                                   │  (quality score) │
                                   └────────┬─────────┘
                                            │
                                   ┌────────▼─────────┐
                                   │  AgentTrace Log   │
                                   │  (PostgreSQL)     │
                                   └───────────────────┘
```

### Data Flow Diagrams

#### Policy Upload Flow

```
User uploads PDF/TXT file
         │
         ▼
POST /upload
         │
         ▼
text_parser.py  ──►  Extract text chunks  ──►  Split into clauses
         │
         ▼
EmbeddingService.embed_text()
         │  (AWS Bedrock Titan, 1024-dim)
         ▼
INSERT INTO clauses (text, embedding)
         │  (pgvector VECTOR column)
         ▼
IVFFlat index auto-updated
         │
         ▼
Policy + clauses ready for querying
```

#### Agent Query Flow

```
Query arrives at agent.run()
         │
         ▼
retrieve_context(query_text, top_k=8-12)
         │  ── embeds query with Bedrock Titan
         │  ── cosine distance search via pgvector
         │  ── returns top-k clauses + avg_score
         ▼
check_insufficient_info(clauses, avg_score)
         │
    ┌────┴────┐
    │         │
  False     True
    │         │
    ▼         ▼
Return    Format clauses into prompt
fallback  + Append GUARDRAIL_SUFFIX
response  + call_llm(prompt)
             │
             ▼
          parse_json_output(raw)
             │
             ▼
          compute_confidence(avg_score, clause_count)
             │
             ▼
          AgentTrace.record(result)
             │
             ▼
          Return structured JSON response
```

---

## 📁 Repository Structure

### Backend Structure

```
backend/
│
├── apps/
│   └── api/
│       ├── agents/                    # 13 specialized AI agents
│       │   ├── __init__.py
│       │   ├── base_agent.py          # ★ Core abstract class — all agents inherit this
│       │   ├── policy_analyst.py      # Agent 1: General policy Q&A
│       │   ├── compliance_agent.py    # Agent 2: Compliance evaluation
│       │   ├── risk_agent.py          # Agent 3: Risk scoring (5 dimensions)
│       │   ├── gap_analysis_agent.py  # Agent 4: Gap detection
│       │   ├── amendment_agent.py     # Agent 5: Amendment drafting
│       │   ├── conflict_agent.py      # Agent 6: Cross-policy conflict detection
│       │   ├── comparison_agent.py    # Agent 7: Side-by-side comparison
│       │   ├── stakeholder_agent.py   # Agent 8: Stakeholder impact analysis
│       │   ├── simulation_agent.py    # Agent 9: Policy simulation
│       │   ├── clause_relationship_agent.py  # Agent 10: Clause dependency mapping
│       │   └── memory_agent.py        # Agent 11: Conversation memory
│       │
│       ├── orchestrator/              # LangGraph multi-agent workflow
│       │   ├── __init__.py
│       │   ├── workflow_graph.py      # ★ LangGraph StateGraph definition
│       │   ├── agent_router.py        # Routes queries to appropriate workflow
│       │   └── langchain_tools.py     # LangChain tool wrappers
│       │
│       ├── rag/                       # RAG pipeline
│       │   ├── __init__.py
│       │   └── embedder.py            # ★ AWS Bedrock Titan embedding service
│       │
│       ├── routers/                   # FastAPI route handlers
│       │   ├── __init__.py
│       │   ├── auth.py                # OTP send/verify + JWT
│       │   ├── health.py              # Health check
│       │   ├── upload.py              # Policy document upload
│       │   ├── policy.py              # CRUD for policies
│       │   ├── query.py               # Direct query endpoint
│       │   ├── ask.py                 # Simple ask endpoint
│       │   ├── agents.py              # Direct single-agent invocation
│       │   ├── orchestrator.py        # Multi-agent workflow trigger
│       │   ├── observability.py       # Metrics & traces
│       │   └── evaluation.py          # Benchmark harness trigger
│       │
│       ├── evaluation/                # Automated evaluation system
│       │   ├── __init__.py
│       │   ├── harness.py             # ★ Benchmark runner
│       │   └── scenarios.py           # Predefined test scenarios
│       │
│       ├── observability/             # Structured observability
│       │   ├── __init__.py
│       │   ├── logger.py              # ★ AgentTrace context manager
│       │   └── metrics.py             # SQL-backed metrics aggregation
│       │
│       ├── config.py                  # Environment variable loading
│       ├── database.py                # SQLAlchemy engine + session
│       ├── models.py                  # ORM: Policy, Clause models
│       ├── schemas.py                 # Pydantic request/response schemas
│       └── main.py                    # ★ FastAPI app entry point
│
├── db/
│   ├── __init__.py
│   └── base.py                        # SQLAlchemy declarative Base
│
├── services/
│   ├── __init__.py
│   └── policy_service.py              # Policy CRUD service layer
│
├── utils/
│   ├── __init__.py
│   └── text_parser.py                 # PDF/TXT parsing + clause splitting
│
├── infra/
│   ├── Dockerfile                     # Backend container image
│   ├── docker-compose.yml             # Backend-only compose (inner)
│   └── init.sql                       # pgvector schema setup + IVFFlat
│
├── .env                               # Backend secrets (DO NOT COMMIT)
├── requirements.txt                   # Python dependencies
├── seed_synthetic_db.py               # Database seeder script
├── design.md                          # System design document
└── AUTH_SETUP.md                      # Authentication setup guide
```

### Frontend Structure

```
frontend/
│
├── app/                               # Next.js 16 App Router
│   ├── layout.tsx                     # Root layout with providers
│   ├── page.tsx                       # Landing page (globe, cards, features)
│   ├── login/page.tsx                 # OTP login page
│   ├── signup/page.tsx                # User registration page
│   ├── dashboard/page.tsx             # Main stats dashboard
│   ├── upload/page.tsx                # Policy document upload
│   ├── policies/page.tsx              # Policy browser
│   ├── agents/page.tsx                # Direct agent invocation UI
│   ├── orchestrator/page.tsx          # Multi-agent workflow UI
│   ├── tasks/page.tsx                 # Task management
│   ├── evaluation/page.tsx            # Benchmark runner UI
│   └── observability/page.tsx         # Metrics & traces UI
│
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx              # Email + OTP form
│   │   └── SignupForm.tsx             # Registration form
│   │
│   ├── dashboard/
│   │   ├── DashboardOverview.tsx      # Stats grid
│   │   └── StatsCard.tsx              # Reusable stat card
│   │
│   ├── layout/
│   │   ├── DashboardLayout.tsx        # Authenticated layout wrapper
│   │   ├── Sidebar.tsx                # Navigation sidebar
│   │   └── Topbar.tsx                 # Top navigation bar
│   │
│   ├── policies/
│   │   ├── PolicyTable.tsx            # Policy list with pagination
│   │   └── ClauseViewer.tsx           # Clause browser + search
│   │
│   ├── upload/
│   │   ├── UploadBox.tsx              # Drag-and-drop upload zone
│   │   └── UploadHistory.tsx          # Upload history tracker
│   │
│   ├── reports/
│   │   └── ReportGenerator.tsx        # AI report export
│   │
│   ├── shared/
│   │   └── ResponseRenderer.tsx       # Universal agent response renderer
│   │
│   ├── ui/
│   │   ├── Button.tsx                 # Design system button
│   │   ├── Card.tsx                   # Design system card
│   │   ├── Input.tsx                  # Design system input
│   │   ├── Table.tsx                  # Design system table
│   │   ├── Toast.tsx                  # Toast notification system
│   │   ├── Skeleton.tsx               # Loading skeleton
│   │   ├── ThemeToggle.tsx            # Dark/light mode toggle
│   │   ├── auth-background.tsx        # Auth page animated background
│   │   ├── card-stack.tsx             # Stacked card animation
│   │   ├── document-scanner.tsx       # Document scan animation
│   │   ├── features-section.tsx       # Landing features section
│   │   ├── file-upload.tsx            # File upload primitives
│   │   ├── footer.tsx                 # Footer component
│   │   ├── footer-section.tsx         # Footer section layout
│   │   ├── interactive-globe.tsx      # 3D globe animation (landing)
│   │   └── knowledge-graph.tsx        # Knowledge graph visualization
│   │
│   └── ErrorBoundary.tsx              # React error boundary
│
├── context/
│   ├── AuthContext.tsx                # Global auth state (JWT + user)
│   └── ThemeContext.tsx               # Dark/light theme provider
│
├── lib/
│   ├── api.ts                         # ★ All API calls with JWT Bearer
│   ├── auth.ts                        # OTP + JWT auth utilities
│   ├── logger.ts                      # Frontend logging
│   ├── toast.ts                       # Toast notification helpers
│   ├── uploadHistory.ts               # LocalStorage upload tracking
│   └── utils.ts                       # Shared utilities
│
├── types/
│   ├── policy.ts                      # Policy + Clause TypeScript types
│   └── chat.ts                        # Chat message types
│
├── styles/
│   └── globals.css                    # Global Tailwind CSS
│
├── public/
│   └── dashboard-mockup.png           # Dashboard preview image
│
├── Dockerfile                         # Frontend container image
├── next.config.js                     # Next.js configuration
├── tailwind.config.ts                 # Tailwind CSS configuration
├── tsconfig.json                      # TypeScript configuration
└── vercel.json                        # Vercel deployment configuration
```

---

## 🤖 The 13 AI Agents — Deep Dive

### BaseAgent — Shared Intelligence Layer

**File:** `backend/apps/api/agents/base_agent.py`

Every agent in Bharat Policy Twin inherits from `BaseAgent`, which provides:

1. **Persistent pgvector Retrieval** — Semantic search against stored policy clauses using cosine similarity via the `<=>` operator
2. **Bedrock Embedding** — Calls AWS Bedrock Titan to embed query text into 1024-dimensional vectors
3. **LLM Invocation** — Calls Claude (or any Bedrock-compatible model) with deterministic `temperature=0.0`
4. **Confidence Scoring** — Multi-factor confidence: retrieval quality (70%) + clause coverage (30%)
5. **Guardrail Enforcement** — Appends `GUARDRAIL_SUFFIX` to every prompt, enforcing JSON-only output and clause-traceability
6. **Insufficient Info Detection** — Returns a structured fallback response if `avg_score < CONFIDENCE_LOW (0.10)`
7. **JSON Output Parsing** — Strips markdown fences and parses JSON with error fallback
8. **AgentTrace Integration** — Wraps every execution in an `AgentTrace` context manager for full observability

```python
# Confidence Thresholds
CONFIDENCE_HIGH   = 0.75   # Reliable, high-quality retrieval
CONFIDENCE_MEDIUM = 0.55   # Usable, moderate retrieval quality
CONFIDENCE_LOW    = 0.10   # Minimum threshold — below this = fallback
CONFIDENCE_INSUFFICIENT = < 0.10  # Returns error response

# Confidence is computed as:
# score = (avg_retrieval_score × 0.70) + (min(clause_count / 5.0, 1.0) × 0.30)
```

**Guardrail Suffix** (appended to every agent prompt):

```
CRITICAL INSTRUCTIONS:
1. Only use information from the provided policy clauses above.
2. Never invent clauses, rules, or penalties not present in the text.
3. If the clauses do not contain enough information to answer, set a field called "insufficient_information": true.
4. Always return valid JSON. No markdown explanation outside the JSON.
5. Every claim must be traceable to a specific clause number.
```

**pgvector Retrieval Query:**

```sql
SELECT id, policy_id, clause_number, text,
       1 - (embedding <=> CAST(:vec AS vector)) AS score
FROM clauses
WHERE embedding IS NOT NULL
  AND policy_id = :pid      -- optional policy filter
ORDER BY embedding <=> CAST(:vec AS vector)
LIMIT :k                    -- configurable top-k (8-12 per agent)
```

---

### 1. Policy Analyst Agent

**File:** `backend/apps/api/agents/policy_analyst.py`

The general-purpose agent for natural language policy Q&A. It retrieves the most semantically relevant clauses and generates structured answers.

**Capabilities:**
- Plain-language interpretation of policy clauses
- Definition and scope analysis
- Cross-clause synthesis for complex queries
- Section-by-section policy summaries

**Output Schema:**
```json
{
  "question": "string",
  "answer": "string",
  "relevant_clauses": ["list of clause numbers"],
  "key_provisions": ["list of key points"],
  "limitations": "what the policy does NOT cover",
  "confidence": {"score": 0.82, "level": "HIGH", "reliable": true},
  "source_clauses": [{"clause_number": "3.1", "score": 0.91}],
  "agent": "PolicyAnalystAgent"
}
```

**Retrieval:** `top_k=8`, general policy context

---

### 2. Compliance Agent

**File:** `backend/apps/api/agents/compliance_agent.py`

Evaluates whether a given scenario or action is compliant with uploaded policy clauses. Returns a structured verdict with legal exposure analysis.

**Capabilities:**
- Compliance verdict: `VIOLATION` | `NO_VIOLATION` | `PARTIAL_VIOLATION`
- Risk level classification: `LOW` | `MEDIUM` | `HIGH` | `CRITICAL`
- Violated and compliant clause identification
- Legal/financial exposure estimation
- Recommended corrective action

**Output Schema:**
```json
{
  "verdict": "PARTIAL_VIOLATION",
  "risk_level": "HIGH",
  "violated_clauses": ["5.2", "7.4"],
  "compliant_clauses": ["3.1", "4.2", "6.0"],
  "explanation": "The procurement process violated clause 5.2 which requires...",
  "recommended_action": "Immediately suspend procurement and convene review...",
  "legal_exposure": "Potential fine of ₹2-5 lakh under Section 12...",
  "insufficient_information": false,
  "confidence": {"score": 0.78, "level": "HIGH"},
  "agent": "ComplianceAgent"
}
```

**Retrieval:** `top_k=10` (higher to capture broader compliance context)

**Workflow Integration:** The `compliance_violated` flag from this agent drives LangGraph branching — if `VIOLATION` or `PARTIAL_VIOLATION`, the workflow routes to risk assessment and amendment drafting.

---

### 3. Risk Assessment Agent

**File:** `backend/apps/api/agents/risk_agent.py`

Scores policy risk across five independent dimensions, producing an overall risk level used by the LangGraph orchestrator for adaptive branching.

**Risk Dimensions:**
1. **Ambiguity Score** (0-10): Vague, undefined terms that create interpretation risk
2. **Enforcement Weakness Score** (0-10): Missing penalties, unenforceable provisions
3. **Financial Exposure Score** (0-10): Budget overruns, liability gaps
4. **Operational Risk Score** (0-10): Implementation complexity, timeline risk
5. **Legal Risk Score** (0-10): Constitutional questions, regulatory conflicts

**Output Schema:**
```json
{
  "overall_risk_score": 7.2,
  "risk_level": "HIGH",
  "ambiguity_score": 8,
  "ambiguity_details": "Clause 4.3 uses undefined term 'reasonable timeframe'...",
  "enforcement_weakness_score": 6,
  "enforcement_details": "No escalation mechanism for repeat violations...",
  "financial_exposure_score": 7,
  "financial_details": "No budget ceiling specified for emergency provisions...",
  "operational_risk_score": 7,
  "operational_details": "Requires coordination across 5 departments with no SLA...",
  "legal_risk_score": 8,
  "legal_details": "May conflict with Central Act provisions under Article 254...",
  "top_risks": ["Ambiguous eligibility criteria", "No audit mechanism", ...],
  "mitigation_strategies": ["Define all terms in a glossary annex", ...],
  "confidence": {"score": 0.74, "level": "HIGH"},
  "agent": "RiskAssessmentAgent"
}
```

**Retrieval:** `top_k=12` (widest retrieval for comprehensive risk coverage)

**Workflow Integration:** The `risk_level` from this agent determines whether the workflow escalates to `CRITICAL` path (adds simulation + stakeholder analysis) or proceeds normally.

---

### 4. Gap Analysis Agent

**File:** `backend/apps/api/agents/gap_analysis_agent.py`

Identifies provisions that are present in best-practice policy frameworks but missing from the uploaded document. Surfaces coverage gaps, missing definitions, omitted enforcement mechanisms, and absent appeal processes.

**Output Schema:**
```json
{
  "gaps_identified": [
    {
      "gap_type": "Missing Definition",
      "description": "Term 'eligible beneficiary' is used but never defined",
      "affected_clauses": ["2.1", "3.4"],
      "severity": "HIGH",
      "recommendation": "Add definition in Section 1 Definitions"
    }
  ],
  "missing_sections": ["Grievance Redressal Mechanism", "Audit & Accountability"],
  "coverage_score": 62,
  "overall_assessment": "Policy lacks critical implementation safeguards...",
  "confidence": {"score": 0.71, "level": "HIGH"},
  "agent": "GapAnalysisAgent"
}
```

---

### 5. Amendment Drafting Agent

**File:** `backend/apps/api/agents/amendment_agent.py`

Given a detected issue (compliance violation, risk flag, or gap), drafts specific amendment language that would resolve the issue while maintaining consistency with existing clause structure and style.

**Output Schema:**
```json
{
  "amendment_target_clause": "5.2",
  "issue_addressed": "No penalty mechanism for late submissions",
  "original_text": "Submissions shall be made within 30 days...",
  "proposed_amendment": "Submissions shall be made within 30 days. Failure to submit within this period shall attract a penalty of ₹500 per day of delay, not exceeding ₹15,000, recoverable as arrears of land revenue...",
  "rationale": "Introduces enforceable deterrent while capping financial exposure...",
  "cross_references": ["Clause 7.1 (Penalties)", "Clause 9.0 (Recovery Mechanisms)"],
  "legal_basis": "Section 15 of the parent Act empowers such penalty provisions...",
  "confidence": {"score": 0.68, "level": "MEDIUM"},
  "agent": "AmendmentDraftingAgent"
}
```

---

### 6. Conflict Detection Agent

**File:** `backend/apps/api/agents/conflict_agent.py`

Compares two uploaded policy documents to identify contradictions, overlapping jurisdictions, inconsistent definitions, and conflicting eligibility criteria. Designed for use when two `policy_id` values are provided.

**Output Schema:**
```json
{
  "conflicts_found": [
    {
      "type": "Contradictory Eligibility",
      "policy_a_clause": "Policy 1 / Clause 3.2",
      "policy_b_clause": "Policy 2 / Clause 2.1",
      "description": "Policy 1 restricts eligibility to farmers below BPL line; Policy 2 extends same benefit to all farmers...",
      "severity": "HIGH",
      "resolution_options": ["Supersede with unified eligibility definition", ...]
    }
  ],
  "total_conflicts": 3,
  "alignment_score": 55,
  "recommendation": "Harmonization required before concurrent implementation...",
  "confidence": {"score": 0.76, "level": "HIGH"},
  "agent": "ConflictAgent"
}
```

---

### 7. Comparison Agent

**File:** `backend/apps/api/agents/comparison_agent.py`

Provides structured side-by-side comparison of two policy documents across multiple dimensions: scope, eligibility, benefits, enforcement, timelines, and grievance mechanisms. Ideal for policy evolution tracking or benchmarking against model policies.

**Output Schema:**
```json
{
  "comparison_dimensions": [
    {
      "dimension": "Eligibility Criteria",
      "policy_a": "BPL households with annual income < ₹1.5L",
      "policy_b": "All households with annual income < ₹2.5L",
      "verdict": "Policy B is more inclusive",
      "implication": "Policy B covers ~40% more beneficiaries"
    }
  ],
  "overall_assessment": "Policy B represents a significant expansion...",
  "recommendation": "Adopt Policy B eligibility thresholds with Policy A's enforcement mechanism...",
  "confidence": {"score": 0.80, "level": "HIGH"},
  "agent": "ComparisonAgent"
}
```

---

### 8. Stakeholder Impact Agent

**File:** `backend/apps/api/agents/stakeholder_agent.py`

Analyzes the policy from the perspective of each affected stakeholder group: primary beneficiaries, implementing agencies, oversight bodies, contractors, and civil society. Produces stakeholder-specific impact scores and actionable summaries for each group.

**Output Schema:**
```json
{
  "stakeholders": [
    {
      "group": "Primary Beneficiaries (Rural Farmers)",
      "impact_type": "Positive",
      "impact_score": 8,
      "key_benefits": ["Direct income support of ₹6000/year", "..."],
      "key_concerns": ["Complex application process", "Document requirements..."],
      "recommended_actions": ["Simplify application via mobile portal", "..."]
    }
  ],
  "highest_impact_group": "Primary Beneficiaries",
  "lowest_impact_group": "Urban Contractors",
  "overall_equity_score": 72,
  "confidence": {"score": 0.73, "level": "HIGH"},
  "agent": "StakeholderAgent"
}
```

---

### 9. Simulation Agent

**File:** `backend/apps/api/agents/simulation_agent.py`

Models the expected real-world outcomes of policy implementation: projected beneficiary uptake, budget utilization over time, bottleneck stages, and predicted KPI trajectories. Useful for pre-implementation scenario planning.

**Output Schema:**
```json
{
  "simulation_scenario": "Full statewide rollout, 3-year timeline",
  "projected_beneficiaries": 2500000,
  "budget_utilization": {
    "year_1": "45%",
    "year_2": "78%",
    "year_3": "92%"
  },
  "bottleneck_stages": ["Document verification (Stage 3)", "Disbursement (Stage 5)"],
  "risk_scenarios": [
    {"scenario": "Low uptake (30%)", "probability": 0.2, "impact": "Budget surplus..."},
    {"scenario": "Baseline (70%)", "probability": 0.6, "impact": "On-track..."},
    {"scenario": "High uptake (95%)", "probability": 0.2, "impact": "Strain on verification..."}
  ],
  "key_success_factors": ["District-level nodal officers", "..."],
  "confidence": {"score": 0.65, "level": "MEDIUM"},
  "agent": "SimulationAgent"
}
```

---

### 10. Clause Relationship Agent

**File:** `backend/apps/api/agents/clause_relationship_agent.py`

Maps the dependency graph between clauses within a policy document: which clauses reference others, which clauses are prerequisites for implementing other clauses, and which clauses would be affected if a given clause were amended. Essential for impact analysis before amendments.

**Output Schema:**
```json
{
  "clause_graph": [
    {
      "clause": "3.1",
      "depends_on": ["1.2", "2.4"],
      "referenced_by": ["5.1", "6.2", "7.0"],
      "relationship_type": "definitional_dependency"
    }
  ],
  "central_clauses": ["2.1", "3.1", "5.0"],
  "isolated_clauses": ["Annex-A", "Schedule-II"],
  "amendment_impact_map": {
    "amending_clause_3.1_affects": ["5.1", "6.2", "7.0"]
  },
  "confidence": {"score": 0.70, "level": "HIGH"},
  "agent": "ClauseRelationshipAgent"
}
```

---

### 11. Memory Agent

**File:** `backend/apps/api/agents/memory_agent.py`

Maintains conversational context across multi-turn interactions within a session. Summarizes prior exchanges, extracts entities and decisions, and injects relevant prior context into subsequent agent prompts — enabling coherent, stateful policy conversations.

**Output Schema:**
```json
{
  "session_id": "abc-123",
  "turn_count": 4,
  "extracted_entities": ["Policy: PM Kisan Samman Nidhi", "Risk: HIGH", "..."],
  "summary": "User is analyzing PM Kisan for compliance gaps...",
  "context_for_next_turn": "Prior analysis found PARTIAL_VIOLATION in clause 5.2...",
  "confidence": {"score": 0.85, "level": "HIGH"},
  "agent": "MemoryAgent"
}
```

---

### Additional Orchestrated Agents

The LangGraph workflow also orchestrates composite agent chains for:

- **Self-Evaluation**: Scores the output quality of the entire workflow (0.0–1.0) and flags low-quality runs for human review
- **Error Recovery**: Retry logic with exponential backoff; falls back to simplified agent if primary agent fails 3 times
- **Result Synthesis**: Merges outputs from parallel agents into a unified response object

---

## 🔗 LangGraph Orchestration Engine

**File:** `backend/apps/api/orchestrator/workflow_graph.py`

The LangGraph engine turns individual agents into a collaborative, stateful multi-agent system with sophisticated flow control.

### Workflow State Machine

The `PolicyWorkflowState` TypedDict carries all workflow context:

```python
class PolicyWorkflowState(TypedDict):
    query: str                    # User's original question
    policy_id: int | None         # Primary policy being analyzed
    policy_id_b: int | None       # Secondary policy (for comparison/conflict)
    workflow_type: str            # "full" | "compliance" | "risk" | "compare"
    session_id: str | None        # For memory agent continuity
    db: Any                       # Database session

    previous_context: str         # Memory agent output for multi-turn
    agent_results: dict           # Merged results from all agents (dict merge)

    # Control signals
    compliance_violated: bool     # Set by ComplianceAgent
    risk_level: str               # "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
    confidence_ok: bool           # False if any agent returned INSUFFICIENT
    retry_count: int              # Error recovery counter

    error: str | None             # Last error message
    workflow_complete: bool        # Terminal flag
    self_eval_score: float        # Quality score from evaluator node (0-1)
```

### Adaptive Branching Logic

The workflow graph adapts its path based on runtime signals:

```
START
  │
  ▼
[Policy Analyst] ──► confidence_ok?
                              │
                    ┌─────────┴──────────┐
                   No                   Yes
                    │                    │
                    ▼                    ▼
             [Fallback Node]     [Compliance Agent]
                                         │
                              compliance_violated?
                                         │
                              ┌──────────┴──────────┐
                             Yes                    No
                              │                     │
                              ▼                     ▼
                     [Risk Assessment]      risk_level?
                              │                     │
                    ┌─────────┴──────┐    ┌────────┴────────┐
                 CRITICAL          HIGH  MEDIUM            LOW
                    │               │     │                 │
                    ▼               ▼     ▼                 │
              [Simulation]   [Gap Anal] [Memory]            │
              [Stakeholder]  [Amend]                        │
                    │               │                       │
                    └───────────────┴───────────────────────┘
                                    │
                                    ▼
                           [Self-Evaluation Node]
                                    │
                           self_eval_score ≥ 0.7?
                                    │
                          ┌─────────┴──────────┐
                         Yes                   No
                          │                    │
                          ▼                    ▼
                       [END]         [Retry / Human Review Flag]
```

### Error Recovery Nodes

Every agent node wraps its execution in try/except. On failure:

1. `retry_count` increments
2. If `retry_count < 3`: agent retries with modified parameters
3. If `retry_count >= 3`: workflow routes to a lightweight fallback node
4. Error details logged to `agent_logs` table with `status='error'`

```python
def node_policy_analyst(state: PolicyWorkflowState) -> dict:
    try:
        result = PolicyAnalystAgent().run(state["db"], ...)
        confidence_ok = result.get("confidence", {}).get("reliable", True)
        return {"agent_results": {"policy_analyst": result}, "confidence_ok": confidence_ok}
    except Exception as e:
        logger.error(f"PolicyAnalyst error: {e}")
        return {"agent_results": {"policy_analyst": {"error": str(e)}},
                "confidence_ok": False}
```

### Self-Evaluation Node

After all analysis agents complete, a self-evaluation node scores the overall workflow output on:

- **Completeness**: Were all requested analysis dimensions covered?
- **Coherence**: Are the agent outputs consistent with each other?
- **Confidence**: What is the aggregate confidence across agents?
- **Traceability**: Are all claims linked to source clauses?

The `self_eval_score` (0.0–1.0) is returned in the API response, allowing clients to display a quality indicator alongside results.

---

## 🧠 RAG Pipeline — Retrieval-Augmented Generation

### Document Ingestion Pipeline

**File:** `backend/utils/text_parser.py`

When a user uploads a policy document (PDF or TXT), the ingestion pipeline:

1. **Parses** the file (PyPDF for PDFs, direct read for TXT)
2. **Segments** the text into logical clauses using regex patterns that detect clause numbering schemes (`1.`, `1.1`, `Section 1`, `Article I`, etc.)
3. **Assigns clause numbers** based on detected structure or sequential numbering
4. **Normalizes** whitespace and removes headers/footers
5. **Stores** raw clause text in the `clauses` table
6. **Embeds** each clause via `EmbeddingService.embed_text()` → AWS Bedrock Titan
7. **Stores** the 1024-dimensional vector in the `embedding` column (pgvector `VECTOR(1024)`)

```python
# Clause splitting logic (simplified)
def split_into_clauses(text: str) -> list[dict]:
    patterns = [
        r'^\d+\.\d+',           # 1.1, 2.3
        r'^\d+\.',              # 1., 2.
        r'^Section \d+',        # Section 1
        r'^Article [IVX]+',     # Article IV
        r'^[A-Z]\.',            # A., B.
    ]
    # ... splitting and numbering logic
```

### Embedding Strategy

**File:** `backend/apps/api/rag/embedder.py`

```python
class EmbeddingService:
    DIMENSION = 1024  # AWS Bedrock Titan Embeddings v2 output dimension

    def embed_text(self, text: str) -> list[float]:
        body = json.dumps({"inputText": text.strip()})
        response = self._get_client().invoke_model(
            modelId=BEDROCK_EMBEDDING_MODEL_ID,  # "amazon.titan-embed-text-v2:0"
            contentType="application/json",
            accept="application/json",
            body=body,
        )
        return json.loads(response["body"].read())["embedding"]
```

Key design choices:
- **Lazy initialization**: Bedrock client created on first use to avoid import-time failures in testing
- **Retry logic**: `Config(retries={"mode": "standard", "max_attempts": 3})`
- **Dimension validation**: Raises `ValueError` if embedding dimension != 1024
- **Text truncation**: Input truncated to 8000 characters at agent retrieval time (BaseAgent)

### pgvector IVFFlat Index

**File:** `backend/infra/init.sql`

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Policies table
CREATE TABLE IF NOT EXISTS policies (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT
);

-- Clauses table with vector column
CREATE TABLE IF NOT EXISTS clauses (
    id SERIAL PRIMARY KEY,
    policy_id INTEGER REFERENCES policies(id) ON DELETE CASCADE,
    clause_number VARCHAR(64) NOT NULL,
    text TEXT NOT NULL,
    embedding VECTOR(1024)
);

-- IVFFlat index for fast approximate nearest-neighbor search
-- lists=100 is appropriate for up to ~1M vectors
CREATE INDEX IF NOT EXISTS clauses_embedding_idx
    ON clauses USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);
```

The IVFFlat (Inverted File Flat) index partitions vectors into `lists` clusters, enabling sub-linear search time for large clause stores. At query time, pgvector searches only the most promising clusters.

**Performance characteristics:**
- Build time: O(n × lists) — fast for typical policy document sizes
- Query time: ~5–15ms for up to 100K clauses
- Recall: ~95%+ for `lists=100`, `probes=10` (pgvector default)

### Retrieval & Confidence Scoring

```python
def retrieve_context(self, db, query_text, top_k=8, policy_id=None, min_score=0.0):
    embedding = self._embed(query_text)           # Embed query
    vec_str = "[" + ",".join(str(x) for x in embedding) + "]"

    # Cosine similarity search (1 - distance = similarity)
    stmt = text("""
        SELECT id, policy_id, clause_number, text,
               1 - (embedding <=> CAST(:vec AS vector)) AS score
        FROM clauses
        WHERE embedding IS NOT NULL AND policy_id = :pid
        ORDER BY embedding <=> CAST(:vec AS vector)
        LIMIT :k
    """)

    rows = db.execute(stmt, params).fetchall()
    avg_score = sum(c["score"] for c in clauses) / len(clauses)
    return clauses, avg_score
```

**Confidence computation:**
```python
coverage_factor = min(clause_count / 5.0, 1.0)  # 5+ clauses = full coverage
raw_score = (avg_retrieval_score × 0.70) + (coverage_factor × 0.30)
score = min(raw_score, 1.0)

# Levels:
# ≥ 0.75 → HIGH      (reliable, use with confidence)
# ≥ 0.55 → MEDIUM    (usable, flag uncertainty)
# ≥ 0.10 → LOW       (use with caution)
# < 0.10 → INSUFFICIENT (return error, do not hallucinate)
```

### Guardrails & Hallucination Prevention

Every agent prompt includes the `GUARDRAIL_SUFFIX` which enforces:

1. **Source restriction**: "Only use information from the provided policy clauses above"
2. **Anti-fabrication**: "Never invent clauses, rules, or penalties not present in the text"
3. **Uncertainty declaration**: `"insufficient_information": true` field when info is absent
4. **Format enforcement**: "Always return valid JSON. No markdown explanation outside the JSON."
5. **Traceability mandate**: "Every claim must be traceable to a specific clause number"

Combined with `temperature=0.0` (fully deterministic), these measures minimize hallucination risk significantly.

---

## 🔐 Authentication System

**File:** `backend/apps/api/routers/auth.py`

### OTP Email Flow

```
1. User enters email address on Login/Signup page
2. Frontend calls: POST /auth/send-otp { "email": "user@example.com" }
3. Backend generates 6-digit random OTP
4. OTP stored in memory: { email: { otp, expires_at: now+10min } }
5. Backend sends styled HTML email via Gmail SMTP with OTP
6. User receives email and enters OTP in UI
7. Frontend calls: POST /auth/verify-otp { "email": "...", "otp": "123456" }
8. Backend validates OTP + expiry
9. OTP consumed (deleted from store — single use)
10. Backend returns: { access_token: "eyJ...", token_type: "bearer", email: "..." }
11. Frontend stores JWT in localStorage
12. All subsequent API calls include: Authorization: Bearer <token>
```

### OTP Email Template

The OTP email is styled with branded HTML:

```
┌────────────────────────────────────┐
│  🇮🇳 Bharat Policy Twin             │
│                                    │
│  Your One-Time Password (OTP) is:  │
│                                    │
│  ┌──────────────────────────────┐  │
│  │        4  8  2  9  1  7      │  │
│  └──────────────────────────────┘  │
│                                    │
│  This OTP expires in 10 minutes.   │
│  If you did not request this,      │
│  please ignore this email.         │
└────────────────────────────────────┘
```

### JWT Token Lifecycle

```python
# Token creation
payload = {
    "sub": email,
    "exp": datetime.utcnow() + timedelta(minutes=JWT_EXPIRE_MINUTES),  # 60 min
    "iat": datetime.utcnow(),
}
token = jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)  # HS256

# Token validation (dependency injection)
def get_current_user(token: str = Depends(oauth2_scheme)) -> str:
    payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
    return payload.get("sub")  # email
```

### Protected Routes

All API endpoints except `/auth/*` and `/health` require a valid JWT:

```python
@router.post("/agents/compliance")
def run_compliance(
    body: ComplianceRequest,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),  # JWT validation
):
    ...
```

The frontend's `AuthContext` manages token storage and attaches `Authorization: Bearer <token>` headers automatically via `lib/api.ts`.

---

## 📡 API Reference

All endpoints are documented interactively at `http://localhost:8000/docs` (Swagger UI).

### Authentication Endpoints

| Method | Path | Description | Auth Required |
|--------|------|-------------|---------------|
| `POST` | `/auth/send-otp` | Generate and email OTP | ❌ |
| `POST` | `/auth/verify-otp` | Verify OTP and receive JWT | ❌ |
| `GET` | `/auth/me` | Get current authenticated user | ✅ |

**Send OTP Request:**
```json
POST /auth/send-otp
{ "email": "analyst@example.gov.in" }

Response: { "message": "OTP sent to analyst@example.gov.in. Expires in 10 minutes." }
```

**Verify OTP Request:**
```json
POST /auth/verify-otp
{ "email": "analyst@example.gov.in", "otp": "482917" }

Response: {
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "email": "analyst@example.gov.in"
}
```

### Policy Management Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/upload` | Upload policy PDF or TXT file |
| `GET` | `/policies` | List all policies |
| `GET` | `/policies/{id}` | Get policy with full clauses |
| `DELETE` | `/policies/{id}` | Delete policy and all clauses |
| `GET` | `/policies/{id}/clauses` | Get paginated clauses for a policy |

**Upload Policy:**
```bash
curl -X POST http://localhost:8000/upload \
  -H "Authorization: Bearer <token>" \
  -F "file=@policy_document.pdf" \
  -F "title=PM Kisan Samman Nidhi Scheme" \
  -F "description=Income support scheme for farmers"
```

**Response:**
```json
{
  "policy_id": 42,
  "title": "PM Kisan Samman Nidhi Scheme",
  "clauses_embedded": 87,
  "message": "Policy uploaded and embedded successfully"
}
```

### Agent Endpoints

Direct single-agent invocation via `/agents/*`:

| Method | Path | Agent | Key Parameters |
|--------|------|-------|----------------|
| `POST` | `/agents/analyst` | Policy Analyst | `query`, `policy_id` |
| `POST` | `/agents/compliance` | Compliance | `scenario`, `policy_id` |
| `POST` | `/agents/risk` | Risk Assessment | `context`, `policy_id` |
| `POST` | `/agents/gap` | Gap Analysis | `query`, `policy_id` |
| `POST` | `/agents/amendment` | Amendment Drafting | `issue`, `clause_number`, `policy_id` |
| `POST` | `/agents/conflict` | Conflict Detection | `query`, `policy_id`, `policy_id_b` |
| `POST` | `/agents/compare` | Comparison | `query`, `policy_id`, `policy_id_b` |
| `POST` | `/agents/stakeholder` | Stakeholder Impact | `query`, `policy_id` |
| `POST` | `/agents/simulate` | Simulation | `scenario`, `policy_id` |
| `POST` | `/agents/clauses` | Clause Relationships | `clause_number`, `policy_id` |

**Example — Compliance Check:**
```json
POST /agents/compliance
Authorization: Bearer <token>

{
  "scenario": "A vendor submitted the procurement application 45 days after the deadline citing administrative delays. The approving officer accepted the application without penalty.",
  "policy_id": 42
}
```

### Orchestrator Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/orchestrator/run` | Run full multi-agent LangGraph workflow |
| `POST` | `/orchestrator/compliance` | Compliance-focused workflow |
| `POST` | `/orchestrator/risk` | Risk-focused workflow |
| `POST` | `/orchestrator/compare` | Comparison workflow (two policies) |
| `GET` | `/orchestrator/status/{session_id}` | Workflow execution status |

**Full Workflow Request:**
```json
POST /orchestrator/run
{
  "query": "Analyze the procurement process defined in Section 5 for compliance gaps and financial risks",
  "policy_id": 42,
  "workflow_type": "full",
  "session_id": "session-abc-123"
}
```

**Full Workflow Response:**
```json
{
  "session_id": "session-abc-123",
  "workflow_type": "full",
  "self_eval_score": 0.84,
  "risk_level": "HIGH",
  "compliance_violated": true,
  "agent_results": {
    "policy_analyst": { ... },
    "compliance": {
      "verdict": "PARTIAL_VIOLATION",
      "risk_level": "HIGH",
      "violated_clauses": ["5.2", "5.4"],
      ...
    },
    "risk_assessment": { "overall_risk_score": 7.2, ... },
    "gap_analysis": { ... },
    "amendment_drafting": { ... }
  },
  "execution_time_ms": 8420
}
```

### Observability Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/observability/metrics` | Agent performance metrics (last N hours) |
| `GET` | `/observability/session/{id}` | Full execution trace for a session |
| `GET` | `/observability/errors` | Recent error patterns |
| `GET` | `/observability/tokens` | Token usage and cost summary |
| `GET` | `/observability/traces` | Paginated agent trace logs |

### Evaluation Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/evaluation/run` | Run full benchmark suite |
| `POST` | `/evaluation/run?tags=compliance` | Run filtered scenarios by tag |
| `GET` | `/evaluation/results/{run_id}` | Get benchmark results |
| `GET` | `/evaluation/scenarios` | List available scenarios |

---

## 📊 Observability & Monitoring

### AgentTrace System

**File:** `backend/apps/api/observability/logger.py`

Every agent execution is wrapped in an `AgentTrace` context manager that automatically records the full execution trace to PostgreSQL:

```python
class AgentTrace:
    def __init__(self, db, agent_name, session_id, workflow_type, policy_id, query):
        self.start_time = time.time()
        self.llm_start = None

    def mark_llm_start(self, prompt: str):
        self.llm_start = time.time()
        self.prompt = prompt

    def mark_llm_end(self, output: str):
        self.llm_latency_ms = int((time.time() - self.llm_start) * 1000)
        self.output = output

    def record(self, result, retrieval_scores=None, confidence=None):
        total_ms = int((time.time() - self.start_time) * 1000)
        db.execute(INSERT INTO agent_logs (...), {
            "agent_name": self.agent_name,
            "session_id": self.session_id,
            "policy_id": self.policy_id,
            "query": self.query,
            "status": "success" | "error" | "fallback",
            "confidence_score": confidence,
            "retrieval_score_avg": avg(retrieval_scores),
            "input_tokens": estimated_input_tokens,
            "output_tokens": estimated_output_tokens,
            "llm_latency_ms": self.llm_latency_ms,
            "total_latency_ms": total_ms,
            "created_at": now()
        })
```

### Metrics Dashboard

**File:** `backend/apps/api/observability/metrics.py`

The `get_agent_metrics()` function aggregates per-agent statistics over a configurable time window:

```json
GET /observability/metrics?hours=24

{
  "window_hours": 24,
  "agents": [
    {
      "agent_name": "ComplianceAgent",
      "total_calls": 142,
      "successes": 138,
      "errors": 2,
      "fallbacks": 2,
      "success_rate": 0.9718,
      "avg_latency_ms": 3240,
      "p50_latency_ms": 2980,
      "p95_latency_ms": 6100,
      "avg_confidence": 0.7312,
      "avg_retrieval_score": 0.6890,
      "total_input_tokens": 284000,
      "total_output_tokens": 71000,
      "avg_llm_latency_ms": 2100
    }
  ]
}
```

### Token Usage & Cost Tracking

```json
GET /observability/tokens?hours=24

{
  "window_hours": 24,
  "total_input_tokens": 1240000,
  "total_output_tokens": 310000,
  "total_tokens": 1550000,
  "total_calls": 520,
  "avg_input_tokens": 2384.6,
  "avg_output_tokens": 596.2,
  "estimated_cost_usd": 0.697875
}
```

**Cost estimation formula:**
```python
# Claude Haiku approximate pricing
est_cost_usd = (total_input / 1000 × 0.00025) + (total_output / 1000 × 0.00125)
```

### Error Reporting

```json
GET /observability/errors?hours=24

{
  "window_hours": 24,
  "errors": [
    {
      "agent": "SimulationAgent",
      "error": "AWS Bedrock throttling: ThrottlingException",
      "occurrences": 4,
      "last_seen": "2026-03-06T14:22:11Z"
    }
  ]
}
```

### Session Tracing

```json
GET /observability/session/session-abc-123

{
  "session_id": "session-abc-123",
  "total_steps": 5,
  "total_tokens": 18420,
  "total_latency_ms": 12300,
  "trace": [
    {
      "agent": "PolicyAnalystAgent",
      "status": "success",
      "confidence": 0.82,
      "retrieval_avg": 0.76,
      "llm_ms": 2100,
      "total_ms": 2350,
      "tokens_in": 3200,
      "tokens_out": 820,
      "timestamp": "2026-03-06T14:20:01Z"
    },
    {
      "agent": "ComplianceAgent",
      "status": "success",
      "confidence": 0.71,
      ...
    }
  ]
}
```

---

## 🧪 Evaluation & Benchmarking

### Evaluation Harness

**File:** `backend/apps/api/evaluation/harness.py`

The `run_eval_suite()` function runs predefined scenarios against real agents and produces a detailed benchmark report.

```python
def run_eval_suite(db, policy_id, scenario_tags=None, run_id=None) -> dict:
    # For each scenario:
    # 1. Instantiate the appropriate agent
    # 2. Run with scenario input against policy_id
    # 3. Measure: verdict accuracy, field completeness, confidence, retrieval precision, latency
    # 4. Compute pass/fail based on expected_verdict_contains or expected_fields_present
    # 5. Aggregate into benchmark report
```

### Predefined Scenarios

**File:** `backend/apps/api/evaluation/scenarios.py`

Each scenario defines:

```python
EVAL_SCENARIOS = [
    {
        "name": "Late Submission Compliance Check",
        "agent": "compliance",
        "input": "An implementing officer accepted a vendor application submitted 45 days after the deadline without invoking the penalty clause.",
        "expected_verdict_contains": ["VIOLATION", "PARTIAL_VIOLATION"],
        "expected_fields_present": ["verdict", "violated_clauses", "legal_exposure"],
        "tags": ["compliance", "procurement"],
        "timeout_seconds": 30,
    },
    {
        "name": "Risk Scoring — Ambiguous Eligibility",
        "agent": "risk_assessment",
        "input": "Full risk assessment focusing on eligibility criteria ambiguity",
        "expected_fields_present": ["overall_risk_score", "ambiguity_score", "top_risks"],
        "min_confidence_score": 0.5,
        "tags": ["risk", "eligibility"],
        "timeout_seconds": 30,
    },
    # ... more scenarios across all agent types
]
```

### Benchmark Metrics

Each scenario is scored on:

| Metric | Description | Scoring |
|--------|-------------|---------|
| **Verdict Accuracy** | Does the verdict match expected values? | Pass/Fail |
| **Field Completeness** | Are all expected JSON fields present? | % complete |
| **Confidence Score** | Is confidence ≥ minimum threshold? | Pass/Fail |
| **Retrieval Precision** | Average score of retrieved clauses | 0.0–1.0 |
| **Latency** | Did response arrive within timeout? | Pass/Fail |

**Benchmark Report:**
```json
{
  "run_id": "eval-20260306-001",
  "policy_id": 42,
  "total_scenarios": 15,
  "passed": 12,
  "failed": 3,
  "pass_rate": 0.80,
  "avg_confidence": 0.72,
  "avg_retrieval_precision": 0.68,
  "avg_latency_ms": 3850,
  "results": [
    {
      "scenario": "Late Submission Compliance Check",
      "agent": "compliance",
      "passed": true,
      "verdict": "PARTIAL_VIOLATION",
      "confidence": 0.78,
      "retrieval_precision": 0.71,
      "latency_ms": 3200,
      "field_completeness": 1.0
    }
  ]
}
```

---

## 🗄️ Database Schema

### Policies Table

```sql
CREATE TABLE policies (
    id          SERIAL PRIMARY KEY,
    title       VARCHAR(255) NOT NULL,
    description TEXT
);
```

### Clauses Table

```sql
CREATE TABLE clauses (
    id             SERIAL PRIMARY KEY,
    policy_id      INTEGER REFERENCES policies(id) ON DELETE CASCADE,
    clause_number  VARCHAR(64) NOT NULL,
    text           TEXT NOT NULL,
    embedding      VECTOR(1024)     -- AWS Bedrock Titan 1024-dim vector
);

-- IVFFlat index for fast cosine-distance search
CREATE INDEX clauses_embedding_idx
    ON clauses USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);
```

### Agent Logs Table

```sql
CREATE TABLE agent_logs (
    id                  SERIAL PRIMARY KEY,
    agent_name          VARCHAR(100) NOT NULL,
    session_id          VARCHAR(100),
    workflow_type       VARCHAR(100),
    policy_id           INTEGER,
    query               TEXT,
    status              VARCHAR(20),      -- 'success' | 'error' | 'fallback'
    confidence_score    FLOAT,
    retrieval_score_avg FLOAT,
    input_tokens        INTEGER,
    output_tokens       INTEGER,
    llm_latency_ms      INTEGER,
    total_latency_ms    INTEGER,
    error_message       TEXT,
    result_json         JSONB,
    created_at          TIMESTAMP DEFAULT NOW()
);

-- Index for metrics queries
CREATE INDEX agent_logs_created_at_idx ON agent_logs (created_at DESC);
CREATE INDEX agent_logs_session_idx    ON agent_logs (session_id);
CREATE INDEX agent_logs_agent_idx      ON agent_logs (agent_name);
```

### pgvector IVFFlat Index Setup

The IVFFlat index requires `lists` to be set before inserting data:

```sql
-- For small datasets (< 10K vectors): lists = 10-50
-- For medium datasets (< 100K vectors): lists = 100 (used here)
-- For large datasets (> 1M vectors): lists = 1000+

-- After inserting data, the index is built automatically on next VACUUM or:
REINDEX INDEX clauses_embedding_idx;

-- To set search probes (higher = more accurate, slower):
SET ivfflat.probes = 10;  -- default is 1
```

---

## 🖥️ Frontend Deep Dive

### App Router Pages

**File Structure:** `frontend/app/`

| Page | Route | Description |
|------|-------|-------------|
| Landing | `/` | Interactive globe, feature cards, knowledge graph animation |
| Login | `/login` | Email entry + OTP verification with animated background |
| Signup | `/signup` | Registration with Aadhaar field (frontend-only) |
| Dashboard | `/dashboard` | Policy count, agent call stats, recent activity |
| Upload | `/upload` | Drag-and-drop file upload with history |
| Policies | `/policies` | Paginated policy list + clause browser |
| Agents | `/agents` | Direct agent invocation UI with response explorer |
| Orchestrator | `/orchestrator` | Multi-agent workflow UI with live progress |
| Tasks | `/tasks` | Task queue management |
| Evaluation | `/evaluation` | Benchmark runner + results visualization |
| Observability | `/observability` | Metrics charts, traces, cost dashboards |

### Component Architecture

The frontend follows a clear component hierarchy:

```
app/layout.tsx
  └── ThemeProvider
        └── AuthProvider
              └── DashboardLayout (for authenticated pages)
                    ├── Sidebar
                    │     └── Navigation links
                    ├── Topbar
                    │     └── ThemeToggle + User info
                    └── <page content>
                          ├── PolicyTable
                          ├── ClauseViewer
                          ├── UploadBox
                          ├── ResponseRenderer  ← universal agent output renderer
                          └── StatsCard
```

### Authentication Context

**File:** `frontend/context/AuthContext.tsx`

```typescript
interface AuthContextType {
  user: { email: string } | null;
  token: string | null;
  login: (email: string, otp: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

// Persists JWT to localStorage
// Automatically redirects unauthenticated users to /login
// Injects token into all API calls via lib/api.ts
```

### API Integration Layer

**File:** `frontend/lib/api.ts`

All backend API calls go through a centralized `api.ts` module that:

1. Reads the `NEXT_PUBLIC_API_BASE_URL` environment variable
2. Attaches `Authorization: Bearer <token>` to every request
3. Handles 401 responses by clearing auth state and redirecting to login
4. Provides typed response objects matching backend Pydantic schemas

```typescript
const api = {
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',

  async post<T>(path: string, body: unknown): Promise<T> {
    const token = localStorage.getItem('access_token');
    const res = await fetch(`${this.baseURL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });
    if (res.status === 401) { /* redirect to login */ }
    return res.json();
  },

  // Typed wrappers:
  sendOTP: (email: string) => api.post('/auth/send-otp', { email }),
  verifyOTP: (email: string, otp: string) => api.post<TokenResponse>('/auth/verify-otp', { email, otp }),
  runCompliance: (scenario: string, policy_id: number) => api.post('/agents/compliance', { scenario, policy_id }),
  runOrchestrator: (body: OrchestratorRequest) => api.post('/orchestrator/run', body),
  // ...
};
```

### UI Components & Design System

The frontend uses a custom design system built on Tailwind CSS v4:

**Button Component (`components/ui/Button.tsx`):**
- Variants: `primary`, `secondary`, `danger`, `ghost`
- Sizes: `sm`, `md`, `lg`
- Loading state with spinner

**Card Component (`components/ui/Card.tsx`):**
- Optional header, body, footer sections
- Hover shadow effect
- Dark mode compatible

**ResponseRenderer (`components/shared/ResponseRenderer.tsx`):**
- Universal renderer for any agent JSON response
- Formats confidence badges (HIGH=green, MEDIUM=yellow, LOW=red, INSUFFICIENT=gray)
- Renders source clauses as expandable list
- Renders nested JSON with syntax highlighting
- Copy-to-clipboard for full response

**Interactive Globe (`components/ui/interactive-globe.tsx`):**
- Three.js or CSS-based animated globe on landing page
- Visualizes the "national scale" concept

**Knowledge Graph (`components/ui/knowledge-graph.tsx`):**
- Animated D3/SVG visualization of policy clause relationships
- Node colors represent clause types
- Edge thickness represents relationship strength

---

## 🐳 Docker & Infrastructure

### Docker Compose Stack

**File:** `docker-compose.yml` (root)

```yaml
version: "3.9"

services:
  db:
    image: pgvector/pgvector:pg16    # PostgreSQL 16 + pgvector extension
    environment:
      POSTGRES_DB: bharat
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./backend/infra/init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 10

  api:
    build:
      context: ./backend
      dockerfile: infra/Dockerfile
    ports:
      - "8000:8000"
    depends_on:
      db:
        condition: service_healthy    # Wait for DB to be ready
    env_file:
      - ./backend/.env
    environment:
      DATABASE_URL: postgresql://postgres:postgres@db:5432/bharat
    volumes:
      - ./backend:/app               # Hot reload in development
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_BASE_URL: http://localhost:8000
    depends_on:
      - api
    restart: unless-stopped

volumes:
  pgdata:                            # Persistent PostgreSQL data
```

### Backend Dockerfile

**File:** `backend/infra/Dockerfile`

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for psycopg2
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "apps.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Frontend Dockerfile

**File:** `frontend/Dockerfile`

```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["npm", "start"]
```

### Database Initialization

**File:** `backend/infra/init.sql`

Executed automatically by the `pgvector/pgvector:pg16` Docker image on first start:

```sql
-- Enable the pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Core tables
CREATE TABLE IF NOT EXISTS policies (...);
CREATE TABLE IF NOT EXISTS clauses (...);
CREATE TABLE IF NOT EXISTS agent_logs (...);

-- pgvector IVFFlat index
CREATE INDEX IF NOT EXISTS clauses_embedding_idx
    ON clauses USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);
```

---

## ⚙️ Configuration & Environment Variables

### Backend Environment

**File:** `backend/.env`

```bash
# ── Database ──────────────────────────────────────────────────────────
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/bharat

# ── JWT Authentication ────────────────────────────────────────────────
JWT_SECRET_KEY=your-super-secret-key-change-before-production-CHANGE-THIS
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=60

# ── OTP Configuration ─────────────────────────────────────────────────
OTP_EXPIRE_MINUTES=10

# ── SMTP (Gmail App Password) ─────────────────────────────────────────
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-gmail@gmail.com
SMTP_PASSWORD=your-gmail-app-password   # NOT your regular password!
SMTP_FROM=your-gmail@gmail.com

# ── AWS Bedrock ───────────────────────────────────────────────────────
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1

# ── Bedrock Models ────────────────────────────────────────────────────
BEDROCK_LLM_MODEL_ID=anthropic.claude-3-haiku-20240307-v1:0
BEDROCK_EMBEDDING_MODEL_ID=amazon.titan-embed-text-v2:0
```

**Setting up Gmail SMTP:**
1. Enable 2-Factor Authentication on your Google account
2. Go to [Google Account → Security → App passwords](https://myaccount.google.com/apppasswords)
3. Generate an App Password for "Mail"
4. Use this App Password as `SMTP_PASSWORD` — NOT your Google account password

**⚠️ Security Warning:** Change `JWT_SECRET_KEY` to a cryptographically random string before deploying to production:
```bash
openssl rand -hex 32
```

### Frontend Environment

**File:** `frontend/.env.local`

```bash
# Backend API URL (no trailing slash)
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000

# For production deployment:
# NEXT_PUBLIC_API_BASE_URL=https://api.your-domain.com
```

---

## 🚀 Getting Started

### Prerequisites

| Requirement | Version | Purpose |
|-------------|---------|---------|
| Docker & Docker Compose | 24.0+ | Full-stack containerization |
| Node.js | 20.0+ | Frontend development |
| Python | 3.11+ | Backend development |
| AWS Account | — | Bedrock API access (Claude + Titan) |
| Gmail Account | — | OTP email delivery |
| PostgreSQL | 16+ | With pgvector extension |

### Option 1: Docker (Recommended)

The easiest way to run the entire stack with a single command:

```bash
# 1. Clone the repository
git clone https://github.com/your-org/bharat-policy-twin.git
cd bharat-policy-twin

# 2. Configure backend environment
cp backend/.env.example backend/.env
# Edit backend/.env with your AWS credentials, Gmail SMTP, and JWT secret

# 3. Build and start all services
docker-compose up --build

# 4. Verify services are running
curl http://localhost:8000/health      # Backend health check
curl http://localhost:3000             # Frontend landing page
open http://localhost:8000/docs        # Swagger API documentation
```

**Service URLs:**

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | Next.js dashboard |
| Backend API | http://localhost:8000 | FastAPI application |
| API Documentation | http://localhost:8000/docs | Swagger UI |
| ReDoc | http://localhost:8000/redoc | Alternative API docs |
| PostgreSQL | localhost:5432 | Direct database access |

**Stopping the stack:**
```bash
docker-compose down              # Stop containers
docker-compose down -v           # Stop containers + delete database volume
```

### Option 2: Local Development

For development with hot-reloading:

**Backend:**
```bash
cd backend

# Create virtual environment
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start PostgreSQL (via Docker, separately)
docker run -d \
  --name bharat-postgres \
  -e POSTGRES_DB=bharat \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  pgvector/pgvector:pg16

# Configure environment
cp .env.example .env
# Edit .env with your credentials

# Start the API server with hot-reload
uvicorn apps.api.main:app --reload --port 8000

# Verify: http://localhost:8000/docs
```

**Frontend:**
```bash
cd frontend

# Install dependencies
npm install

# Configure environment
echo "NEXT_PUBLIC_API_BASE_URL=http://localhost:8000" > .env.local

# Start development server with hot-reload
npm run dev

# Verify: http://localhost:3000
```

### Option 3: Hybrid (DB in Docker, App Local)

Best for development when you want persistent data but fast iteration:

```bash
# Start only the database
docker-compose up db

# Run backend locally (connects to Docker PostgreSQL)
cd backend
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/bharat \
uvicorn apps.api.main:app --reload --port 8000

# Run frontend locally
cd frontend
npm run dev
```

### Seeding Synthetic Data

Load example policies and clauses for testing:

```bash
# With Docker running:
docker-compose exec api python seed_synthetic_db.py

# Or locally:
cd backend
python seed_synthetic_db.py
```

The seeder creates:
- 5 synthetic Indian government policy documents
- 50-100 clauses per policy
- Pre-embedded vectors for all clauses
- Sample agent_log entries for observability testing

---

## 🧩 Technology Stack

### Backend Stack

| Technology | Version | Role |
|------------|---------|------|
| **Python** | 3.11+ | Primary backend language |
| **FastAPI** | 0.115.6 | REST API framework |
| **Uvicorn** | 0.32.1 | ASGI server with standard extras |
| **SQLAlchemy** | 2.0.35 | ORM + database toolkit |
| **pgvector** | 0.3.6 | Python pgvector integration |
| **psycopg2-binary** | 2.9.10 | PostgreSQL driver |
| **LangChain** | 0.3.7 | LLM orchestration framework |
| **LangGraph** | 0.2.45 | Multi-agent workflow state machine |
| **langchain-aws** | 0.2.4 | AWS Bedrock LangChain integration |
| **boto3** | 1.35.0 | AWS SDK (Bedrock API) |
| **python-jose** | 3.3.0 | JWT encoding/decoding |
| **passlib** | 1.7.4 | Password hashing |
| **pypdf** | 5.1.0 | PDF text extraction |
| **pydantic** | 2.9.2 | Data validation and schemas |
| **numpy** | 1.26.4 | Numerical operations |
| **scipy** | 1.13.1 | Statistical analysis |
| **scikit-learn** | 1.5.2 | ML utilities |
| **pandas** | 2.2.3 | Data manipulation |
| **aiohttp** | 3.10.10 | Async HTTP client |
| **httpx** | 0.27.2 | HTTP client for testing |
| **orjson** | 3.10.7 | Fast JSON serialization |

### Frontend Stack

| Technology | Version | Role |
|------------|---------|------|
| **Next.js** | 16.1.6 | React framework with App Router |
| **React** | 19.2.3 | UI library |
| **TypeScript** | 5.0+ | Static typing |
| **Tailwind CSS** | 4.0 | Utility-first CSS framework |
| **Framer Motion** | 12.34.3 | Animations and transitions |
| **Lucide React** | 0.575.0 | Icon library |
| **Recharts** | 3.7.0 | Data visualization charts |
| **react-dropzone** | 15.0.0 | File upload drag-and-drop |
| **@radix-ui/react-slot** | 1.2.4 | Composable UI primitives |
| **class-variance-authority** | 0.7.1 | Component variant management |
| **clsx** | 2.1.1 | Conditional className utility |
| **tailwind-merge** | 3.5.0 | Smart Tailwind class merging |

### Infrastructure Stack

| Technology | Version | Role |
|------------|---------|------|
| **PostgreSQL** | 16 | Primary relational database |
| **pgvector** | 0.7.0 | Vector similarity search extension |
| **AWS Bedrock** | — | Managed LLM + Embedding API |
| **Claude (Haiku)** | claude-3-haiku | Policy analysis LLM |
| **Titan Embeddings** | v2 | 1024-dim document embeddings |
| **Docker** | 24+ | Container runtime |
| **Docker Compose** | 2.0+ | Multi-service orchestration |
| **Gmail SMTP** | — | OTP email delivery |

---

## 🔧 Development Guide

### Adding a New Agent

1. **Create the agent file** in `backend/apps/api/agents/`:

```python
# backend/apps/api/agents/my_new_agent.py
"""Agent N — My New Analysis Agent."""

from sqlalchemy.orm import Session
from apps.api.agents.base_agent import BaseAgent, GUARDRAIL_SUFFIX
from apps.api.observability.logger import AgentTrace

PROMPT = """You are a specialized policy analysis expert. Given policy clauses, perform [your analysis].

Return EXACTLY this JSON format:
{{
  "field_1": "string",
  "field_2": ["list"],
  "field_3": 0,
  "insufficient_information": false,
  "agent": "MyNewAgent"
}}

Return ONLY valid JSON.{guardrail}

Policy Clauses:
{clauses}

Analysis context: {context}"""


class MyNewAgent(BaseAgent):
    agent_name = "MyNewAgent"

    def run(
        self,
        db: Session,
        context: str = "",
        policy_id: int | None = None,
        session_id: str | None = None,
        workflow_type: str | None = None,
    ) -> dict:
        with AgentTrace(db, self.agent_name, session_id, workflow_type, policy_id, context) as trace:
            # 1. Retrieve relevant clauses from pgvector
            clauses, avg_score = self.retrieve_context(db, context, top_k=8, policy_id=policy_id)

            # 2. Guard against insufficient information
            if not self.check_insufficient_info(clauses, avg_score):
                result = self.insufficient_info_response()
                trace.record(result)
                return result

            # 3. Build and call LLM
            prompt = PROMPT.format(
                clauses=self._format_clauses(clauses),
                context=context,
                guardrail=GUARDRAIL_SUFFIX,
            )
            trace.mark_llm_start(prompt)
            raw, in_tok, out_tok = self.call_llm(prompt, max_tokens=2048)
            trace.mark_llm_end(raw)

            # 4. Parse, score confidence, record
            result = self.parse_json_output(raw)
            confidence = self.compute_confidence(
                avg_score, len(clauses), not result.get("insufficient_information")
            )
            result["confidence"] = confidence
            result["source_clauses"] = [
                {"clause_number": c["clause_number"], "score": c["score"]} for c in clauses
            ]
            trace.record(
                result,
                retrieval_scores=[c["score"] for c in clauses],
                confidence=confidence["score"],
            )
            return result
```

2. **Register the router** in `backend/apps/api/routers/agents.py`:

```python
from apps.api.agents.my_new_agent import MyNewAgent

@router.post("/my-new-agent")
def run_my_new_agent(
    body: MyNewAgentRequest,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    return MyNewAgent().run(db, context=body.context, policy_id=body.policy_id)
```

3. **Add it to the LangGraph workflow** (optional) in `backend/apps/api/orchestrator/workflow_graph.py`

4. **Add evaluation scenarios** in `backend/apps/api/evaluation/scenarios.py`

### Adding a New API Router

```python
# backend/apps/api/routers/my_router.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from apps.api.database import get_db
from apps.api.routers.auth import get_current_user

router = APIRouter(prefix="/my-feature", tags=["my-feature"])

@router.get("/")
def my_endpoint(
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    return {"status": "ok", "user": current_user}
```

Register in `backend/apps/api/main.py`:
```python
from apps.api.routers.my_router import router as my_router
app.include_router(my_router)
```

### Extending the Workflow Graph

Add a new node to `PolicyWorkflowState` and the LangGraph `StateGraph`:

```python
# In workflow_graph.py

def node_my_new_analysis(state: PolicyWorkflowState) -> dict:
    logger.info("🔍 Node: My New Analysis")
    from apps.api.agents.my_new_agent import MyNewAgent
    try:
        result = MyNewAgent().run(
            state["db"],
            context=state["query"],
            policy_id=state["policy_id"],
            **_kwargs(state),
        )
        return {"agent_results": {"my_new_analysis": result}}
    except Exception as e:
        logger.error(f"MyNewAgent error: {e}")
        return {"agent_results": {"my_new_analysis": {"error": str(e)}}}

# Add to StateGraph
graph = StateGraph(PolicyWorkflowState)
graph.add_node("my_new_analysis", node_my_new_analysis)
graph.add_edge("risk_assessment", "my_new_analysis")
graph.add_edge("my_new_analysis", "self_evaluation")
```

### Adding Evaluation Scenarios

```python
# In backend/apps/api/evaluation/scenarios.py

EVAL_SCENARIOS.append({
    "name": "My New Agent — Test Scenario",
    "agent": "my_new_agent",
    "input": "Specific scenario text that should trigger clear output...",
    "expected_fields_present": ["field_1", "field_2", "field_3"],
    "min_confidence_score": 0.5,
    "tags": ["my-feature", "custom"],
    "timeout_seconds": 30,
})
```

---

## 📈 Performance & Scalability

### Confidence Thresholds

Tuning confidence thresholds affects the balance between response rate and accuracy:

```python
# Conservative (fewer responses, higher accuracy):
CONFIDENCE_HIGH   = 0.80
CONFIDENCE_MEDIUM = 0.60
CONFIDENCE_LOW    = 0.20   # Higher threshold → more fallbacks

# Aggressive (more responses, accept lower quality):
CONFIDENCE_HIGH   = 0.70
CONFIDENCE_MEDIUM = 0.50
CONFIDENCE_LOW    = 0.05   # Lower threshold → fewer fallbacks
```

### pgvector Performance

For optimal performance as the clause store grows:

```sql
-- Check current index statistics
SELECT * FROM pg_stat_user_indexes WHERE indexname = 'clauses_embedding_idx';

-- Increase probes for better recall at cost of latency
SET ivfflat.probes = 20;  -- default 1; 10-20 is a good balance

-- For >100K vectors, increase lists during index rebuild:
DROP INDEX clauses_embedding_idx;
CREATE INDEX clauses_embedding_idx
    ON clauses USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 500);  -- Adjust for dataset size

-- Estimate: lists ≈ sqrt(total_vectors)
-- For 10K vectors: lists=100, For 1M vectors: lists=1000
```

### LLM Cost Optimization

| Strategy | Implementation | Estimated Savings |
|----------|---------------|-------------------|
| `temperature=0.0` | Already implemented — no retries | 30-50% |
| Limit `top_k` | Agents use 8-12 (tuned) | 20-40% |
| Truncate input | 8000 char limit in `_embed()` | 10-20% |
| Cache embeddings | Embed once, reuse for same clause | 80%+ for repeated queries |
| Use Haiku vs Sonnet | Claude Haiku is 20x cheaper | Already optimized |

**Adding embedding caching (future improvement):**
```python
import hashlib

def embed_with_cache(self, text: str, db: Session) -> list[float]:
    text_hash = hashlib.sha256(text.encode()).hexdigest()
    cached = db.execute("SELECT embedding FROM embedding_cache WHERE hash = :h", {"h": text_hash}).fetchone()
    if cached:
        return json.loads(cached.embedding)
    embedding = self._embed_raw(text)
    db.execute("INSERT INTO embedding_cache VALUES (:h, :e)", {"h": text_hash, "e": json.dumps(embedding)})
    return embedding
```

---

## 🛡️ Security Considerations

### Before Deploying to Production

| Item | Action Required |
|------|----------------|
| `JWT_SECRET_KEY` | Generate with `openssl rand -hex 32` |
| AWS credentials | Rotate keys, use IAM roles instead of static keys |
| Gmail App Password | Use dedicated service account |
| CORS | Change `allow_origins=["*"]` to your specific domain |
| OTP Store | Move from in-memory dict to Redis for multi-instance deployments |
| HTTPS | Configure TLS termination at load balancer/nginx level |
| PostgreSQL | Change default `postgres`/`postgres` credentials |
| Rate Limiting | Add `slowapi` middleware to prevent OTP abuse |
| `.env` | Never commit to version control (already in `.gitignore`) |

### Security Architecture

```
Internet
    │
    ▼
[HTTPS / TLS] ← Terminate at nginx/load balancer
    │
    ▼
[CORS Policy] ← Restrict to your domain
    │
    ▼
[Rate Limiter] ← 1000 req/hour per IP
    │
    ▼
[JWT Auth Middleware] ← Every protected endpoint
    │
    ▼
[FastAPI Handlers]
    │
    ▼
[SQLAlchemy ORM] ← Parameterized queries only (no raw SQL injection risk)
    │
    ▼
[PostgreSQL] ← Row-level auth can be added
```

---

## 🗺️ Roadmap

### Version 3.1 (Q2 2026)
- [ ] **Redis OTP Store** — Replace in-memory OTP storage with Redis for multi-instance support
- [ ] **Streaming Responses** — Server-Sent Events for real-time agent progress streaming
- [ ] **Embedding Cache** — Redis-backed embedding cache for repeated clause queries
- [ ] **Role-Based Access Control** — Admin, Analyst, Viewer roles with endpoint-level permissions

### Version 3.2 (Q3 2026)
- [ ] **Mobile App** — React Native mobile dashboard for field officers
- [ ] **Bulk Upload** — Upload and process entire policy document libraries
- [ ] **Policy Versioning** — Track amendments and show version diff between policy versions
- [ ] **Collaborative Review** — Multi-user annotation and comment threads on agent outputs
- [ ] **Export to PDF/DOCX** — Generate formatted compliance reports

### Version 4.0 (Q4 2026)
- [ ] **Reinforcement Learning** — RL-based policy optimization recommendations
- [ ] **External Data Integration** — RTI data, budget data, scheme dashboards
- [ ] **Multi-Language Support** — Hindi and regional language policy analysis
- [ ] **GraphQL API** — Flexible query interface for frontend diversity
- [ ] **Kubernetes Deployment** — Helm charts for scalable production deployment

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

### Development Setup

```bash
# Fork the repository on GitHub
git clone https://github.com/YOUR_USERNAME/bharat-policy-twin.git
cd bharat-policy-twin

# Create a feature branch
git checkout -b feature/my-new-agent

# Make your changes...

# Run tests
cd backend && python -m pytest tests/
cd frontend && npm run lint

# Commit with clear message
git commit -m "feat(agents): add Environmental Impact Agent"

# Push and open a Pull Request
git push origin feature/my-new-agent
```

### Contribution Guidelines

1. **New Agents**: Follow the `BaseAgent` pattern; include PROMPT, schema, and evaluation scenario
2. **API Endpoints**: Include Pydantic request/response models and docstrings
3. **Frontend**: Use the existing design system (Button, Card, Input components)
4. **Tests**: Add evaluation scenarios for any new agent
5. **Documentation**: Update this README for significant features

### Code Style

- **Python**: PEP 8, Black formatter, type hints required
- **TypeScript**: ESLint with Next.js config, explicit return types
- **SQL**: Uppercase keywords, lowercase table/column names
- **Commits**: Conventional Commits format (`feat:`, `fix:`, `docs:`, `refactor:`)

---

## 📄 License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2026 Bharat Policy Twin Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

---

<div align="center">

### 🇮🇳 Built for Bharat, Powered by AI

**Bharat Policy Twin** — Transforming policy documents into actionable intelligence for a better-governed India.

---

*Made with ❤️ by the Bharat Policy Twin Team*

[⭐ Star this repo](https://github.com/your-org/bharat-policy-twin) · [🐛 Report a Bug](https://github.com/your-org/bharat-policy-twin/issues) · [💡 Request a Feature](https://github.com/your-org/bharat-policy-twin/discussions)

</div>
