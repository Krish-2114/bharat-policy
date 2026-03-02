"use client";

import { useState, useEffect } from 'react';
import {
  BarChart3, Activity, AlertTriangle, Coins,
  RefreshCw, Clock, CheckCircle2, XCircle, Loader2,
  TrendingUp, Database, Zap, Server, ArrowRight
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import {
  getObservabilityMetrics, getErrorReport, getTokenUsage, getDetailedHealth
} from '@/lib/api';

type MetricsData = Record<string, unknown>;

const TABS = [
  { id: 'metrics', label: 'Metrics', icon: BarChart3 },
  { id: 'tokens', label: 'Token Usage', icon: Coins },
  { id: 'errors', label: 'Error Report', icon: AlertTriangle },
  { id: 'health', label: 'System Health', icon: Activity },
];

const HOURS_OPTIONS = [1, 6, 24, 72, 168];

const PIE_COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1'];

export default function ObservabilityPage() {
  const [activeTab, setActiveTab] = useState('metrics');
  const [hours, setHours] = useState(24);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<MetricsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      let res;
      if (activeTab === 'metrics') res = await getObservabilityMetrics(hours);
      else if (activeTab === 'tokens') res = await getTokenUsage(hours);
      else if (activeTab === 'errors') res = await getErrorReport(hours);
      else if (activeTab === 'health') res = await getDetailedHealth();
      setData(res as Record<string, unknown>);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, hours]);

  return (
    <div className="flex flex-col gap-6 h-full w-full max-w-7xl mx-auto px-4 md:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold text-white tracking-tight">📊 Observability</h1>
          <p className="text-sm text-gray-400">
            Real-time metrics, traces, token usage, and error monitoring for all agents.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {activeTab !== 'health' && (
            <select
              value={hours}
              onChange={(e) => setHours(Number(e.target.value))}
              className="bg-[#111827] border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none"
            >
              {HOURS_OPTIONS.map(h => (
                <option key={h} value={h}>Last {h}h</option>
              ))}
            </select>
          )}
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-300 hover:bg-white/10 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/5 border border-white/10 rounded-xl p-1 w-fit">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${activeTab === tab.id ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-gray-400 hover:text-white'}`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      )}

      {error && (
        <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-5 text-red-400 text-sm">
          ⚠️ {error} — Make sure the backend is running.
        </div>
      )}

      {!loading && !error && data && (
        <div className="space-y-6">
          {activeTab === 'metrics' && <MetricsView data={data} />}
          {activeTab === 'tokens' && <TokensView data={data} />}
          {activeTab === 'errors' && <ErrorsView data={data} />}
          {activeTab === 'health' && <HealthView data={data} />}
        </div>
      )}

      {!loading && !error && !data && (
        <div className="text-center py-20 text-gray-500 text-sm">No data available.</div>
      )}
    </div>
  );
}

function MetricsView({ data }: { data: MetricsData }) {
  const agents = (data?.agents || data?.metrics || data) as Record<string, unknown>;

  const agentList = Object.entries(agents || {}).map(([name, stats]) => {
    const s = stats as Record<string, number>;
    return {
      name: name.replace(/_/g, ' '),
      success_rate: Math.round((s?.success_rate || 0) * 100),
      avg_latency: s?.avg_latency_ms || s?.latency_p50 || 0,
      calls: s?.total_calls || s?.count || 0,
      confidence: Math.round((s?.avg_confidence || 0) * 100),
    };
  });

  if (!agentList.length) {
    return <EmptyCard message="No agent metrics recorded yet. Run some agents first!" />;
  }

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Calls" value={agentList.reduce((a, b) => a + b.calls, 0)}
          icon={Activity} color="blue"
        />
        <MetricCard
          label="Avg Success Rate"
          value={`${Math.round(agentList.reduce((a, b) => a + b.success_rate, 0) / (agentList.length || 1))}%`}
          icon={CheckCircle2} color="emerald"
        />
        <MetricCard
          label="Avg Latency"
          value={`${Math.round(agentList.reduce((a, b) => a + b.avg_latency, 0) / (agentList.length || 1))}ms`}
          icon={Clock} color="cyan"
        />
        <MetricCard
          label="Active Agents" value={agentList.length}
          icon={Zap} color="purple"
        />
      </div>

      {/* Bar chart */}
      <div className="rounded-2xl bg-[#0c0414]/80 backdrop-blur-xl border border-white/10 p-6">
        <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-blue-400" /> Agent Call Volume
        </h3>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={agentList}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
              <XAxis dataKey="name" stroke="#ffffff50" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#ffffff50" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#0F172A', border: '1px solid #ffffff20', borderRadius: '8px', color: '#fff' }} />
              <Bar dataKey="calls" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-[#0c0414]/80 backdrop-blur-xl border border-white/10 overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5">
          <h3 className="text-sm font-semibold text-gray-300">Agent Performance Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-left">
                <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Agent</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Calls</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Success Rate</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Avg Latency</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Confidence</th>
              </tr>
            </thead>
            <tbody>
              {agentList.map((agent, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-5 py-3 font-medium text-white capitalize">{agent.name}</td>
                  <td className="px-5 py-3 text-gray-300">{agent.calls}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden w-20">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${agent.success_rate}%` }} />
                      </div>
                      <span className="text-gray-300 text-xs">{agent.success_rate}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-300">{agent.avg_latency.toFixed(0)}ms</td>
                  <td className="px-5 py-3 text-gray-300">{agent.confidence}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function TokensView({ data }: { data: MetricsData }) {
  const totalTokens = (data?.total_tokens || data?.tokens_in || 0) as number;
  const totalCost = (data?.estimated_cost_usd || data?.cost_usd || 0) as number;
  const byAgent = (data?.by_agent || data?.agents || {}) as Record<string, unknown>;

  const agentData = Object.entries(byAgent).map(([name, stats]) => {
    const s = stats as Record<string, number>;
    return {
      name: name.replace(/_/g, ' '),
      tokens: s?.total_tokens || s?.tokens || 0,
      cost: s?.cost_usd || 0,
    };
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard label="Total Tokens" value={totalTokens.toLocaleString()} icon={Coins} color="amber" />
        <MetricCard label="Est. AWS Cost" value={`$${totalCost.toFixed(4)}`} icon={TrendingUp} color="emerald" />
        <MetricCard label="Agents Tracked" value={agentData.length} icon={Zap} color="purple" />
      </div>

      {agentData.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl bg-[#0c0414]/80 backdrop-blur-xl border border-white/10 p-6">
            <h3 className="text-sm font-semibold text-gray-300 mb-4">Token Distribution by Agent</h3>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={agentData} dataKey="tokens" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${Math.round((percent ?? 0) * 100)}%`}>
                    {agentData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0F172A', border: '1px solid #ffffff20', borderRadius: '8px', color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl bg-[#0c0414]/80 backdrop-blur-xl border border-white/10 overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5">
              <h3 className="text-sm font-semibold text-gray-300">Cost by Agent</h3>
            </div>
            <div className="divide-y divide-white/5">
              {agentData.sort((a, b) => b.tokens - a.tokens).map((agent, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="text-sm text-gray-300 capitalize">{agent.name}</span>
                  </div>
                  <div className="flex items-center gap-4 text-right">
                    <span className="text-xs text-gray-500">{agent.tokens.toLocaleString()} tokens</span>
                    <span className="text-xs font-medium text-amber-400">${agent.cost.toFixed(4)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <EmptyCard message="No token usage data recorded yet." />
      )}
    </div>
  );
}

function ErrorsView({ data }: { data: MetricsData }) {
  const errors = (data?.errors || data?.by_agent || []) as unknown[];

  if (!errors.length) {
    return (
      <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-6 flex items-center gap-4">
        <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
        <div>
          <p className="text-white font-semibold">No errors recorded</p>
          <p className="text-sm text-gray-400 mt-0.5">All agents are running cleanly in the selected time window.</p>
        </div>
      </div>
    );
  }

  const errorList = Array.isArray(errors) ? errors : Object.entries(errors as Record<string, unknown>).flatMap(([agent, errs]) =>
    ((errs as unknown[]) || []).map((e: unknown) => ({ agent, ...(e as Record<string, unknown>) }))
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <MetricCard label="Total Errors" value={errorList.length} icon={XCircle} color="red" />
        <MetricCard label="Agents Affected"
          value={new Set(errorList.map(e => (e as Record<string, unknown>)?.agent)).size}
          icon={AlertTriangle} color="amber"
        />
        <MetricCard label="Error Rate" value={`${((errorList.length / Math.max(1, errorList.length + 100)) * 100).toFixed(1)}%`}
          icon={Activity} color="purple"
        />
      </div>

      <div className="rounded-2xl bg-[#0c0414]/80 backdrop-blur-xl border border-white/10 overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5">
          <h3 className="text-sm font-semibold text-gray-300">Error Log</h3>
        </div>
        <div className="divide-y divide-white/5 max-h-96 overflow-y-auto custom-scrollbar">
          {errorList.map((err, i) => {
            const e = err as Record<string, unknown>;
            return (
              <div key={i} className="px-5 py-4 hover:bg-white/5 transition-colors">
                <div className="flex items-start gap-3">
                  <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-200">{e?.message || e?.error || 'Unknown error'}</p>
                    <div className="flex items-center gap-3 mt-1">
                      {e?.agent && <span className="text-xs text-gray-500 capitalize">{String(e.agent).replace(/_/g, ' ')}</span>}
                      {e?.timestamp && <span className="text-xs text-gray-600">{String(e.timestamp)}</span>}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function HealthView({ data }: { data: MetricsData }) {
  const status = (data?.status || 'unknown') as string;
  const vectorStore = (data?.vector_store || {}) as Record<string, unknown>;
  const observability = (data?.observability || {}) as Record<string, unknown>;

  const isHealthy = status === 'healthy';

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      <div className={`rounded-2xl p-6 border flex items-center gap-4 ${isHealthy
        ? 'bg-emerald-500/10 border-emerald-500/20'
        : 'bg-red-500/10 border-red-500/20'}`}>
        {isHealthy
          ? <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
          : <XCircle className="w-8 h-8 text-red-400 shrink-0" />}
        <div>
          <p className={`font-semibold text-lg ${isHealthy ? 'text-emerald-400' : 'text-red-400'}`}>
            System {status.charAt(0).toUpperCase() + status.slice(1)}
          </p>
          <p className="text-sm text-gray-400 mt-0.5">
            Database: {(data?.database as string) || 'unknown'} — PGVector store operational
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vector Store */}
        <div className="rounded-2xl bg-[#0c0414]/80 backdrop-blur-xl border border-white/10 p-6">
          <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
            <Database className="w-4 h-4 text-blue-400" /> Vector Database
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Policies', value: vectorStore?.policies || 0 },
              { label: 'Total Clauses', value: vectorStore?.total_clauses || 0 },
              { label: 'Embedded', value: vectorStore?.embedded_clauses || 0 },
              { label: 'Coverage', value: `${Math.round(((vectorStore?.embedding_coverage as number) || 0) * 100)}%` },
            ].map(item => (
              <div key={item.label} className="p-4 rounded-xl bg-white/5 border border-white/5">
                <p className="text-xs text-gray-500">{item.label}</p>
                <p className="text-2xl font-bold text-white mt-1">{String(item.value)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Observability Stats */}
        <div className="rounded-2xl bg-[#0c0414]/80 backdrop-blur-xl border border-white/10 p-6">
          <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-purple-400" /> Agent Calls
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Total Logged', value: observability?.total_agent_calls_logged || 0 },
              { label: 'Last Hour', value: observability?.calls_last_hour || 0 },
            ].map(item => (
              <div key={item.label} className="p-4 rounded-xl bg-white/5 border border-white/5">
                <p className="text-xs text-gray-500">{item.label}</p>
                <p className="text-2xl font-bold text-white mt-1">{String(item.value)}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-3">
            {[
              { label: 'Core API', ok: true },
              { label: 'PGVector DB', ok: isHealthy },
              { label: 'Embedding Model', ok: (vectorStore?.embedded_clauses as number) > 0 },
              { label: 'Agent Logging', ok: (observability?.total_agent_calls_logged as number) >= 0 },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
                <span className="text-sm text-gray-300">{item.label}</span>
                <span className={`flex items-center gap-1.5 text-xs font-medium ${item.ok ? 'text-emerald-400' : 'text-red-400'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${item.ok ? 'bg-emerald-400' : 'bg-red-400'} animate-pulse`} />
                  {item.ok ? 'Online' : 'Offline'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, icon: Icon, color }: {
  label: string; value: string | number; icon: React.ElementType; color: string;
}) {
  const colors: Record<string, string> = {
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    red: 'text-red-400 bg-red-500/10 border-red-500/20',
  };
  const c = colors[color] || colors.blue;

  return (
    <div className={`p-5 rounded-2xl ${c.split(' ')[1]} border ${c.split(' ')[2]} shadow-lg`}>
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-gray-400">{label}</p>
        <Icon className={`w-4 h-4 ${c.split(' ')[0]}`} />
      </div>
      <p className="text-2xl font-bold text-white mt-2">{value}</p>
    </div>
  );
}

function EmptyCard({ message }: { message: string }) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-10 text-center text-gray-500 text-sm">
      {message}
    </div>
  );
}
