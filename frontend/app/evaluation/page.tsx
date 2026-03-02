"use client";

import { useState, useEffect } from 'react';
import {
  FlaskConical, Play, History, FileText, Tag,
  CheckCircle2, XCircle, Clock, BarChart3, Loader2,
  RefreshCw, ChevronDown, Zap, Target, Award
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import {
  runEvaluation, getEvalHistory, listEvalScenarios, getPolicies
} from '@/lib/api';
import { Policy } from '@/types/policy';

interface Scenario {
  name: string;
  agent: string;
  tags: string[];
  input: Record<string, unknown>;
}

interface EvalRun {
  run_id: string;
  timestamp?: string;
  policy_id?: number;
  total: number;
  passed: number;
  failed: number;
  pass_rate?: number;
  avg_confidence?: number;
  avg_latency_ms?: number;
}

interface ScenarioResult {
  name?: string;
  passed?: boolean;
  result?: string;
  reason?: string;
  confidence?: number;
  latency_ms?: number;
}


export default function EvaluationPage() {
  const [activeTab, setActiveTab] = useState<'run' | 'history' | 'scenarios'>('run');
  const [policyId, setPolicyId] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [scenariosLoading, setScenariosLoading] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | string | null>(null);
  const [history, setHistory] = useState<EvalRun[]>([]);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPolicies().then(setPolicies).catch(() => {});

    setHistoryLoading(true);
    getEvalHistory().then(d => {
      const h = (d as { history?: EvalRun[]; runs?: EvalRun[] })?.history ||
                (d as { history?: EvalRun[]; runs?: EvalRun[] })?.runs || [];
      setHistory(h);
    }).catch(() => {}).finally(() => setHistoryLoading(false));

    setScenariosLoading(true);
    listEvalScenarios().then(d => {
      const s = (d as { scenarios?: Scenario[] })?.scenarios || [];
      setScenarios(s);
      const tags = Array.from(new Set(s.flatMap((sc: Scenario) => sc.tags || [])));
      setAllTags(tags);
    }).catch(() => {}).finally(() => setScenariosLoading(false));
  }, []);

  const handleRun = async () => {
    if (!policyId) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await runEvaluation({
        policy_id: parseInt(policyId),
        tags: selectedTags.length > 0 ? selectedTags : null,
      });
      setResult(res as Record<string, unknown> | string);

      // Refresh history
      const h = await getEvalHistory();
      setHistory((h as { history?: EvalRun[] })?.history || []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Evaluation failed');
    } finally {
      setLoading(false);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="flex flex-col gap-6 h-full w-full max-w-7xl mx-auto px-4 md:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-white tracking-tight">🧪 Evaluation & Benchmarking</h1>
        <p className="text-sm text-gray-400">
          Run automated benchmarks to measure agent accuracy, confidence, retrieval precision, and latency.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/5 border border-white/10 rounded-xl p-1 w-fit">
        {[
          { id: 'run', label: 'Run Benchmark', icon: Play },
          { id: 'history', label: 'History', icon: History },
          { id: 'scenarios', label: 'Scenarios', icon: FileText },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'run' | 'history' | 'scenarios')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${activeTab === tab.id ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-gray-400 hover:text-white'}`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* RUN TAB */}
      {activeTab === 'run' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-2xl bg-[#0c0414]/80 backdrop-blur-xl border border-white/10 shadow-xl p-6 space-y-4">
              <h3 className="text-sm font-semibold text-gray-300">Configure Evaluation</h3>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-400">Select Policy to Evaluate</label>
                <select
                  value={policyId}
                  onChange={(e) => setPolicyId(e.target.value)}
                  className="w-full bg-[#111827] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500/40"
                >
                  <option value="">— Select a policy —</option>
                  {policies.map(p => (
                    <option key={p.id} value={p.id}>{p.id}: {p.title}</option>
                  ))}
                </select>
              </div>

              {allTags.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-400">Filter by Tags (optional)</label>
                  <div className="flex flex-wrap gap-2">
                    {allTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all
                          ${selectedTags.includes(tag)
                            ? 'bg-blue-500/20 border-blue-500/30 text-blue-400'
                            : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                          }`}
                      >
                        <Tag className="w-3 h-3" /> {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 flex gap-3">
                <button
                  onClick={handleRun}
                  disabled={loading || !policyId}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  {loading ? 'Running Suite...' : 'Run Evaluation Suite'}
                </button>
                <button
                  onClick={() => { setResult(null); setError(null); setSelectedTags([]); }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-gray-400 border border-white/10 hover:bg-white/5 transition-all"
                >
                  <RefreshCw className="w-4 h-4" /> Reset
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
                ⚠️ {error}
              </div>
            )}

            {result && typeof result !== "string" && <EvalResultDisplay result={result as Record<string, unknown>} />}
          </div>

          {/* Info Panel */}
          <div className="space-y-4">
            <div className="rounded-2xl bg-[#0c0414]/80 backdrop-blur-xl border border-white/10 p-5">
              <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-400" /> What's Measured
              </h3>
              <div className="space-y-3">
                {[
                  { label: 'Accuracy', desc: 'Expected vs actual answer match', color: 'text-blue-400' },
                  { label: 'Confidence', desc: 'Agent self-reported confidence score', color: 'text-emerald-400' },
                  { label: 'Retrieval Precision', desc: 'Correct clauses fetched from RAG', color: 'text-cyan-400' },
                  { label: 'Latency', desc: 'Time to complete each agent call', color: 'text-purple-400' },
                  { label: 'Pass Rate', desc: 'Scenarios passing all criteria', color: 'text-amber-400' },
                ].map(item => (
                  <div key={item.label} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                    <Zap className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${item.color}`} />
                    <div>
                      <p className="text-xs font-semibold text-white">{item.label}</p>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/20 p-5">
              <p className="text-xs font-semibold text-gray-300 mb-2">📋 Predefined Scenarios</p>
              <p className="text-2xl font-bold text-white">{scenarios.length}</p>
              <p className="text-xs text-gray-500 mt-1">covering {allTags.length} categories</p>
            </div>
          </div>
        </div>
      )}

      {/* HISTORY TAB */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          {historyLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : history.length === 0 ? (
            <div className="rounded-2xl bg-white/5 border border-white/10 p-10 text-center text-gray-500 text-sm">
              No evaluation runs found. Run your first benchmark above!
            </div>
          ) : (
            <>
              {/* Chart */}
              <div className="rounded-2xl bg-[#0c0414]/80 backdrop-blur-xl border border-white/10 p-6">
                <h3 className="text-sm font-semibold text-gray-300 mb-4">Pass Rate Over Time</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={history.slice().reverse().map(h => ({
                      id: h.run_id?.substring(0, 8) || 'run',
                      pass_rate: Math.round((h.pass_rate || (h.passed / Math.max(1, h.total))) * 100),
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                      <XAxis dataKey="id" stroke="#ffffff50" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#ffffff50" fontSize={10} tickLine={false} axisLine={false} unit="%" />
                      <Tooltip contentStyle={{ backgroundColor: '#0F172A', border: '1px solid #ffffff20', borderRadius: '8px', color: '#fff' }} />
                      <Bar dataKey="pass_rate" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* History List */}
              <div className="rounded-2xl bg-[#0c0414]/80 backdrop-blur-xl border border-white/10 overflow-hidden">
                <div className="px-5 py-4 border-b border-white/5">
                  <h3 className="text-sm font-semibold text-gray-300">Evaluation Runs</h3>
                </div>
                <div className="divide-y divide-white/5">
                  {history.map((run, i) => {
                    const passRate = Math.round((run.pass_rate || run.passed / Math.max(1, run.total)) * 100);
                    return (
                      <div key={i} className="px-5 py-4 hover:bg-white/5 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${passRate >= 70 ? 'bg-emerald-500/10' : 'bg-amber-500/10'}`}>
                              {passRate >= 70
                                ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                : <XCircle className="w-4 h-4 text-amber-400" />}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white font-mono">{run.run_id?.substring(0, 16) || `Run #${i + 1}`}</p>
                              <p className="text-xs text-gray-500 mt-0.5">
                                Policy {run.policy_id} • {run.total} scenarios
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6 text-right">
                            <div>
                              <p className="text-xs text-gray-500">Pass Rate</p>
                              <p className={`text-sm font-bold ${passRate >= 70 ? 'text-emerald-400' : 'text-amber-400'}`}>{passRate}%</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Passed</p>
                              <p className="text-sm font-medium text-white">{run.passed}/{run.total}</p>
                            </div>
                            {run.avg_latency_ms && (
                              <div>
                                <p className="text-xs text-gray-500">Latency</p>
                                <p className="text-sm text-gray-300">{run.avg_latency_ms.toFixed(0)}ms</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* SCENARIOS TAB */}
      {activeTab === 'scenarios' && (
        <div className="space-y-4">
          {scenariosLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : scenarios.length === 0 ? (
            <div className="rounded-2xl bg-white/5 border border-white/10 p-10 text-center text-gray-500 text-sm">
              No scenarios found.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-2xl bg-blue-500/10 border border-blue-500/20 p-5">
                  <p className="text-xs text-gray-400">Total Scenarios</p>
                  <p className="text-2xl font-bold text-white mt-1">{scenarios.length}</p>
                </div>
                <div className="rounded-2xl bg-purple-500/10 border border-purple-500/20 p-5">
                  <p className="text-xs text-gray-400">Unique Agents</p>
                  <p className="text-2xl font-bold text-white mt-1">{new Set(scenarios.map(s => s.agent)).size}</p>
                </div>
                <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-5">
                  <p className="text-xs text-gray-400">Categories</p>
                  <p className="text-2xl font-bold text-white mt-1">{allTags.length}</p>
                </div>
              </div>

              <div className="rounded-2xl bg-[#0c0414]/80 backdrop-blur-xl border border-white/10 overflow-hidden">
                <div className="px-5 py-4 border-b border-white/5">
                  <h3 className="text-sm font-semibold text-gray-300">Test Scenarios ({scenarios.length})</h3>
                </div>
                <div className="divide-y divide-white/5 max-h-[60vh] overflow-y-auto custom-scrollbar">
                  {scenarios.map((scenario, i) => (
                    <details key={i} className="group">
                      <summary className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-white/5 transition-colors">
                        <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-blue-400">{i + 1}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{scenario.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">Agent: {scenario.agent.replace(/_/g, ' ')}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {scenario.tags?.map(tag => (
                            <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gray-400">{tag}</span>
                          ))}
                          <ChevronDown className="w-4 h-4 text-gray-500 group-open:rotate-180 transition-transform shrink-0" />
                        </div>
                      </summary>
                      <div className="px-5 pb-4 bg-white/5 border-t border-white/5">
                        <p className="text-xs font-semibold text-gray-400 mb-2 mt-3">Input Parameters</p>
                        <pre className="text-xs text-gray-300 bg-black/20 rounded-xl p-3 overflow-auto">
                          {JSON.stringify(scenario.input, null, 2)}
                        </pre>
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function EvalResultDisplay({ result }: { result: Record<string, unknown> | null }) {
  const r = result as Record<string, unknown>;
  const summary = (r?.summary || {}) as Record<string, unknown>;
  const passed = (r?.passed || summary?.passed || 0) as number;
  const failed = (r?.failed || summary?.failed || 0) as number;
  const total = (r?.total || summary?.total || passed + failed) as number;
  const passRate = Math.round(((r?.pass_rate as number) || (passed / Math.max(1, total))) * 100);
  const scenarios = (r?.scenarios || r?.results || []) as ScenarioResult[];

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
          <p className="text-xs text-gray-400">Pass Rate</p>
          <p className="text-2xl font-bold text-emerald-400">{passRate}%</p>
        </div>
        <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
          <p className="text-xs text-gray-400">Passed</p>
          <p className="text-2xl font-bold text-white">{passed}</p>
        </div>
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
          <p className="text-xs text-gray-400">Failed</p>
          <p className="text-2xl font-bold text-white">{failed}</p>
        </div>
        <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20">
          <p className="text-xs text-gray-400">Total</p>
          <p className="text-2xl font-bold text-white">{total}</p>
        </div>
      </div>

      {/* Scenario Results */}
      {scenarios.length > 0 && (
        <div className="rounded-2xl bg-[#0c0414]/80 backdrop-blur-xl border border-white/10 overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-gray-300">Scenario Results</h3>
          </div>
          <div className="divide-y divide-white/5 max-h-80 overflow-y-auto custom-scrollbar">
            {scenarios.map((sc, i) => {
              const scenPassed = sc?.passed || sc?.result === 'pass';
              return (
                <div key={i} className="flex items-center gap-3 px-5 py-3 hover:bg-white/5 transition-colors">
                  {scenPassed
                    ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    : <XCircle className="w-4 h-4 text-red-400 shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-200 truncate">{String(sc?.name ?? `Scenario ${i + 1}`)}</p>
                    {sc?.reason && <p className="text-xs text-gray-500 mt-0.5">{String(sc.reason)}</p>}
                  </div>
                  {sc?.confidence !== undefined && (
                    <span className="text-xs text-gray-400 shrink-0">{Math.round((sc.confidence as number) * 100)}% conf</span>
                  )}
                  {sc?.latency_ms !== undefined && (
                    <span className="text-xs text-gray-500 shrink-0 flex items-center gap-1">
                      <Clock className="w-3 h-3" />{(sc.latency_ms as number).toFixed(0)}ms
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
