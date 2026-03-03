"use client";

import React, { useState, useEffect } from 'react';
import {
  Sparkles, ArrowLeftRight, Search, AlertTriangle, FlaskConical,
  PenLine, Users, Zap, Shield, Loader2, ChevronRight,
  Play, CheckCircle2, FileText, RotateCcw, Brain, Target,
  TrendingUp, Clock, MessageCircle, Wand2, Network, ArrowLeft,
  ChevronDown, SearchIcon, Filter, LayoutDashboard, History
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { runAgent, runOrchestratorAuto, getPolicies } from '@/lib/api';
import { Policy } from '@/types/policy';
import { ReportButton } from '@/components/reports/ReportGenerator';
import { useTheme } from '@/context/ThemeContext';
import { toast } from '@/lib/toast';
import ResponseRenderer from '@/components/shared/ResponseRenderer';

// ─── Task Definitions ──────────────────────────────────────────────────────────
interface TaskField {
  key: string;
  label: string;
  type: 'textarea' | 'policy_select' | 'text';
  placeholder?: string;
  required?: boolean;
}

interface TaskDef {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  category: 'General' | 'Compliance' | 'Risk' | 'Strategy';
  fields: TaskField[];
  agent: string;
  payloadMap: (f: Record<string, string>) => Record<string, unknown>;
  example: string;
}

const TASKS: TaskDef[] = [
  {
    id: 'ask',
    title: 'Ask Anything',
    subtitle: 'Get instant answers about any policy',
    icon: MessageCircle,
    color: 'blue',
    category: 'General',
    fields: [
      { key: 'query', label: 'Your Question', placeholder: 'What are the data retention requirements?', type: 'textarea', required: true },
      { key: 'policy_id', label: 'Policy (optional)', type: 'policy_select' },
    ],
    agent: 'analyze',
    payloadMap: (f) => ({ query: f.query, policy_id: f.policy_id ? parseInt(f.policy_id) : undefined }),
    example: 'What penalties apply for data protection violations?',
  },
  {
    id: 'smart-route',
    title: 'Smart Analysis',
    subtitle: 'AI picks the best agents for you',
    icon: Wand2,
    color: 'violet',
    category: 'General',
    fields: [
      { key: 'query', label: 'Describe what you need', placeholder: 'I need a full compliance and risk analysis...', type: 'textarea', required: true },
      { key: 'policy_id', label: 'Policy (optional)', type: 'policy_select' },
    ],
    agent: '__orchestrator__',
    payloadMap: (f) => ({ query: f.query, policy_id: f.policy_id ? parseInt(f.policy_id) : undefined }),
    example: 'Full audit of our telecom policy with amendment suggestions',
  },
  {
    id: 'compliance-check',
    title: 'Compliance Check',
    subtitle: 'Is a scenario compliant with policy?',
    icon: Shield,
    color: 'emerald',
    category: 'Compliance',
    fields: [
      { key: 'scenario', label: 'Describe the Scenario', placeholder: 'A company stores user transaction data...', type: 'textarea', required: true },
      { key: 'policy_id', label: 'Policy to check against', type: 'policy_select' },
    ],
    agent: 'compliance',
    payloadMap: (f) => ({ scenario: f.scenario, policy_id: f.policy_id ? parseInt(f.policy_id) : undefined }),
    example: 'Can a telecom company share subscriber data with third parties?',
  },
  {
    id: 'compare',
    title: 'Compare Policies',
    subtitle: 'Side-by-side policy comparison',
    icon: ArrowLeftRight,
    color: 'cyan',
    category: 'General',
    fields: [
      { key: 'policy_id_a', label: 'First Policy', type: 'policy_select', required: true },
      { key: 'policy_id_b', label: 'Second Policy', type: 'policy_select', required: true },
    ],
    agent: 'compare',
    payloadMap: (f) => ({ policy_id_a: parseInt(f.policy_id_a), policy_id_b: parseInt(f.policy_id_b) }),
    example: 'Compare IT Act 2000 with DPDP Act 2023',
  },
  {
    id: 'find-gaps',
    title: 'Find Policy Gaps',
    subtitle: 'Identify missing areas & weak clauses',
    icon: Search,
    color: 'purple',
    category: 'Compliance',
    fields: [
      { key: 'focus', label: 'Focus Area', placeholder: 'What should I look for?', type: 'textarea', required: true },
      { key: 'policy_id', label: 'Policy (optional)', type: 'policy_select' },
    ],
    agent: 'gap-analysis',
    payloadMap: (f) => ({ focus: f.focus, policy_id: f.policy_id ? parseInt(f.policy_id) : undefined }),
    example: 'Find gaps in cybersecurity compliance requirements',
  },
  {
    id: 'risk-score',
    title: 'Risk Assessment',
    subtitle: 'Score policy risks & vulnerabilities',
    icon: AlertTriangle,
    color: 'red',
    category: 'Risk',
    fields: [
      { key: 'focus', label: 'Risk Context', placeholder: 'Assess financial and operational risks...', type: 'textarea', required: true },
      { key: 'policy_id', label: 'Policy (optional)', type: 'policy_select' },
    ],
    agent: 'risk',
    payloadMap: (f) => ({ focus: f.focus, policy_id: f.policy_id ? parseInt(f.policy_id) : undefined }),
    example: 'What are the highest-risk clauses in the Telecom Act?',
  },
  {
    id: 'simulate',
    title: 'Simulate Change',
    subtitle: 'What happens if this policy changes?',
    icon: FlaskConical,
    color: 'amber',
    category: 'Strategy',
    fields: [
      { key: 'proposed_change', label: 'Proposed Policy Change', placeholder: 'If we remove Section 4.2...', type: 'textarea', required: true },
      { key: 'policy_id', label: 'Policy (optional)', type: 'policy_select' },
    ],
    agent: 'simulate',
    payloadMap: (f) => ({ proposed_change: f.proposed_change, policy_id: f.policy_id ? parseInt(f.policy_id) : undefined }),
    example: 'Simulate impact of extending data retention from 1yr to 5yr',
  },
  {
    id: 'stakeholders',
    title: 'Stakeholder Impact',
    subtitle: 'Who is affected and how?',
    icon: Users,
    color: 'orange',
    category: 'Strategy',
    fields: [
      { key: 'focus', label: 'Context / Sector', placeholder: 'Analyze impact on small businesses...', type: 'textarea', required: true },
      { key: 'policy_id', label: 'Policy (optional)', type: 'policy_select' },
    ],
    agent: 'stakeholders',
    payloadMap: (f) => ({ focus: f.focus, policy_id: f.policy_id ? parseInt(f.policy_id) : undefined }),
    example: 'How does the DPDP Act affect healthcare providers?',
  },
];

const categories = ['All', 'General', 'Compliance', 'Risk', 'Strategy'] as const;

type TaskResult = { data: Record<string, unknown> | string; agentName: string; taskTitle: string; query?: string };

export default function TasksPage() {
  const [selectedTask, setSelectedTask] = useState<TaskDef | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<typeof categories[number]>('All');
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TaskResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [historyStack, setHistoryStack] = useState<TaskResult[]>([]);
  const { isDark } = useTheme();

  useEffect(() => {
    getPolicies().then(setPolicies).catch(() => { });
  }, []);

  const filteredTasks = TASKS.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.subtitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'All' || task.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSelectTask = (task: TaskDef) => {
    setSelectedTask(task);
    setFormValues({});
    setResult(null);
    setError(null);
  };

  const handleRun = async () => {
    if (!selectedTask) return;
    const requiredFields = selectedTask.fields.filter(f => f.required);
    for (const f of requiredFields) {
      if (!formValues[f.key]?.trim()) {
        toast.error(`Please fill in: ${f.label}`);
        return;
      }
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let data: Record<string, unknown> | string;
      const payload = selectedTask.payloadMap(formValues);

      if (selectedTask.agent === '__orchestrator__') {
        data = await runOrchestratorAuto(payload as { query: string; policy_id?: number | null });
      } else {
        data = await runAgent(selectedTask.agent, payload as Record<string, unknown>);
      }

      const taskResult: TaskResult = {
        data,
        agentName: selectedTask.title,
        taskTitle: `${selectedTask.title} Analysis`,
        query: formValues.query || formValues.scenario || formValues.focus || formValues.proposed_change || '',
      };
      setResult(taskResult);
      setHistoryStack(prev => [taskResult, ...prev.slice(0, 9)]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Task failed. Check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full max-w-5xl mx-auto px-4 py-8">
      <AnimatePresence mode="wait">
        {!selectedTask ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            {/* Command Header */}
            <div className="text-center space-y-3 mb-12">
              <h1 className="text-4xl font-extrabold text-white tracking-tight flex items-center justify-center gap-3">
                <Target className="w-8 h-8 text-blue-500" /> Task Centre
              </h1>
              <p className="text-gray-400 text-lg max-w-xl mx-auto">
                Select an objective to begin. Bharat Policy Intelligence will orchestrate the underlying agents for you.
              </p>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between pb-6 border-b border-white/5">
              <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 w-full md:w-auto overflow-x-auto">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeCategory === cat
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div className="relative w-full md:w-64 group">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Find a task..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-gray-600 outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                />
              </div>
            </div>

            {/* Task List (The Command Center Rows) */}
            <div className="space-y-3">
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task) => (
                  <button
                    key={task.id}
                    onClick={() => handleSelectTask(task)}
                    className="w-full group flex items-center gap-5 p-4 rounded-2xl bg-[#0c0414]/40 hover:bg-[#0c0414]/80 border border-white/5 hover:border-white/20 transition-all text-left relative overflow-hidden"
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-white/5 group-hover:bg-blue-500/10 transition-colors border border-white/5 group-hover:border-blue-500/20`}>
                      <task.icon className="w-6 h-6 text-gray-400 group-hover:text-blue-400 transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-lg font-bold text-gray-200 group-hover:text-white">{task.title}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gray-500 uppercase font-bold tracking-widest">{task.category}</span>
                      </div>
                      <p className="text-sm text-gray-500 truncate">{task.subtitle}</p>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                      <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                        <ChevronRight className="w-5 h-5 text-blue-400" />
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="py-20 text-center text-gray-600">
                  <SearchIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>No tasks found matching your filters.</p>
                </div>
              )}
            </div>

            {/* Session History Footer */}
            {historyStack.length > 0 && (
              <div className="pt-12 border-t border-white/5 space-y-4">
                <div className="flex items-center gap-2 text-gray-400/50">
                  <History className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-widest">Session History</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-8">
                  {historyStack.map((hist, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        const task = TASKS.find(t => t.title === hist.agentName);
                        if (task) setSelectedTask(task);
                        setResult(hist);
                      }}
                      className="p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/5 transition-all text-left flex items-center gap-3 group"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-500/50" />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-gray-300 group-hover:text-white truncate">{hist.agentName}</div>
                        <div className="text-[10px] text-gray-500 truncate italic">"{hist.query?.substring(0, 40)}..."</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="runner"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-6"
          >
            {/* Single Centered Runner Layout */}
            <button
              onClick={() => setSelectedTask(null)}
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Return to Command Center
            </button>

            <div className="bg-[#0c0414]/60 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
              {/* Runner Header */}
              <div className="p-8 pb-0 border-b border-white/5">
                <div className="flex items-start gap-6 mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 shadow-lg">
                    <selectedTask.icon className="w-8 h-8 text-blue-400" />
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-2xl font-bold text-white tracking-tight">{selectedTask.title}</h2>
                      <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] uppercase font-black">Active Context</span>
                    </div>
                    <p className="text-gray-400">{selectedTask.subtitle}</p>
                  </div>
                  {result && (
                    <ReportButton result={result.data} agentName={selectedTask.title} title={result.taskTitle} />
                  )}
                </div>
              </div>

              {/* Runner Body (Two Panels or Stacked) */}
              <div className="p-8 space-y-8">
                {/* Inputs Section */}
                {!result && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6 max-w-2xl mx-auto py-12"
                  >
                    {selectedTask.fields.map((field) => (
                      <div key={field.key} className="space-y-2">
                        <label className="text-sm font-bold text-gray-400 uppercase tracking-widest pl-1">
                          {field.label} {field.required && <span className="text-red-500">*</span>}
                        </label>
                        {field.type === 'textarea' ? (
                          <textarea
                            value={formValues[field.key] || ''}
                            onChange={e => setFormValues(prev => ({ ...prev, [field.key]: e.target.value }))}
                            placeholder={field.placeholder || ''}
                            rows={6}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-base text-white placeholder-gray-600 outline-none focus:ring-2 focus:ring-blue-500/40 focus:bg-white/[0.05] transition-all resize-none shadow-inner"
                          />
                        ) : field.type === 'policy_select' ? (
                          <select
                            value={formValues[field.key] || ''}
                            onChange={e => setFormValues(prev => ({ ...prev, [field.key]: e.target.value }))}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-base text-white outline-none focus:ring-2 focus:ring-blue-500/40 transition-all cursor-pointer"
                          >
                            <option value="" className="bg-[#0c0414]">Select a policy document...</option>
                            {policies.map(p => (
                              <option key={p.id} value={p.id} className="bg-[#0c0414]">{p.title}</option>
                            ))}
                          </select>
                        ) : null}
                      </div>
                    ))}

                    <div className="flex flex-col gap-4 pt-4">
                      <button
                        onClick={handleRun}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-lg shadow-[0_0_30px_rgba(59,130,246,0.3)] transition-all disabled:opacity-50"
                      >
                        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Play className="w-5 h-5 fill-current" />}
                        {loading ? 'Processing Large Model Inquiry...' : 'Execute Analysis'}
                      </button>
                      <div className="text-center text-xs text-gray-500 italic">
                        Running this task may involve multiple specialized LLM agents.
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Progress State */}
                {loading && (
                  <div className="max-w-2xl mx-auto py-20 text-center space-y-6">
                    <div className="relative inline-block">
                      <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
                      <Brain className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-white" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-white">Analysis in Progress</h3>
                      <p className="text-gray-500 max-w-sm mx-auto animate-pulse">
                        Evaluating document context, retrieving legal markers, and synthesizing findings...
                      </p>
                    </div>
                  </div>
                )}

                {/* Final Result Render */}
                {result && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                  >
                    <div className="flex items-center justify-between border-b border-white/5 pb-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        <h4 className="text-lg font-bold text-gray-200">Analysis Findings</h4>
                      </div>
                      <button
                        onClick={() => { setResult(null); setFormValues({}); }}
                        className="text-xs text-gray-500 hover:text-white transition-colors underline decoration-dotted"
                      >
                        Run New Search
                      </button>
                    </div>

                    <div className="max-w-none">
                      <ResponseRenderer data={result.data} />
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

// ─── Subcomponents ─────────────────────────────────────────────────────────────

