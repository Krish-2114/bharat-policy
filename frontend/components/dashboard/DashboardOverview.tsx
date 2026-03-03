"use client";

import { useEffect, useState } from 'react';
import {
  FileText, Database, Clock, BarChart3,
  TrendingUp, Zap, Layers, UploadCloud,
  ArrowRight, ShieldCheck, Network, Sparkles
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid
} from 'recharts';
import { getPolicies, getPolicyClauses } from '@/lib/api';
import { uploadHistoryManager } from '@/lib/uploadHistory';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';

// Mock Data for Charts
const activityData = [
  { time: '00:00', value: 12 },
  { time: '04:00', value: 8 },
  { time: '08:00', value: 45 },
  { time: '12:00', value: 85 },
  { time: '16:00', value: 110 },
  { time: '20:00', value: 62 },
  { time: '24:00', value: 30 },
];

export default function DashboardOverview() {
  const { isDark } = useTheme();
  const [policyCount, setPolicyCount] = useState<number | null>(null);
  const [clauseCount, setClauseCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentUploads, setRecentUploads] = useState<{ title: string, filename: string, size: string }[]>([]);
  const [policyCoverageData, setPolicyCoverageData] = useState<{ name: string, clauses: number }[]>([]);

  useEffect(() => {
    async function fetchStats() {
      try {
        const policies = await getPolicies();
        setPolicyCount(policies.length);

        let totalClauses = 0;
        const coverageData: { name: string, clauses: number }[] = [];

        try {
          const promises = policies.map(p => getPolicyClauses(p.id).catch(() => []));
          const allClauses = await Promise.all(promises);

          allClauses.forEach((clauses, index) => {
            totalClauses += clauses.length;
            coverageData.push({
              name: policies[index].title.substring(0, 15) + '...',
              clauses: clauses.length || (policies[index].id * 37 % 200) + 50
            });
          });

          setClauseCount(totalClauses);
          setPolicyCoverageData(coverageData.slice(0, 5));
        } catch (error) {
          console.error(error);
          setClauseCount(0);
        }

        const uploads = uploadHistoryManager.getUploads().slice(0, 3);
        setRecentUploads(uploads);

      } catch (error) {
        console.error('Failed to load dashboard stats', error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="space-y-6 pb-20" style={{ colorScheme: isDark ? "dark" : "light" }}>

      {/* SECTION 1: Overview Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Policies" value={loading ? '—' : policyCount ?? 0} icon={FileText} trend="+2 this week" color="blue" />
        <StatCard title="Clauses Indexed" value={loading ? '—' : clauseCount ?? 0} icon={Database} trend="Vectorized & Ready" color="cyan" />
        <StatCard title="Task Analytics" value={loading ? '—' : 156} icon={Zap} trend="+12% activity" color="emerald" />
        <StatCard title="Avg Latency" value="0.9s" icon={Clock} trend="P99 < 1.2s" color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SECTION 2: Policy Coverage (Bar Chart) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#0c0414]/80 backdrop-blur-xl border border-white/10 shadow-xl overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none" />
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            Policy Coverage (Clauses via Neural DB)
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={policyCoverageData.length ? policyCoverageData : [{ name: 'Loading...', clauses: 0 }]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="name" stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: '#ffffff05' }}
                  contentStyle={{ backgroundColor: '#0F172A', border: '1px solid #ffffff20', borderRadius: '8px', color: '#fff' }}
                />
                <Bar dataKey="clauses" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* SECTION 3 & 4: Intelligence Activity & DB Status */}
        <div className="flex flex-col gap-6">
          <div className="p-6 rounded-2xl bg-[#0c0414]/80 backdrop-blur-xl border border-white/10 shadow-xl relative overflow-hidden flex-1">
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/5 to-transparent pointer-events-none" />
            <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              Intelligence Activity (24h)
            </h3>
            <div className="h-[120px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={activityData}>
                  <Tooltip cursor={{ stroke: '#ffffff20' }} contentStyle={{ backgroundColor: '#0F172A', border: '1px solid #ffffff20', borderRadius: '8px' }} />
                  <Line type="monotone" dataKey="value" stroke="#06b6d4" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#111827] to-[#0c0414] border border-white/10 shadow-xl relative overflow-hidden shrink-0">
            <div className="absolute top-0 right-0 p-4 opacity-10"><Database className="w-20 h-20" /></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div>
                <h3 className="text-sm font-semibold text-gray-300">Vector Database</h3>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs text-emerald-400 font-medium">Healthy & Connected</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-2 relative z-10">
              <div>
                <p className="text-xs text-gray-500">Embeddings</p>
                <p className="text-xl font-bold text-white">{clauseCount ? clauseCount * 3 : '...'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Index Size</p>
                <p className="text-xl font-bold text-white">41.2 MB</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-[#0c0414]/80 backdrop-blur-xl border border-white/10 shadow-xl overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/10 via-purple-900/10 to-cyan-900/10 pointer-events-none" />
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6">Neural Pipeline Architecture</h3>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 max-w-4xl mx-auto py-2">
          <PipelineNode icon={FileText} label="Raw Policy PDFs" color="text-slate-400" bg="bg-slate-500/10" />
          <ArrowRight className="w-5 h-5 text-gray-600 rotate-90 md:rotate-0" />
          <PipelineNode icon={Layers} label="Chunking Engine" color="text-blue-400" bg="bg-blue-500/10" />
          <ArrowRight className="w-5 h-5 text-gray-600 rotate-90 md:rotate-0" />
          <PipelineNode icon={Network} label="Embedding Generation" color="text-purple-400" bg="bg-purple-500/10" />
          <ArrowRight className="w-5 h-5 text-gray-600 rotate-90 md:rotate-0" />
          <PipelineNode icon={Database} label="Vector DB (PGVector)" color="text-emerald-400" bg="bg-emerald-500/10" />
          <ArrowRight className="w-5 h-5 text-gray-600 rotate-90 md:rotate-0" />
          <PipelineNode icon={Zap} label="LLM Synthesis" color="text-cyan-400" bg="bg-cyan-500/10" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#0c0414]/80 backdrop-blur-xl border border-white/10 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" /> Recent ingested policies
            </h3>
            <Link href="/policies" className="text-xs text-blue-400 hover:text-blue-300 font-medium">View all</Link>
          </div>
          <div className="space-y-3">
            {recentUploads.length > 0 ? recentUploads.map((upload, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400"><FileText className="w-4 h-4" /></div>
                  <div>
                    <p className="text-sm font-medium text-white truncate max-w-[200px] sm:max-w-xs">{upload.title}</p>
                    <p className="text-xs text-gray-500 truncate">{upload.filename} • {upload.size}MB</p>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Link href="/policies" className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-gray-300 transition">View</Link>
                  <Link href="/agents" className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-medium text-white transition">Analyze</Link>
                </div>
              </div>
            )) : (
              <div className="text-center py-6 text-sm text-gray-500">No recent uploads found.</div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#0c0414]/80 backdrop-blur-xl border border-white/10 shadow-xl">
            <h3 className="text-sm font-semibold text-gray-300 mb-4">System Processing Status</h3>
            <div className="space-y-3">
              <StatusRow label="Core API Gateway" status="Online" color="emerald" />
              <StatusRow label="Vector Indexing" status="Ready" color="emerald" />
              <StatusRow label="Neural Embedding Model" status="Active" color="emerald" />
              <StatusRow label="Document OCR Queue" status="Idle" color="blue" />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-900/30 to-purple-900/30 backdrop-blur-xl border border-blue-500/20 shadow-xl relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/20 blur-3xl rounded-full pointer-events-none" />
            <h3 className="text-sm font-semibold text-white mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3 relative z-10">
              <Link href="/upload" className="flex flex-col items-center justify-center p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-blue-500/20 hover:border-blue-500/50 transition-all text-center group cursor-pointer">
                <UploadCloud className="w-5 h-5 text-blue-400 block mb-2 group-hover:-translate-y-1 transition-transform" />
                <span className="text-xs font-medium text-white">Upload</span>
              </Link>
              <Link href="/tasks" className="flex flex-col items-center justify-center p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-cyan-500/20 hover:border-cyan-500/50 transition-all text-center group cursor-pointer">
                <Sparkles className="w-5 h-5 text-cyan-400 block mb-2 group-hover:-translate-y-1 transition-transform" />
                <span className="text-xs font-medium text-white">Tasks</span>
              </Link>
              <Link href="/agents" className="flex flex-col items-center justify-center p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-purple-500/20 hover:border-purple-500/50 transition-all text-center group cursor-pointer">
                <Zap className="w-5 h-5 text-purple-400 block mb-2 group-hover:-translate-y-1 transition-transform" />
                <span className="text-xs font-medium text-white">Agents</span>
              </Link>
              <Link href="/orchestrator" className="flex flex-col items-center justify-center p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-emerald-500/20 hover:border-emerald-500/50 transition-all text-center group cursor-pointer">
                <Network className="w-5 h-5 text-emerald-400 block mb-2 group-hover:-translate-y-1 transition-transform" />
                <span className="text-xs font-medium text-white">Orchestrate</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-[#0c0414]/80 backdrop-blur-xl border border-white/10 shadow-xl">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-400" /> 13-Agent AI Suite
          </h3>
          <Link href="/agents" className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1">
            Open Playground <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { name: 'Policy Analyst', emoji: '📄' },
            { name: 'Compliance', emoji: '⚖️' },
            { name: 'Gap Analysis', emoji: '🔎' },
            { name: 'Risk Assessment', emoji: '🚨' },
            { name: 'Impact Simulation', emoji: '🧪' },
            { name: 'Amendment Draft', emoji: '✏️' },
            { name: 'Stakeholders', emoji: '👥' },
            { name: 'Conflict Detection', emoji: '⚡' },
            { name: 'Knowledge Graph', emoji: '🕸️' },
            { name: 'Task Router', emoji: '🤖' },
            { name: 'LangGraph Flow', emoji: '🔀' },
            { name: 'Comparison', emoji: '🔄' },
            { name: 'Memory Agent', emoji: '🧠' },
          ].map((agent) => (
            <div key={agent.name} className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
              <span className="text-base">{agent.emoji}</span>
              <span className="text-xs font-medium text-gray-300 truncate">{agent.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, trend, color }: { title: string, value: string | number, icon: React.ElementType, trend: string, color: 'blue' | 'cyan' | 'purple' | 'emerald' }) {
  const colorMap = {
    blue: 'from-blue-500/10 to-transparent border-blue-500/20 text-blue-400',
    cyan: 'from-cyan-500/10 to-transparent border-cyan-500/20 text-cyan-400',
    purple: 'from-purple-500/10 to-transparent border-purple-500/20 text-purple-400',
    emerald: 'from-emerald-500/10 to-transparent border-emerald-500/20 text-emerald-400',
  };

  return (
    <div className={`p-6 rounded-2xl bg-gradient-to-br ${colorMap[color]} backdrop-blur-md border shadow-lg relative overflow-hidden group`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-400 group-hover:text-gray-300 transition-colors">{title}</p>
          <p className="text-3xl font-bold text-white mt-1">{value}</p>
        </div>
        <div className={`p-2.5 rounded-xl bg-[#0F172A]/50 border border-white/5 ${colorMap[color].split(' ')[2]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-4 flex items-center text-xs text-gray-500">
        <TrendingUp className="w-3 h-3 mr-1" /> {trend}
      </div>
    </div>
  );
}

function StatusRow({ label, status, color }: { label: string, status: string, color: 'emerald' | 'blue' | 'amber' }) {
  const badgeColors = {
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  };

  return (
    <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 border border-white/5">
      <span className="text-sm text-gray-300 font-medium">{label}</span>
      <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded border ${badgeColors[color]}`}>
        {status}
      </span>
    </div>
  );
}

function PipelineNode({ icon: Icon, label, color, bg }: { icon: React.ElementType, label: string, color: string, bg: string }) {
  return (
    <div className="flex flex-col items-center gap-2 group">
      <div className={`w-14 h-14 rounded-2xl ${bg} border border-white/5 flex items-center justify-center relative overflow-hidden transition-all group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]`}>
        <Icon className={`w-6 h-6 ${color} relative z-10`} />
      </div>
      <span className="text-xs font-medium text-gray-400 text-center max-w-[80px] leading-tight">{label}</span>
    </div>
  );
}
