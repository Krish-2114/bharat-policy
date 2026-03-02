"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  FileSearch, Scale, ArrowLeftRight, Search, AlertTriangle,
  FlaskConical, PenLine, Users, Zap, Network, Loader2,
  ChevronRight, Play, RotateCcw, Copy, CheckCheck, UploadCloud
} from 'lucide-react';
import { runAgent, getPolicies, uploadPolicy } from '@/lib/api';
import { toast } from '@/lib/toast';
import { useTheme } from '@/context/ThemeContext';
import { ReportButton } from '@/components/reports/ReportGenerator';
import { Policy } from '@/types/policy';

interface AgentField {
  key: string;
  label: string;
  type: 'textarea' | 'policy_select' | 'text';
  placeholder?: string;
  required?: boolean;
}

interface Agent {
  id: string;
  name: string;
  emoji: string;
  icon: React.ElementType;
  color: string;
  description: string;
  fields: AgentField[];
}

const AGENTS: Agent[] = [
  {
    id: 'analyze',
    name: 'Policy Analyst',
    emoji: '📄',
    icon: FileSearch,
    color: 'blue',
    description: 'Summarize policy, extract obligations, deadlines, penalties, stakeholders.',
    fields: [
      { key: 'query', label: 'Query', type: 'textarea', placeholder: 'Summarize this policy...', required: true },
      { key: 'policy_id', label: 'Policy ID (optional)', type: 'policy_select' },
    ],
  },
  {
    id: 'compliance',
    name: 'Compliance Evaluation',
    emoji: '⚖️',
    icon: Scale,
    color: 'amber',
    description: 'Evaluate if a scenario violates policy. Returns verdict + risk level.',
    fields: [
      { key: 'scenario', label: 'Scenario', type: 'textarea', placeholder: 'A company collects user data without consent...', required: true },
      { key: 'policy_id', label: 'Policy ID (optional)', type: 'policy_select' },
    ],
  },
  {
    id: 'compare',
    name: 'Policy Comparison',
    emoji: '🔄',
    icon: ArrowLeftRight,
    color: 'cyan',
    description: 'Compare two policies side by side.',
    fields: [
      { key: 'policy_id_a', label: 'Policy A ID', type: 'policy_select', required: true },
      { key: 'policy_id_b', label: 'Policy B ID', type: 'policy_select', required: true },
    ],
  },
  {
    id: 'gap-analysis',
    name: 'Gap Analysis',
    emoji: '🔎',
    icon: Search,
    color: 'purple',
    description: 'Find missing compliance areas, undefined responsibilities, weak enforcement.',
    fields: [
      { key: 'focus', label: 'Focus Area', type: 'textarea', placeholder: 'Full analysis or specific section...', required: true },
      { key: 'policy_id', label: 'Policy ID (optional)', type: 'policy_select' },
    ],
  },
  {
    id: 'risk',
    name: 'Risk Assessment',
    emoji: '🚨',
    icon: AlertTriangle,
    color: 'red',
    description: 'Score ambiguity, enforcement weakness, financial exposure, operational risk.',
    fields: [
      { key: 'focus', label: 'Focus / Context', type: 'textarea', placeholder: 'Assess risks in data privacy clause...', required: true },
      { key: 'policy_id', label: 'Policy ID (optional)', type: 'policy_select' },
    ],
  },
  {
    id: 'simulate',
    name: 'Impact Simulation',
    emoji: '🧪',
    icon: FlaskConical,
    color: 'emerald',
    description: 'Simulate what happens if a policy change is made.',
    fields: [
      { key: 'proposed_change', label: 'Proposed Change', type: 'textarea', placeholder: 'If we remove Section 4.2 on data retention...', required: true },
      { key: 'policy_id', label: 'Policy ID (optional)', type: 'policy_select' },
    ],
  },
  {
    id: 'amend',
    name: 'Amendment Drafting',
    emoji: '✏️',
    icon: PenLine,
    color: 'violet',
    description: 'Suggest improved clause wording and stronger compliance language.',
    fields: [
      { key: 'focus', label: 'Focus Area', type: 'textarea', placeholder: 'Improve the enforcement section...', required: true },
      { key: 'policy_id', label: 'Policy ID (optional)', type: 'policy_select' },
    ],
  },
  {
    id: 'stakeholders',
    name: 'Stakeholder Impact',
    emoji: '👥',
    icon: Users,
    color: 'orange',
    description: 'Analyze impact on employees, government, vendors, and citizens.',
    fields: [
      { key: 'focus', label: 'Context', type: 'textarea', placeholder: 'Analyze stakeholder impact on new telecom policy...', required: true },
      { key: 'policy_id', label: 'Policy ID (optional)', type: 'policy_select' },
    ],
  },
  {
    id: 'conflicts',
    name: 'Conflict Detection',
    emoji: '⚡',
    icon: Zap,
    color: 'yellow',
    description: 'Detect contradictions and logical inconsistencies between clauses.',
    fields: [
      { key: 'policy_id', label: 'Policy ID (optional)', type: 'policy_select' },
    ],
  },
  {
    id: 'knowledge-graph',
    name: 'Knowledge Graph',
    emoji: '🕸️',
    icon: Network,
    color: 'teal',
    description: 'Build dependency graph and cross-reference map of all clauses.',
    fields: [
      { key: 'policy_id', label: 'Policy ID (optional)', type: 'policy_select' },
    ],
  },
];

const colorMap: Record<string, string> = {
  blue: 'from-blue-500/10 border-blue-500/20 text-blue-400 bg-blue-500/10',
  amber: 'from-amber-500/10 border-amber-500/20 text-amber-400 bg-amber-500/10',
  cyan: 'from-cyan-500/10 border-cyan-500/20 text-cyan-400 bg-cyan-500/10',
  purple: 'from-purple-500/10 border-purple-500/20 text-purple-400 bg-purple-500/10',
  red: 'from-red-500/10 border-red-500/20 text-red-400 bg-red-500/10',
  emerald: 'from-emerald-500/10 border-emerald-500/20 text-emerald-400 bg-emerald-500/10',
  violet: 'from-violet-500/10 border-violet-500/20 text-violet-400 bg-violet-500/10',
  orange: 'from-orange-500/10 border-orange-500/20 text-orange-400 bg-orange-500/10',
  yellow: 'from-yellow-500/10 border-yellow-500/20 text-yellow-400 bg-yellow-500/10',
  teal: 'from-teal-500/10 border-teal-500/20 text-teal-400 bg-teal-500/10',
};

export default function AgentsPage() {
  const { isDark } = useTheme();
  const [selectedAgent, setSelectedAgent] = useState(AGENTS[0]);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadKey, setUploadKey] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const firstPolicyFieldKey = selectedAgent.fields.find((f) => f.type === 'policy_select')?.key;
  const hasPolicyField = !!firstPolicyFieldKey;
  const UPLOAD_FROM_DEVICE_VALUE = '__upload_from_device__';

  const handleSelectFileClick = () => {
    fileInputRef.current?.click();
  };
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setUploadFile(f);
      setUploadTitle((t) => t || f.name.replace(/\.[^.]+$/, '').replace(/_/g, ' '));
    }
    e.target.value = '';
  };

  useEffect(() => {
    getPolicies().then(setPolicies).catch(() => {});
  }, []);

  const refreshPolicies = () => getPolicies().then(setPolicies).catch(() => {});

  const handleUploadDocument = async () => {
    if (!uploadFile || !uploadTitle.trim()) {
      toast.error('Please enter a title for the policy.');
      return;
    }
    setUploadLoading(true);
    try {
      const res = await uploadPolicy(uploadFile, uploadTitle.trim()) as { message: string; policy_id?: number };
      toast.success(res.message || 'Uploaded successfully.');
      await refreshPolicies();
      if (res.policy_id != null && firstPolicyFieldKey) {
        setFormValues((prev) => ({ ...prev, [firstPolicyFieldKey]: String(res.policy_id) }));
      }
      setUploadFile(null);
      setUploadTitle('');
      setUploadKey((k) => k + 1);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Upload failed.');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleAgentSelect = (agent: typeof AGENTS[0]) => {
    setSelectedAgent(agent);
    setFormValues({});
    setResult(null);
    setError(null);
  };

  const handleRun = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    // Build payload
    const payload: Record<string, unknown> = {};
    selectedAgent.fields.forEach(f => {
      const val = formValues[f.key];
      if (val !== undefined && val !== '') {
        if (f.key === 'policy_id' || f.key === 'policy_id_a' || f.key === 'policy_id_b') {
          payload[f.key] = parseInt(val);
        } else {
          payload[f.key] = val;
        }
      }
    });

    try {
      const res = await runAgent(selectedAgent.id, payload);
      setResult(res as Record<string, unknown> | string);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Agent failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const colors = colorMap[selectedAgent.color];
  const colorParts = colors.split(' ');
  const textColor = colorParts[2];
  const bgColor = colorParts[3];

  return (
    <div className="flex flex-col gap-6 h-full w-full max-w-7xl mx-auto px-4 md:px-8 py-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-white tracking-tight">🤖 Agent Playground</h1>
        <p className="text-sm text-gray-400">Run individual AI agents directly against your policy documents.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        {/* Agent List */}
        <div className="lg:w-72 shrink-0">
          <div className="rounded-2xl bg-[#0c0414]/80 backdrop-blur-xl border border-white/10 shadow-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-white/5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">10 Specialized Agents</p>
            </div>
            <div className="overflow-y-auto max-h-[70vh] custom-scrollbar">
              {AGENTS.map((agent) => {
                const isActive = selectedAgent.id === agent.id;
                const c = colorMap[agent.color].split(' ');
                return (
                  <button
                    key={agent.id}
                    onClick={() => handleAgentSelect(agent)}
                    className={`w-full flex items-center gap-3 px-4 py-3 transition-all border-b border-white/5 text-left group
                      ${isActive ? 'bg-white/5' : 'hover:bg-white/5'}`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isActive ? c[3] : 'bg-white/5'}`}>
                      <agent.icon className={`w-4 h-4 ${isActive ? c[2] : 'text-gray-500'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>
                        {agent.emoji} {agent.name}
                      </p>
                    </div>
                    {isActive && <ChevronRight className="w-4 h-4 text-gray-500 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Agent Runner */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          {/* Agent Header */}
          <div className={`rounded-2xl bg-gradient-to-br ${colorParts[0]} border ${colorParts[1]} p-5 shadow-xl`}>
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center shrink-0`}>
                <selectedAgent.icon className={`w-6 h-6 ${textColor}`} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">{selectedAgent.emoji} {selectedAgent.name}</h2>
                <p className="text-sm text-gray-400 mt-0.5">{selectedAgent.description}</p>
              </div>
            </div>
          </div>

          {/* Input Form */}
          <div className="rounded-2xl bg-[#0c0414]/80 backdrop-blur-xl border border-white/10 shadow-xl p-5 space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt"
              className="hidden"
              onChange={handleFileInputChange}
            />
            <h3 className="text-sm font-semibold text-gray-300">Input Parameters</h3>
            {selectedAgent.fields.map((field) => (
              <div key={field.key} className="space-y-1.5">
                <label className="text-xs font-medium text-gray-400">{field.label}</label>
                {field.type === 'textarea' ? (
                  <textarea
                    value={formValues[field.key] || ''}
                    onChange={(e) => setFormValues(prev => ({ ...prev, [field.key]: e.target.value }))}
                    placeholder={field.placeholder || ''}
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all resize-none"
                  />
                ) : field.type === 'policy_select' ? (
                  <select
                    value={formValues[field.key] === UPLOAD_FROM_DEVICE_VALUE ? '' : (formValues[field.key] || '')}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === UPLOAD_FROM_DEVICE_VALUE) {
                        handleSelectFileClick();
                        setFormValues(prev => ({ ...prev, [field.key]: '' }));
                      } else {
                        setFormValues(prev => ({ ...prev, [field.key]: v }));
                      }
                    }}
                    className="w-full bg-[#111827] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                  >
                    <option value="">— Select a policy (optional) —</option>
                    <option value={UPLOAD_FROM_DEVICE_VALUE}>Select from device</option>
                    {policies.map(p => (
                      <option key={p.id} value={p.id}>{p.id}: {p.title}</option>
                    ))}
                  </select>
                ) : null}
              </div>
            ))}

            {uploadFile && (
              <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <span className="text-sm text-gray-300 truncate max-w-[180px]">{uploadFile.name}</span>
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="Policy title"
                  disabled={uploadLoading}
                  className="flex-1 min-w-[140px] bg-[#111827] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 outline-none focus:ring-2 focus:ring-blue-500/40"
                />
                <button
                  type="button"
                  onClick={handleUploadDocument}
                  disabled={uploadLoading}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30 disabled:opacity-50"
                >
                  {uploadLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                  {uploadLoading ? 'Uploading…' : 'Upload'}
                </button>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleRun}
                disabled={loading}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg
                  ${bgColor} ${textColor} hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed border ${colorParts[1]}`}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                {loading ? 'Running...' : 'Run Agent'}
              </button>
              <button
                onClick={() => { setFormValues({}); setResult(null); setError(null); }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-gray-400 border border-white/10 hover:bg-white/5 transition-all"
              >
                <RotateCcw className="w-4 h-4" /> Reset
              </button>
            </div>
          </div>

          {/* Result */}
          {error && (
            <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
              ⚠️ {error}
            </div>
          )}

          {result && (
            <div className="rounded-2xl bg-[#0c0414]/80 backdrop-blur-xl border border-white/10 shadow-xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
                <h3 className="text-sm font-semibold text-gray-300">Agent Response</h3>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
                >
                  {copied ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied!' : 'Copy JSON'}
                </button>
                {result && (
                  <ReportButton result={result} agentName={selectedAgent.name} title={`${selectedAgent.name} Analysis`} />
                )}
              </div>
              <div className="p-5 overflow-auto max-h-[400px] custom-scrollbar">
                <ResultRenderer data={result} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ResultRenderer({ data }: { data: Record<string, unknown> | string | null }) {
  if (typeof data === 'string') {
    return <p className="text-sm text-gray-200 whitespace-pre-wrap">{data}</p>;
  }

  if (typeof data === 'object' && data !== null) {
    const obj = data as Record<string, unknown>;

    // Try to show 'answer', 'result', 'analysis', etc. as a nicely formatted section
    const textFields = ['answer', 'result', 'analysis', 'summary', 'verdict', 'amendment', 'simulation_result', 'conflict_report', 'graph'];
    const mainText = textFields.map(k => obj[k]).find(v => typeof v === 'string');

    if (mainText) {
      return (
        <div className="space-y-4">
          <div className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">{mainText}</div>
          {obj.confidence !== undefined && (
            <div className="flex items-center gap-2 pt-2 border-t border-white/5">
              <span className="text-xs text-gray-500">Confidence</span>
              <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all"
                  style={{ width: `${Math.round((obj.confidence as number) * 100)}%` }}
                />
              </div>
              <span className="text-xs text-gray-300">{Math.round((obj.confidence as number) * 100)}%</span>
            </div>
          )}
          {Object.entries(obj)
            .filter(([k]) => !textFields.includes(k) && k !== 'confidence')
            .length > 0 && (
            <details className="mt-2">
              <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-300">Show full JSON</summary>
              <pre className="mt-2 text-xs text-gray-400 bg-white/5 rounded-xl p-4 overflow-auto">
                {JSON.stringify(obj, null, 2)}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return (
      <pre className="text-xs text-gray-300 whitespace-pre-wrap leading-relaxed">
        {JSON.stringify(data, null, 2)}
      </pre>
    );
  }

  return <p className="text-sm text-gray-400">{String(data)}</p>;
}
