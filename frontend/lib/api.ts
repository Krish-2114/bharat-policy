import { Policy, Clause } from '@/types/policy';
import { getToken } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

// ─── Auth header helper ───────────────────────────────────────────────────────

function authHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const token = getToken();
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

// ─── Health ───────────────────────────────────────────────────────────────────

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/health`, { method: 'GET', cache: 'no-store' });
    return res.ok;
  } catch {
    return false;
  }
}

// ─── Policies ─────────────────────────────────────────────────────────────────

export async function getPolicies(): Promise<Policy[]> {
  const res = await fetch(`${API_BASE_URL}/policies`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to fetch policies: ${res.statusText}`);
  return res.json();
}

export async function getPolicyClauses(policyId: number): Promise<Clause[]> {
  const res = await fetch(`${API_BASE_URL}/policies/${policyId}/clauses`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to fetch clauses: ${res.statusText}`);
  return res.json();
}

// ─── Upload ───────────────────────────────────────────────────────────────────

export async function uploadPolicy(
  file: File,
  title: string
): Promise<{ success: boolean; message: string; policy_id?: number; clause_count?: number }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('title', title);

  const res = await fetch(`${API_BASE_URL}/upload-policy`, {
    method: 'POST',
    headers: authHeaders(), // No Content-Type — browser sets multipart boundary
    body: formData,
  });

  if (!res.ok) throw new Error(`Upload failed: ${res.statusText}`);
  const data = await res.json();
  return {
    success: true,
    message: data.message || `Policy "${title}" uploaded successfully.`,
    policy_id: data.policy_id,
    clause_count: data.clause_count,
  };
}

// ─── Agents ───────────────────────────────────────────────────────────────────

export async function runAgent(
  agentName: string,
  payload: Record<string, unknown>
): Promise<unknown> {
  const res = await fetch(`${API_BASE_URL}/agents/${agentName}`, {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Agent ${agentName} failed: ${res.statusText}`);
  return res.json();
}

// ─── Orchestrator ─────────────────────────────────────────────────────────────

export async function runOrchestrator(
  payload: Record<string, unknown>
): Promise<unknown> {
  const res = await fetch(`${API_BASE_URL}/orchestrator/run`, {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Orchestrator failed: ${res.statusText}`);
  return res.json();
}

export async function runOrchestratorAuto(payload: {
  query: string;
  policy_id?: number | null;
  policy_id_b?: number | null;
  session_id?: string | null;
}): Promise<unknown> {
  const res = await fetch(`${API_BASE_URL}/orchestrator/auto`, {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Orchestrator auto failed: ${res.statusText}`);
  return res.json();
}

export async function runOrchestratorWorkflow(payload: {
  query: string;
  workflow_type: string;
  policy_id?: number | null;
  policy_id_b?: number | null;
  session_id?: string | null;
}): Promise<unknown> {
  const res = await fetch(`${API_BASE_URL}/orchestrator/workflow`, {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Workflow failed: ${res.statusText}`);
  return res.json();
}

export async function listWorkflows(): Promise<unknown> {
  const res = await fetch(`${API_BASE_URL}/orchestrator/workflows`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to list workflows: ${res.statusText}`);
  return res.json();
}

export async function getSession(sessionId: string): Promise<unknown> {
  const res = await fetch(`${API_BASE_URL}/orchestrator/session/${sessionId}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to get session: ${res.statusText}`);
  return res.json();
}

// ─── Observability ────────────────────────────────────────────────────────────

export async function getObservabilityMetrics(hours = 24): Promise<unknown> {
  const res = await fetch(`${API_BASE_URL}/observability/metrics?hours=${hours}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to fetch metrics: ${res.statusText}`);
  return res.json();
}

export async function getSessionTrace(sessionId: string): Promise<unknown> {
  const res = await fetch(`${API_BASE_URL}/observability/trace/${sessionId}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to fetch trace: ${res.statusText}`);
  return res.json();
}

export async function getErrorReport(hours = 24): Promise<unknown> {
  const res = await fetch(`${API_BASE_URL}/observability/errors?hours=${hours}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to fetch errors: ${res.statusText}`);
  return res.json();
}

export async function getTokenUsage(hours = 24): Promise<unknown> {
  const res = await fetch(`${API_BASE_URL}/observability/tokens?hours=${hours}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to fetch token usage: ${res.statusText}`);
  return res.json();
}

export async function getDetailedHealth(): Promise<unknown> {
  const res = await fetch(`${API_BASE_URL}/observability/health-detailed`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to fetch health: ${res.statusText}`);
  return res.json();
}

// ─── Evaluation ───────────────────────────────────────────────────────────────

export async function runEvaluation(payload: {
  policy_id: number;
  tags?: string[] | null;
  run_id?: string | null;
}): Promise<unknown> {
  const res = await fetch(`${API_BASE_URL}/evaluation/run`, {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Evaluation failed: ${res.statusText}`);
  return res.json();
}

export async function getEvalHistory(limit = 20): Promise<unknown> {
  const res = await fetch(`${API_BASE_URL}/evaluation/history?limit=${limit}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to fetch eval history: ${res.statusText}`);
  return res.json();
}

export async function listEvalScenarios(): Promise<unknown> {
  const res = await fetch(`${API_BASE_URL}/evaluation/scenarios`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to fetch scenarios: ${res.statusText}`);
  return res.json();
}
