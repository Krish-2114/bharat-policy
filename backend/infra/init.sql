-- Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- Policies table
CREATE TABLE IF NOT EXISTS policies (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT
);

-- Clauses table with persistent vector embeddings
CREATE TABLE IF NOT EXISTS clauses (
    id SERIAL PRIMARY KEY,
    policy_id INTEGER NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
    clause_number VARCHAR(64) NOT NULL,
    text TEXT NOT NULL,
    embedding vector(1024),
    -- metadata for confidence scoring
    char_count INTEGER GENERATED ALWAYS AS (length(text)) STORED,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- IVFFlat vector index for fast similarity search (production-grade)
-- lists=100 works well for up to 1M vectors
CREATE INDEX IF NOT EXISTS clauses_embedding_idx
    ON clauses USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);

-- Regular indexes
CREATE INDEX IF NOT EXISTS clauses_policy_id_idx ON clauses(policy_id);

-- Agent execution logs (Observability Layer)
CREATE TABLE IF NOT EXISTS agent_logs (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(64),
    agent_name VARCHAR(64) NOT NULL,
    workflow_type VARCHAR(64),
    policy_id INTEGER,
    query TEXT,
    status VARCHAR(16) NOT NULL DEFAULT 'success', -- success | error | fallback
    confidence_score FLOAT,
    retrieval_score_avg FLOAT,
    retrieval_clause_count INTEGER,
    llm_latency_ms INTEGER,
    total_latency_ms INTEGER,
    input_tokens INTEGER,
    output_tokens INTEGER,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Evaluation results table (Benchmarking Layer)
CREATE TABLE IF NOT EXISTS eval_results (
    id SERIAL PRIMARY KEY,
    eval_run_id VARCHAR(64) NOT NULL,
    scenario_name VARCHAR(128) NOT NULL,
    agent_name VARCHAR(64) NOT NULL,
    policy_id INTEGER,
    input_query TEXT NOT NULL,
    expected_verdict VARCHAR(64),
    actual_verdict VARCHAR(64),
    verdict_correct BOOLEAN,
    confidence_score FLOAT,
    retrieval_precision FLOAT,
    latency_ms INTEGER,
    passed BOOLEAN NOT NULL DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS agent_logs_session_idx ON agent_logs(session_id);
CREATE INDEX IF NOT EXISTS agent_logs_agent_idx ON agent_logs(agent_name);
CREATE INDEX IF NOT EXISTS agent_logs_created_idx ON agent_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS eval_results_run_idx ON eval_results(eval_run_id);
