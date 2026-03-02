"use client";

import React, { useState, useEffect } from 'react';
import {
  Sparkles, ArrowLeftRight, Search, AlertTriangle, FlaskConical,
  PenLine, Users, Zap, Shield, Loader2, ChevronRight,
  Play, CheckCircle2, FileText, RotateCcw, Brain, Target,
  TrendingUp, Clock, MessageCircle, Wand2, Network
} from 'lucide-react';
import { runAgent, runOrchestratorAuto, getPolicies } from '@/lib/api';
import { Policy } from '@/types/policy';
import { ReportButton } from '@/components/reports/ReportGenerator';
import { useTheme } from '@/context/ThemeContext';


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
  gradient: string;
  border: string;
  textColor: string;
  bgColor: string;
  popular: boolean;
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
    gradient: 'from-blue-500/20 to-cyan-500/10',
    border: 'border-blue-500/30',
    textColor: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    popular: true,
    fields: [
      { key: 'query', label: 'Your Question', placeholder: 'What are the data retention requirements under DPDP Act?', type: 'textarea', required: true },
      { key: 'policy_id', label: 'Policy (optional)', type: 'policy_select' },
    ],
    agent: 'analyze',
    payloadMap: (f: Record<string, string>) => ({ query: f.query, policy_id: f.policy_id ? parseInt(f.policy_id) : undefined }),
    example: 'What penalties apply for data protection violations?',
  },
  {
    id: 'compliance-check',
    title: 'Compliance Check',
    subtitle: 'Is a scenario compliant with policy?',
    icon: Shield,
    color: 'emerald',
    gradient: 'from-emerald-500/20 to-teal-500/10',
    border: 'border-emerald-500/30',
    textColor: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    popular: true,
    fields: [
      { key: 'scenario', label: 'Describe the Scenario', placeholder: 'A fintech company stores user transaction data on overseas servers without consent...', type: 'textarea', required: true },
      { key: 'policy_id', label: 'Policy to check against', type: 'policy_select' },
    ],
    agent: 'compliance',
    payloadMap: (f: Record<string, string>) => ({ scenario: f.scenario, policy_id: f.policy_id ? parseInt(f.policy_id) : undefined }),
    example: 'Can a telecom company share subscriber data with third parties?',
  },
  {
    id: 'compare',
    title: 'Compare Policies',
    subtitle: 'Side-by-side policy comparison',
    icon: ArrowLeftRight,
    color: 'cyan',
    gradient: 'from-cyan-500/20 to-blue-500/10',
    border: 'border-cyan-500/30',
    textColor: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    popular: false,
    fields: [
      { key: 'policy_id_a', label: 'First Policy', type: 'policy_select', required: true },
      { key: 'policy_id_b', label: 'Second Policy', type: 'policy_select', required: true },
    ],
    agent: 'compare',
    payloadMap: (f: Record<string, string>) => ({ policy_id_a: parseInt(f.policy_id_a), policy_id_b: parseInt(f.policy_id_b) }),
    example: 'Compare IT Act 2000 with DPDP Act 2023',
  },
  {
    id: 'find-gaps',
    title: 'Find Policy Gaps',
    subtitle: 'Identify missing areas & weak clauses',
    icon: Search,
    color: 'purple',
    gradient: 'from-purple-500/20 to-violet-500/10',
    border: 'border-purple-500/30',
    textColor: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    popular: false,
    fields: [
      { key: 'focus', label: 'Focus Area', placeholder: 'What should I look for? E.g. data privacy enforcement', type: 'textarea', required: true },
      { key: 'policy_id', label: 'Policy (optional)', type: 'policy_select' },
    ],
    agent: 'gap-analysis',
    payloadMap: (f: Record<string, string>) => ({ focus: f.focus, policy_id: f.policy_id ? parseInt(f.policy_id) : undefined }),
    example: 'Find gaps in cybersecurity compliance requirements',
  },
  {
    id: 'risk-score',
    title: 'Risk Assessment',
    subtitle: 'Score policy risks & vulnerabilities',
    icon: AlertTriangle,
    color: 'red',
    gradient: 'from-red-500/20 to-orange-500/10',
    border: 'border-red-500/30',
    textColor: 'text-red-400',
    bgColor: 'bg-red-500/10',
    popular: false,
    fields: [
      { key: 'focus', label: 'Risk Context', placeholder: 'Assess financial and operational risks in Section 4...', type: 'textarea', required: true },
      { key: 'policy_id', label: 'Policy (optional)', type: 'policy_select' },
    ],
    agent: 'risk',
    payloadMap: (f: Record<string, string>) => ({ focus: f.focus, policy_id: f.policy_id ? parseInt(f.policy_id) : undefined }),
    example: 'What are the highest-risk clauses in the Telecom Act?',
  },
  {
    id: 'simulate',
    title: 'Simulate Change',
    subtitle: 'What happens if this policy changes?',
    icon: FlaskConical,
    color: 'amber',
    gradient: 'from-amber-500/20 to-yellow-500/10',
    border: 'border-amber-500/30',
    textColor: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    popular: false,
    fields: [
      { key: 'proposed_change', label: 'Proposed Policy Change', placeholder: 'If we remove the mandatory 30-day data deletion clause...', type: 'textarea', required: true },
      { key: 'policy_id', label: 'Policy (optional)', type: 'policy_select' },
    ],
    agent: 'simulate',
    payloadMap: (f: Record<string, string>) => ({ proposed_change: f.proposed_change, policy_id: f.policy_id ? parseInt(f.policy_id) : undefined }),
    example: 'Simulate impact of extending data retention from 1yr to 5yr',
  },
  {
    id: 'stakeholders',
    title: 'Stakeholder Impact',
    subtitle: 'Who is affected and how?',
    icon: Users,
    color: 'orange',
    gradient: 'from-orange-500/20 to-amber-500/10',
    border: 'border-orange-500/30',
    textColor: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    popular: false,
    fields: [
      { key: 'focus', label: 'Context / Sector', placeholder: 'Analyze impact on small businesses in the fintech space...', type: 'textarea', required: true },
      { key: 'policy_id', label: 'Policy (optional)', type: 'policy_select' },
    ],
    agent: 'stakeholders',
    payloadMap: (f: Record<string, string>) => ({ focus: f.focus, policy_id: f.policy_id ? parseInt(f.policy_id) : undefined }),
    example: 'How does the DPDP Act affect healthcare providers?',
  },
  {
    id: 'smart-route',
    title: 'Smart Analysis',
    subtitle: 'AI picks the best agents for you',
    icon: Wand2,
    color: 'violet',
    gradient: 'from-violet-500/20 to-purple-500/10',
    border: 'border-violet-500/30',
    textColor: 'text-violet-400',
    bgColor: 'bg-violet-500/10',
    popular: true,
    fields: [
      { key: 'query', label: 'Describe what you need', placeholder: 'I need a full compliance and risk analysis for our new data processing pipeline...', type: 'textarea', required: true },
      { key: 'policy_id', label: 'Policy (optional)', type: 'policy_select' },
    ],
    agent: '__orchestrator__',
    payloadMap: (f: Record<string, string>) => ({ query: f.query, policy_id: f.policy_id ? parseInt(f.policy_id) : undefined }),
    example: 'Full audit of our telecom policy with amendment suggestions',
  },
];

type TaskResult = { data: Record<string, unknown> | string; agentName: string; taskTitle: string; query?: string };

export default function TasksPage() {
  const [selectedTask, setSelectedTask] = useState(TASKS[0]);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TaskResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [historyStack, setHistoryStack] = useState<TaskResult[]>([]);
  const { isDark } = useTheme();

  useEffect(() => {
    getPolicies().then(setPolicies).catch(() => {});
  }, []);

  const handleSelectTask = (task: TaskDef) => {
    setSelectedTask(task);
    setFormValues({});
    setResult(null);
    setError(null);
  };

  const handleQuickFill = (example: string) => {
    const firstTextarea = selectedTask.fields.find(f => f.type === 'textarea');
    if (firstTextarea) {
      setFormValues(prev => ({ ...prev, [firstTextarea.key]: example }));
    }
  };

  const handleRun = async () => {
    const requiredFields = selectedTask.fields.filter(f => f.required);
    for (const f of requiredFields) {
      if (!formValues[f.key]?.trim()) {
        setError(`Please fill in: ${f.label}`);
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
        taskTitle: `${selectedTask.title} Report`,
        query: formValues.query || formValues.scenario || formValues.focus || formValues.proposed_change || '',
      };
      setResult(taskResult);
      setHistoryStack(prev => [taskResult, ...prev.slice(0, 4)]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Task failed. Check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const cardBg = isDark ? 'bg-[#0c0414]/80 border-white/10' : 'bg-white border-gray-200';
  const inputBg = isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200';
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-500';
  const hoverBg = isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50';

  return (
    <div className="flex flex-col gap-0 h-full w-full">
      {/* Header Banner */}
      <div className={`px-6 md:px-8 py-5 border-b ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className={`text-xl font-bold ${textPrimary} flex items-center gap-2`}>
              <Sparkles className="w-5 h-5 text-blue-400" /> Task Center
            </h1>
            <p className={`text-sm ${textSecondary} mt-0.5`}>
              User-friendly interface for all AI-powered policy tasks
            </p>
          </div>
          {historyStack.length > 0 && (
            <div className={`text-xs ${textSecondary}`}>
              {historyStack.length} task{historyStack.length !== 1 ? 's' : ''} completed this session
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden max-w-7xl mx-auto w-full">

        {/* Left: Task Picker */}
        <div className={`w-64 shrink-0 border-r ${isDark ? 'border-white/5' : 'border-gray-100'} overflow-y-auto custom-scrollbar py-4`}>
          <div className="px-3 mb-2">
            <p className={`text-[11px] font-semibold uppercase tracking-wider ${textSecondary}`}>Popular</p>
          </div>
          {TASKS.filter(t => t.popular).map(task => (
            <TaskNavItem key={task.id} task={task} isActive={selectedTask.id === task.id} onClick={() => handleSelectTask(task)} isDark={isDark} />
          ))}
          <div className={`h-px mx-3 my-3 ${isDark ? 'bg-white/5' : 'bg-gray-100'}`} />
          <div className="px-3 mb-2">
            <p className={`text-[11px] font-semibold uppercase tracking-wider ${textSecondary}`}>All Tasks</p>
          </div>
          {TASKS.filter(t => !t.popular).map(task => (
            <TaskNavItem key={task.id} task={task} isActive={selectedTask.id === task.id} onClick={() => handleSelectTask(task)} isDark={isDark} />
          ))}
        </div>

        {/* Center: Task Form + Result */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-6 space-y-5 max-w-3xl">

            {/* Task Header */}
            <div className={`rounded-2xl bg-gradient-to-br ${selectedTask.gradient} border ${selectedTask.border} p-5 shadow-lg`}>
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-2xl ${selectedTask.bgColor} flex items-center justify-center shrink-0`}>
                  <selectedTask.icon className={`w-6 h-6 ${selectedTask.textColor}`} />
                </div>
                <div className="flex-1">
                  <h2 className={`text-lg font-bold ${textPrimary}`}>{selectedTask.title}</h2>
                  <p className={`text-sm ${textSecondary}`}>{selectedTask.subtitle}</p>
                  {selectedTask.agent === '__orchestrator__' && (
                    <div className={`mt-2 flex items-center gap-2 text-xs ${selectedTask.textColor}`}>
                      <Brain className="w-3.5 h-3.5" /> Auto-routes to the most relevant agents
                    </div>
                  )}
                </div>
              </div>

              {/* Example prompt pill */}
              <button
                onClick={() => handleQuickFill(selectedTask.example)}
                className={`mt-4 flex items-center gap-2 text-xs ${selectedTask.textColor} ${selectedTask.bgColor} px-3 py-2 rounded-xl border ${selectedTask.border} hover:opacity-80 transition-all w-full text-left`}
              >
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span><strong>Try example:</strong> {selectedTask.example}</span>
              </button>
            </div>

            {/* Input Form */}
            <div className={`rounded-2xl backdrop-blur-xl border shadow-xl p-5 space-y-4 ${cardBg}`}>
              {selectedTask.fields.map((field) => (
                <div key={field.key} className="space-y-1.5">
                  <label className={`text-xs font-semibold ${textSecondary} flex items-center gap-1.5`}>
                    {field.label}
                    {field.required && <span className="text-red-400">*</span>}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea
                      value={formValues[field.key] || ''}
                      onChange={e => setFormValues(prev => ({ ...prev, [field.key]: e.target.value }))}
                      placeholder={field.placeholder || ''}
                      rows={4}
                      className={`w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/40 transition-all resize-none ${inputBg} ${textPrimary} placeholder-gray-500`}
                    />
                  ) : field.type === 'policy_select' ? (
                    <select
                      value={formValues[field.key] || ''}
                      onChange={e => setFormValues(prev => ({ ...prev, [field.key]: e.target.value }))}
                      className={`w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/40 ${isDark ? 'bg-[#111827]' : 'bg-white'} border-white/10 ${textPrimary}`}
                    >
                      <option value="">— {field.required ? 'Select a policy' : 'Select (optional)'} —</option>
                      {policies.map(p => (
                        <option key={p.id} value={p.id}>{p.id}: {p.title}</option>
                      ))}
                    </select>
                  ) : null}
                </div>
              ))}

              {error && (
                <p className="text-xs text-red-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> {error}
                </p>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  onClick={handleRun}
                  disabled={loading}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg
                    ${selectedTask.bgColor} ${selectedTask.textColor} border ${selectedTask.border} hover:opacity-80`}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  {loading ? 'Running Analysis...' : `Run ${selectedTask.title}`}
                </button>
                <button
                  onClick={() => { setFormValues({}); setResult(null); setError(null); }}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm ${textSecondary} border ${isDark ? 'border-white/10 hover:bg-white/5' : 'border-gray-200 hover:bg-gray-50'} transition-all`}
                >
                  <RotateCcw className="w-4 h-4" /> Clear
                </button>
              </div>
            </div>

            {/* Result */}
            {result && (
              <TaskResultDisplay result={result} isDark={isDark} textPrimary={textPrimary} textSecondary={textSecondary} cardBg={cardBg} taskColor={selectedTask.textColor} taskBg={selectedTask.bgColor} taskBorder={selectedTask.border} />
            )}
          </div>
        </div>

        {/* Right: Context / History panel */}
        <div className={`w-64 shrink-0 border-l ${isDark ? 'border-white/5' : 'border-gray-100'} overflow-y-auto custom-scrollbar py-4`}>
          <div className="px-4 space-y-4">
            {/* Task Stats */}
            <div>
              <p className={`text-[11px] font-semibold uppercase tracking-wider ${textSecondary} mb-3`}>Quick Stats</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Tasks', value: TASKS.length, icon: Target },
                  { label: 'Done', value: historyStack.length, icon: CheckCircle2 },
                  { label: 'Policies', value: policies.length, icon: FileText },
                  { label: 'Agents', value: 13, icon: Zap },
                ].map(item => (
                  <div key={item.label} className={`p-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'} border ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
                    <item.icon className={`w-3.5 h-3.5 ${textSecondary} mb-1`} />
                    <p className={`text-base font-bold ${textPrimary}`}>{item.value}</p>
                    <p className={`text-[10px] ${textSecondary}`}>{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent results */}
            {historyStack.length > 0 && (
              <div>
                <p className={`text-[11px] font-semibold uppercase tracking-wider ${textSecondary} mb-3`}>Recent Tasks</p>
                <div className="space-y-2">
                  {historyStack.map((item, i) => (
                    <button
                      key={i}
                      onClick={() => setResult(item)}
                      className={`w-full flex items-start gap-2 p-3 rounded-xl border text-left transition-all ${hoverBg} ${isDark ? 'border-white/5' : 'border-gray-100'}`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className={`text-xs font-medium ${textPrimary} truncate`}>{item.agentName}</p>
                        <p className={`text-[10px] ${textSecondary} truncate`}>{item.query?.substring(0, 40)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tips */}
            <div className={`rounded-xl p-4 ${isDark ? 'bg-blue-500/5 border border-blue-500/10' : 'bg-blue-50 border border-blue-100'}`}>
              <p className={`text-[11px] font-semibold ${isDark ? 'text-blue-400' : 'text-blue-600'} mb-2`}>💡 Tips</p>
              <ul className={`text-[11px] ${textSecondary} space-y-1.5`}>
                <li>• Try "Smart Analysis" for complex multi-step tasks</li>
                <li>• Select a policy to get more precise results</li>
                <li>• Export reports as PDF from result panel</li>
                <li>• Use the chatbot for quick questions</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Subcomponents ─────────────────────────────────────────────────────────────

function TaskNavItem({ task, isActive, onClick, isDark }: {
  task: TaskDef; isActive: boolean; onClick: () => void; isDark: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 mx-1 rounded-xl text-left transition-all group
        ${isActive
          ? `${task.bgColor} ${task.textColor} border ${task.border}`
          : `border border-transparent ${isDark ? 'hover:bg-white/5 text-gray-400 hover:text-white' : 'hover:bg-gray-50 text-gray-500 hover:text-gray-900'}`
        }`}
    >
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isActive ? task.bgColor : isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
        <task.icon className={`w-4 h-4 ${isActive ? task.textColor : isDark ? 'text-gray-500' : 'text-gray-400'}`} />
      </div>
      <span className="text-sm font-medium truncate">{task.title}</span>
      {task.popular && !isActive && (
        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 shrink-0">Hot</span>
      )}
    </button>
  );
}

function TaskResultDisplay({ result, isDark, textPrimary, textSecondary, cardBg, taskColor, taskBg, taskBorder }: {
  result: TaskResult;
  isDark: boolean;
  textPrimary: string;
  textSecondary: string;
  cardBg: string;
  taskColor: string;
  taskBg: string;
  taskBorder: string;
}) {
  const r = result.data as Record<string, unknown>;

  const answer = (r?.answer || r?.result || r?.analysis || r?.summary || r?.verdict || r?.amendment || r?.simulation_result || '') as string;
  const confidence = r?.confidence as number | undefined;
  const riskLevel = r?.risk_level as string | undefined;
  const agents = (r?.agents_used || r?.agents_executed || []) as string[];
  const finalAnswer = (r?.final_answer || r?.synthesis || '') as string;

  const displayText = finalAnswer || answer;

  return (
    <div className={`rounded-2xl backdrop-blur-xl border shadow-xl overflow-hidden ${cardBg}`}>
      {/* Result header */}
      <div className={`flex items-center justify-between px-5 py-4 border-b ${isDark ? 'border-white/5' : 'border-gray-100'} ${taskBg} bg-opacity-50`}>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <h3 className={`text-sm font-semibold ${textPrimary}`}>Analysis Complete</h3>
          <span className={`text-xs px-2 py-0.5 rounded-full ${taskBg} ${taskColor} border ${taskBorder}`}>{result.agentName}</span>
        </div>
        <ReportButton
          result={result.data}
          agentName={result.agentName}
          title={result.taskTitle}
          query={result.query}
        />
      </div>

      <div className="p-5 space-y-5">
        {/* Agents used */}
        {agents.length > 0 && (
          <div>
            <p className={`text-[11px] font-semibold uppercase tracking-wider ${textSecondary} mb-2`}>Agents Used</p>
            <div className="flex flex-wrap gap-1.5">
              {agents.map(a => (
                <span key={a} className={`text-[11px] px-2.5 py-1 rounded-full border ${isDark ? 'bg-white/5 border-white/10 text-gray-300' : 'bg-gray-100 border-gray-200 text-gray-600'} flex items-center gap-1`}>
                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" /> {a.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Confidence + Risk inline */}
        {(confidence !== undefined || riskLevel) && (
          <div className="flex items-center gap-4 flex-wrap">
            {confidence !== undefined && (
              <div className="flex items-center gap-2">
                <span className={`text-xs ${textSecondary}`}>Confidence</span>
                <div className="flex items-center gap-2">
                  <div className={`w-24 h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}>
                    <div
                      className={`h-full rounded-full ${confidence >= 0.7 ? 'bg-emerald-500' : confidence >= 0.4 ? 'bg-amber-500' : 'bg-red-500'}`}
                      style={{ width: `${Math.round(confidence * 100)}%` }}
                    />
                  </div>
                  <span className={`text-sm font-bold ${textPrimary}`}>{Math.round(confidence * 100)}%</span>
                </div>
              </div>
            )}
            {riskLevel && (
              <div className="flex items-center gap-2">
                <span className={`text-xs ${textSecondary}`}>Risk</span>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                  riskLevel.toLowerCase() === 'high' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                  riskLevel.toLowerCase() === 'medium' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                  'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                }`}>
                  {riskLevel}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Main answer */}
        {displayText ? (
          <div>
            <p className={`text-[11px] font-semibold uppercase tracking-wider ${textSecondary} mb-3`}>Findings</p>
            <div className={`rounded-xl p-4 border text-sm leading-relaxed whitespace-pre-wrap ${isDark ? 'bg-white/5 border-white/5 text-gray-200' : 'bg-gray-50 border-gray-100 text-gray-700'}`}>
              {displayText}
            </div>
          </div>
        ) : (
          <pre className={`text-xs rounded-xl p-4 overflow-auto border ${isDark ? 'bg-white/5 border-white/5 text-gray-300' : 'bg-gray-50 border-gray-100 text-gray-600'}`}>
            {JSON.stringify(result.data, null, 2)}
          </pre>
        )}

        {/* Nested agent results for orchestrator */}
        {(r?.results || r?.agent_results) && (
          <div>
            <p className={`text-[11px] font-semibold uppercase tracking-wider ${textSecondary} mb-3`}>Detailed Agent Breakdown</p>
            <div className="space-y-2">
              {Object.entries((r?.results || r?.agent_results) as Record<string, unknown>).map(([agent, res]) => {
                const agentText = (res as Record<string, unknown>)?.answer || (res as Record<string, unknown>)?.result || '';
                return (
                  <details key={agent} className={`rounded-xl border overflow-hidden ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
                    <summary className={`flex items-center gap-2 px-4 py-2.5 cursor-pointer text-sm font-medium transition-colors ${isDark ? 'hover:bg-white/5 text-gray-300' : 'hover:bg-gray-50 text-gray-600'}`}>
                      <Zap className="w-3.5 h-3.5 text-blue-400" />
                      {agent.replace(/_/g, ' ')}
                    </summary>
                    <div className={`px-4 pb-3 text-xs leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {typeof agentText === 'string' ? agentText : JSON.stringify(res, null, 2)}
                    </div>
                  </details>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
