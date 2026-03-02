"use client";

import React, { useState, useEffect } from 'react';
import {
  Cpu, Zap, GitBranch, Play, Loader2, ChevronDown,
  CheckCircle2, Clock, RotateCcw, Copy, CheckCheck,
  Layers, Brain, Shield, Network, FlaskConical, Search
} from 'lucide-react';
import { runOrchestratorAuto, runOrchestratorWorkflow, listWorkflows, getPolicies } from '@/lib/api';
import { useTheme } from '@/context/ThemeContext';
import { ReportButton } from '@/components/reports/ReportGenerator';
import { Policy } from '@/types/policy';

interface Workflow {
  type: string;
  description: string;
  agents: string[];
  best_for: string;
}

interface OrchestratorResult {
  agents_used?: string[];
  agents_executed?: string[];
  final_answer?: string;
  synthesis?: string;
  results?: Record<string, unknown>;
  agent_results?: Record<string, unknown>;
  session_id?: string;
  [key: string]: unknown;
}

const WORKFLOW_ICONS: Record<string, React.ElementType> = {
  compliance_investigation: Shield,
  deep_audit: Search,
  comparison: GitBranch,
  impact_simulation: FlaskConical,
  knowledge_graph: Network,
};

const WORKFLOW_COLORS: Record<string, string> = {
  compliance_investigation: 'blue',
  deep_audit: 'purple',
  comparison: 'cyan',
  impact_simulation: 'emerald',
  knowledge_graph: 'teal',
};

const colorMap: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', glow: 'shadow-blue-500/20' },
  purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20', glow: 'shadow-purple-500/20' },
  cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20', glow: 'shadow-cyan-500/20' },
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', glow: 'shadow-emerald-500/20' },
  teal: { bg: 'bg-teal-500/10', text: 'text-teal-400', border: 'border-teal-500/20', glow: 'shadow-teal-500/20' },
};

export default function OrchestratorPage() {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<'auto' | 'workflow'>('auto');
  const [query, setQuery] = useState('');
  const [policyId, setPolicyId] = useState('');
  const [policyIdB, setPolicyIdB] = useState('');
  const [selectedWorkflow, setSelectedWorkflow] = useState('compliance_investigation');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OrchestratorResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    listWorkflows()
      .then((d) => setWorkflows((d as { workflows: Workflow[] }).workflows || []))
      .catch(() => {});
    getPolicies().then(setPolicies).catch(() => {});
  }, []);

  const handleRun = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let res: unknown;
      if (activeTab === 'auto') {
        res = await runOrchestratorAuto({
          query,
          policy_id: policyId ? parseInt(policyId) : null,
          policy_id_b: policyIdB ? parseInt(policyIdB) : null,
          session_id: sessionId || null,
        });
      } else {
        res = await runOrchestratorWorkflow({
          query,
          workflow_type: selectedWorkflow,
          policy_id: policyId ? parseInt(policyId) : null,
          policy_id_b: policyIdB ? parseInt(policyIdB) : null,
          session_id: sessionId || null,
        });
      }

      const resObj = res as OrchestratorResult;
      if (resObj?.session_id) setSessionId(resObj.session_id);
      setResult(resObj);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Orchestrator failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentWorkflow = workflows.find(w => w.type === selectedWorkflow);
  const workflowColor = colorMap[WORKFLOW_COLORS[selectedWorkflow] || 'blue'];

  return (
    <div className="flex flex-col gap-6 h-full w-full max-w-7xl mx-auto px-4 md:px-8 py-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-white tracking-tight">🧠 Orchestrator</h1>
        <p className="text-sm text-gray-400">
          Multi-agent coordination via auto-routing (LLM decides) or LangGraph multi-step workflows.
        </p>
      </div>

      <div className="flex gap-1 bg-white/5 border border-white/10 rounded-xl p-1 w-fit">
        <button
          onClick={() => setActiveTab('auto')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all
            ${activeTab === 'auto' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-gray-400 hover:text-white'}`}
        >
          <Brain className="w-4 h-4" /> Auto-Route
        </button>
        <button
          onClick={() => setActiveTab('workflow')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all
            ${activeTab === 'workflow' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'text-gray-400 hover:text-white'}`}
        >
          <GitBranch className="w-4 h-4" /> LangGraph Workflow
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        <div className="lg:col-span-2 space-y-4">
          {activeTab === 'auto' ? (
            <div className="rounded-2xl bg-gradient-to-br from-blue-500/10 border border-blue-500/20 p-5 shadow-xl">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0">
                  <Brain className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">🤖 Task Router Agent</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    The LLM analyzes your query and automatically selects the most relevant agents to call. No configuration needed.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Select Workflow</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {workflows.map((wf) => {
                  const WfIcon = WORKFLOW_ICONS[wf.type] || Layers;
                  const c = colorMap[WORKFLOW_COLORS[wf.type] || 'blue'];
                  const isSelected = selectedWorkflow === wf.type;
                  return (
                    <button
                      key={wf.type}
                      onClick={() => setSelectedWorkflow(wf.type)}
                      className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-all
                        ${isSelected ? `${c.bg} ${c.border}` : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                    >
                      <WfIcon className={`w-4 h-4 mt-0.5 shrink-0 ${isSelected ? c.text : 'text-gray-500'}`} />
                      <div className="min-w-0">
                        <p className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                          {wf.description}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5 truncate">{wf.best_for}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {wf.agents.slice(0, 3).map(a => (
                            <span key={a} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-gray-400">{a}</span>
                          ))}
                          {wf.agents.length > 3 && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-gray-500">+{wf.agents.length - 3}</span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="rounded-2xl bg-[#0c0414]/80 backdrop-blur-xl border border-white/10 shadow-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-gray-300">Configure Request</h3>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-400">Query / Task</label>
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={activeTab === 'auto'
                  ? "e.g. Check if this company's data practices comply with the IT Act..."
                  : "e.g. Run a deep audit on the data protection policy..."}
                rows={4}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:ring-2 focus:ring-blue-500/40 resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-400">Policy A (optional)</label>
                <select value={policyId} onChange={(e) => setPolicyId(e.target.value)}
                  className="w-full bg-[#111827] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500/40">
                  <option value="">— Select policy —</option>
                  {policies.map(p => <option key={p.id} value={p.id}>{p.id}: {p.title.substring(0, 30)}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-400">Policy B (for comparison)</label>
                <select value={policyIdB} onChange={(e) => setPolicyIdB(e.target.value)}
                  className="w-full bg-[#111827] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500/40">
                  <option value="">— Select policy —</option>
                  {policies.map(p => <option key={p.id} value={p.id}>{p.id}: {p.title.substring(0, 30)}</option>)}
                </select>
              </div>
            </div>
            {sessionId && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10">
                <Cpu className="w-4 h-4 text-purple-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400">Active Session</p>
                  <p className="text-xs font-mono text-purple-300 truncate">{sessionId}</p>
                </div>
                <button onClick={() => setSessionId(undefined)} className="text-xs text-gray-500 hover:text-red-400 transition-colors">Clear</button>
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={handleRun} disabled={loading || !query.trim()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                {loading ? 'Executing...' : activeTab === 'auto' ? 'Auto-Route' : 'Run Workflow'}
              </button>
              <button onClick={() => { setResult(null); setError(null); }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-gray-400 border border-white/10 hover:bg-white/5 transition-all">
                <RotateCcw className="w-4 h-4" /> Clear
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">⚠️ {error}</div>
          )}

          {result && (
            <div className="rounded-2xl bg-[#0c0414]/80 backdrop-blur-xl border border-white/10 shadow-xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
                <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Orchestrator Response
                </h3>
                <button onClick={handleCopy}
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5">
                  {copied ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <ReportButton result={result} agentName="Orchestrator" title="Orchestrator Workflow Report" query={query} />
              </div>
              <div className="p-5 overflow-auto max-h-[500px] custom-scrollbar">
                <OrchestratorResultRenderer data={result} />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl bg-[#0c0414]/80 backdrop-blur-xl border border-white/10 shadow-xl p-5">
            <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" /> Architecture
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Task Router (Agent 11)', desc: 'LLM decides routing', icon: Brain, color: 'text-blue-400' },
                { label: 'LangGraph (Agent 12)', desc: 'Multi-step workflows', icon: GitBranch, color: 'text-purple-400' },
                { label: 'Memory Agent (13)', desc: 'Session continuity', icon: Cpu, color: 'text-cyan-400' },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                  <item.icon className={`w-4 h-4 mt-0.5 shrink-0 ${item.color}`} />
                  <div>
                    <p className="text-xs font-medium text-white">{item.label}</p>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {activeTab === 'workflow' && currentWorkflow && (
            <div className={`rounded-2xl ${workflowColor.bg} border ${workflowColor.border} p-5 shadow-xl`}>
              <h3 className={`text-sm font-semibold mb-3 ${workflowColor.text}`}>Active Workflow</h3>
              <p className="text-xs text-gray-300 mb-3">{currentWorkflow.best_for}</p>
              <div className="space-y-2">
                {currentWorkflow.agents.map((agent, i) => (
                  <div key={agent} className="flex items-center gap-2">
                    <div className={`w-5 h-5 rounded-full ${workflowColor.bg} ${workflowColor.border} border flex items-center justify-center shrink-0`}>
                      <span className={`text-[10px] font-bold ${workflowColor.text}`}>{i + 1}</span>
                    </div>
                    <span className="text-xs text-gray-300">{agent.replace(/_/g, ' ')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-2xl bg-[#0c0414]/80 backdrop-blur-xl border border-white/10 p-5">
            <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" /> Tips
            </h3>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>• Sessions remember context across multiple runs</li>
              <li>• Auto-route is best for exploratory queries</li>
              <li>• Use workflows for structured, repeatable tasks</li>
              <li>• Policy B is only used for comparison workflows</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrchestratorResultRenderer({ data }: { data: OrchestratorResult }) {
  const agentsUsed: string[] = (data?.agents_used || data?.agents_executed || []);
  const results = data?.results || data?.agent_results;
  const finalAnswer = data?.final_answer || data?.synthesis;

  return (
    <div className="space-y-4">
      {agentsUsed.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Agents Executed</p>
          <div className="flex flex-wrap gap-2">
            {agentsUsed.map(a => (
              <span key={a} className="text-xs px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400">
                ✓ {a}
              </span>
            ))}
          </div>
        </div>
      )}

      {finalAnswer && (
        <div>
          <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Final Answer</p>
          <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-sm text-gray-200 whitespace-pre-wrap">
            {String(finalAnswer)}
          </div>
        </div>
      )}

      {results && typeof results === 'object' && (
        <div>
          <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Agent Results</p>
          <div className="space-y-2">
            {Object.entries(results as Record<string, unknown>).map(([agent, res]) => (
              <details key={agent} className="rounded-xl bg-white/5 border border-white/5 overflow-hidden">
                <summary className="px-4 py-3 text-sm font-medium text-gray-300 cursor-pointer hover:bg-white/5 flex items-center gap-2">
                  <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                  {agent.replace(/_/g, ' ')}
                </summary>
                <div className="px-4 pb-3">
                  <pre className="text-xs text-gray-400 whitespace-pre-wrap overflow-auto">
                    {typeof res === 'string' ? res : JSON.stringify(res, null, 2)}
                  </pre>
                </div>
              </details>
            ))}
          </div>
        </div>
      )}

      {!agentsUsed.length && !finalAnswer && !results && (
        <pre className="text-xs text-gray-300 whitespace-pre-wrap">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}
