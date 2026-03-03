"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  FileSearch, Scale, ArrowLeftRight, Search, AlertTriangle,
  FlaskConical, PenLine, Users, Zap, Network, Loader2,
  ChevronRight, Play, RotateCcw, Copy, CheckCheck, UploadCloud,
  ArrowLeft, Cpu, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { runAgent, getPolicies, uploadPolicy } from '@/lib/api';
import { toast } from '@/lib/toast';
import { useTheme } from '@/context/ThemeContext';
import { ReportButton } from '@/components/reports/ReportGenerator';
import { Policy } from '@/types/policy';
import ResponseRenderer from '@/components/shared/ResponseRenderer';

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
  icon: React.ElementType;
  color: string;
  description: string;
  fields: AgentField[];
}

const AGENTS: Agent[] = [
  {
    id: 'analyze',
    name: 'Policy Analyst',
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
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
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

  const firstPolicyFieldKey = selectedAgent?.fields.find((f) => f.type === 'policy_select')?.key;
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
    getPolicies().then(setPolicies).catch(() => { });
  }, []);

  const refreshPolicies = () => getPolicies().then(setPolicies).catch(() => { });

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

  const handleAgentSelect = (agent: Agent) => {
    setSelectedAgent(agent);
    setFormValues({});
    setResult(null);
    setError(null);
  };

  const handleRun = async () => {
    if (!selectedAgent) return;
    setLoading(true);
    setError(null);
    setResult(null);

    // Validation
    for (const field of selectedAgent.fields) {
      if (field.required && !formValues[field.key]) {
        toast.error(`Please provide a ${field.label.toLowerCase()}`);
        setLoading(false);
        return;
      }
    }

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

  const colors = selectedAgent ? colorMap[selectedAgent.color] : '';
  const colorParts = colors.split(' ');
  const textColor = colorParts[2];
  const bgColor = colorParts[3];

  return (
    <div className="flex flex-col gap-6 h-full w-full max-w-7xl mx-auto px-4 md:px-8 py-6">
      <AnimatePresence mode="wait">
        {!selectedAgent ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-8"
          >
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <Cpu className="w-5 h-5 text-blue-400" />
                </div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Agent Playground</h1>
              </div>
              <p className="text-sm text-gray-400 max-w-2xl">
                Choose a specialized AI agent to perform deep analysis on your policy documents.
                Each agent is optimized for a specific investigative task.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {AGENTS.map((agent) => {
                const c = colorMap[agent.color].split(' ');
                return (
                  <motion.button
                    key={agent.id}
                    whileHover={{ scale: 1.02, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAgentSelect(agent)}
                    className="flex flex-col text-left p-6 rounded-2xl bg-[#0c0414]/80 backdrop-blur-xl border border-white/5 hover:border-white/20 transition-all group relative overflow-hidden shadow-xl shadow-black/20"
                  >
                    {/* Ambient glow */}
                    <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-[40px] opacity-20 transition-opacity group-hover:opacity-40 ${c[3]}`} />

                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${c[3]} border ${c[1]}`}>
                      <agent.icon className={`w-6 h-6 ${c[2]}`} />
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors flex items-center gap-2">
                      {agent.name}
                    </h3>

                    <p className="text-sm text-gray-400 leading-relaxed mb-6 flex-1">
                      {agent.description}
                    </p>

                    <div className="flex items-center text-xs font-bold text-gray-500 uppercase tracking-widest gap-2 group-hover:text-white transition-colors">
                      Activate Agent <ChevronRight className="w-4 h-4" />
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="runner"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col gap-6"
          >
            {/* Breadcrumb / Back */}
            <button
              onClick={() => setSelectedAgent(null)}
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors w-fit group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Agents
            </button>

            <div className="flex flex-col lg:flex-row gap-6">
              {/* Left Column: Form */}
              <div className="flex-1 space-y-4">
                {/* Agent Header */}
                <div className={`rounded-2xl bg-gradient-to-br ${colorParts[0]} border ${colorParts[1]} p-6 shadow-xl`}>
                  <div className="flex items-start gap-5">
                    <div className={`w-14 h-14 rounded-2xl ${bgColor} border ${colorParts[1]} flex items-center justify-center shrink-0 shadow-inner`}>
                      <selectedAgent.icon className={`w-7 h-7 ${textColor}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-xl font-bold text-white">{selectedAgent.name}</h2>
                        <Sparkles className={`w-4 h-4 ${textColor} opacity-50`} />
                      </div>
                      <p className="text-sm text-gray-400 leading-relaxed">{selectedAgent.description}</p>
                    </div>
                  </div>
                </div>

                {/* Input Form */}
                <div className="rounded-2xl bg-[#0c0414]/80 backdrop-blur-xl border border-white/10 shadow-xl p-6 space-y-6">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.txt"
                    className="hidden"
                    onChange={handleFileInputChange}
                  />

                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                      Parameters
                    </h3>

                    {selectedAgent.fields.map((field) => (
                      <div key={field.key} className="space-y-2">
                        <label className="text-[13px] font-medium text-gray-300 flex items-center gap-2">
                          {field.label}
                          {field.required && <span className="text-red-500/50 text-[10px] uppercase font-bold">Required</span>}
                        </label>
                        {field.type === 'textarea' ? (
                          <textarea
                            value={formValues[field.key] || ''}
                            onChange={(e) => setFormValues(prev => ({ ...prev, [field.key]: e.target.value }))}
                            placeholder={field.placeholder || ''}
                            rows={4}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all resize-none shadow-inner"
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
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500/40 transition-all cursor-pointer"
                          >
                            <option value="" className="bg-[#0c0414]">Select a policy document</option>
                            <option value={UPLOAD_FROM_DEVICE_VALUE} className="bg-[#0c0414]">Upload new document...</option>
                            {policies.map(p => (
                              <option key={p.id} value={p.id} className="bg-[#0c0414]">{p.title}</option>
                            ))}
                          </select>
                        ) : null}
                      </div>
                    ))}
                  </div>

                  {uploadFile && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-wrap items-center gap-2 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20"
                    >
                      <div className="flex items-center gap-2 shrink-0">
                        <UploadCloud className="w-4 h-4 text-blue-400" />
                        <span className="text-xs text-gray-300 truncate max-w-[120px]">{uploadFile.name}</span>
                      </div>
                      <input
                        type="text"
                        value={uploadTitle}
                        onChange={(e) => setUploadTitle(e.target.value)}
                        placeholder="Policy title"
                        disabled={uploadLoading}
                        className="flex-1 min-w-[140px] bg-[#0c0414] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 outline-none focus:ring-2 focus:ring-blue-500/40"
                      />
                      <button
                        type="button"
                        onClick={handleUploadDocument}
                        disabled={uploadLoading}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-blue-500 text-white border border-blue-600 hover:bg-blue-400 disabled:opacity-50 transition-colors"
                      >
                        {uploadLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Confirm Upload'}
                      </button>
                    </motion.div>
                  )}

                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={handleRun}
                      disabled={loading}
                      className={`flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold transition-all shadow-lg
                        ${bgColor} ${textColor} hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed border ${colorParts[1]} ring-1 ring-white/5`}
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-current" />}
                      {loading ? 'Analyzing Policy...' : 'Run Analysis'}
                    </button>
                    <button
                      onClick={() => { setFormValues({}); setResult(null); setError(null); }}
                      className="p-3.5 rounded-xl text-gray-400 border border-white/10 hover:bg-white/5 transition-all hover:text-white"
                      title="Reset parameters"
                    >
                      <RotateCcw className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Result */}
              <div className="flex-1 min-w-0">
                {!result && !error && !loading && (
                  <div className="h-full min-h-[400px] flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/5 bg-white/[0.02] text-center p-8">
                    <div className={`p-4 rounded-full ${bgColor} border ${colorParts[1]} mb-4 opacity-50`}>
                      <selectedAgent.icon className={`w-8 h-8 ${textColor}`} />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Ready to Analyze</h3>
                    <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
                      Fill in the parameters and click run to see the AI agent's specialized insights.
                    </p>
                  </div>
                )}

                {loading && (
                  <div className="h-full min-h-[400px] flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#0c0414]/80 backdrop-blur-xl text-center p-8">
                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-6" />
                    <h3 className="text-lg font-semibold text-white mb-2">Processing Document</h3>
                    <p className="text-sm text-gray-500 max-w-xs leading-relaxed animate-pulse">
                      Retrieving context and running semantic evaluation...
                    </p>
                  </div>
                )}

                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-2xl bg-red-500/10 border border-red-500/20 p-6 text-sm text-red-400 shadow-xl"
                  >
                    <div className="flex items-center gap-2 font-bold mb-2 uppercase tracking-widest text-xs">
                      Error Encountered
                    </div>
                    <p className="leading-relaxed">{error}</p>
                  </motion.div>
                )}

                {result && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl bg-[#0c0414]/80 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden h-full flex flex-col"
                  >
                    <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/[0.02]">
                      <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        Analysis Report
                      </h3>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleCopy}
                          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-all px-3 py-1.5 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10"
                        >
                          {copied ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          {copied ? 'Copied' : 'JSON'}
                        </button>
                        <ReportButton result={result} agentName={selectedAgent.name} title={`${selectedAgent.name} Analysis`} />
                      </div>
                    </div>
                    <div className="p-6 overflow-auto custom-scrollbar flex-1 max-h-[70vh]">
                      <ResponseRenderer data={result} />
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

