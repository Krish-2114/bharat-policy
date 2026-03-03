"use client";

import React from 'react';
import {
  CheckCircle2, AlertTriangle, Info, Clock,
  Users, Shield, Zap, Search, MessageCircle,
  FileText, TrendingUp, ChevronDown
} from 'lucide-react';

interface ResponseRendererProps {
  data: any;
  isDark?: boolean;
}

export default function ResponseRenderer({ data, isDark = true }: ResponseRendererProps) {
  if (!data) return null;

  // 1. If it's a string, try to parse it as JSON if it looks like an object or array
  const processData = (input: any): any => {
    if (typeof input === 'string') {
      const trimmed = input.trim();
      if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
        try {
          return JSON.parse(trimmed);
        } catch (e) {
          return input;
        }
      }
    }
    return input;
  };

  const parsedData = processData(data);

  // If it's still just a simple string after trying to parse
  if (typeof parsedData === 'string') {
    return (
      <div className="text-gray-200 leading-relaxed whitespace-pre-wrap text-[15px]">
        {parsedData}
      </div>
    );
  }

  const obj = parsedData as Record<string, any>;

  // 2. Handle Orchestrator / Multi-agent responses
  const agentsUsed: string[] = obj.agents_used || obj.agents_executed || [];
  const agentResults = obj.results || obj.agent_results;
  const finalAnswer = obj.final_answer || obj.synthesis || obj.answer || obj.result || obj.response;

  // 3. Helper for rendering badges (Verdict, Risk, etc.)
  const renderBadge = (label: string, value: any) => {
    if (value === undefined || value === null) return null;

    let colorClass = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    const valStr = String(value).toUpperCase();

    if (valStr.includes('VIOLATION') || valStr.includes('HIGH') || valStr.includes('CRITICAL')) {
      colorClass = 'bg-red-500/10 text-red-400 border-red-500/20';
    } else if (valStr.includes('NOT') || valStr.includes('NO_VIOLATION') || valStr.includes('LOW') || valStr.includes('COMPLIANT')) {
      colorClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    } else if (valStr.includes('MEDIUM') || valStr.includes('PARTIAL') || valStr.includes('WARNING')) {
      colorClass = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    }

    return (
      <div key={label} className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${colorClass} mr-2 mb-2 shadow-sm`}>
        <span className="opacity-60 mr-1.5 font-medium uppercase tracking-tighter">{label}:</span> {String(value)}
      </div>
    );
  };

  // 4. Fields to treat as simple text blocks or lists
  const mainTextFields = ['summary', 'explanation', 'verdict_explanation', 'legal_precedence', 'recommendation'];
  const listFields = [
    'obligations', 'deadlines', 'penalties', 'stakeholders', 'key_rules',
    'compliance_requirements', 'violated_clauses', 'compliant_clauses',
    'top_risks', 'mitigation_strategies', 'actions_required'
  ];

  return (
    <div className="space-y-6">
      {/* Badges Bar */}
      {(obj.verdict || obj.risk_level || obj.risk_score !== undefined || obj.confidence !== undefined) && (
        <div className="flex flex-wrap items-center">
          {renderBadge('Verdict', obj.verdict)}
          {renderBadge('Risk', obj.risk_level)}
          {obj.risk_score !== undefined && renderBadge('Risk Score', obj.risk_score)}
          {obj.confidence !== undefined && renderBadge('Confidence', `${Math.round(obj.confidence * 100)}%`)}
        </div>
      )}

      {/* Agents Used (Orchestrator context) */}
      {agentsUsed.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {agentsUsed.map(agent => (
            <span key={agent} className="text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded bg-white/5 border border-white/5 text-gray-500 flex items-center gap-1">
              <Zap className="w-2.5 h-2.5" /> {agent.replace(/_/g, ' ')}
            </span>
          ))}
        </div>
      )}

      {/* Main Narrative Response */}
      {finalAnswer && typeof finalAnswer === 'string' && (
        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 shadow-inner">
          <div className="text-gray-200 leading-relaxed text-[15px] whitespace-pre-wrap">
            {finalAnswer}
          </div>
        </div>
      )}

      {/* Narrative Fields (if distinct from finalAnswer) */}
      {mainTextFields.map(field => {
        const val = obj[field];
        if (typeof val === 'string' && val !== finalAnswer) {
          return (
            <div key={field} className="space-y-2">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 pl-1">{field.replace(/_/g, ' ')}</h4>
              <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap pl-1 border-l-2 border-white/5 font-light">
                {val}
              </div>
            </div>
          );
        }
        return null;
      })}

      {/* List Categorized Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
        {listFields.map(field => {
          const list = obj[field];
          if (Array.isArray(list) && list.length > 0) {
            return (
              <div key={field} className="space-y-3">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 flex items-center gap-2 pl-1">
                  <div className="w-1 h-1 rounded-full bg-blue-500" />
                  {field.replace(/_/g, ' ')}
                </h4>
                <ul className="space-y-2">
                  {list.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 bg-white/[0.02] border border-white/5 p-3 rounded-xl hover:bg-white/5 transition-colors">
                      <div className="mt-1.5 w-1 h-1 rounded-full bg-blue-400/50 shrink-0" />
                      <span className="text-sm text-gray-300 leading-normal font-light">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          }
          return null;
        })}
      </div>

      {/* Agent Breakdown (Orchestrator results) */}
      {agentResults && typeof agentResults === 'object' && (
        <div className="pt-6 border-t border-white/5 space-y-4">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Procedural Logs</h4>
          <div className="space-y-2">
            {Object.entries(agentResults as Record<string, any>).map(([agent, res]) => (
              <details key={agent} className="group rounded-xl border border-white/5 overflow-hidden transition-all">
                <summary className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:bg-white/5 flex items-center justify-between select-none">
                  <span className="flex items-center gap-2">
                    <Zap className="w-3 h-3 text-yellow-500/50" />
                    {agent.replace(/_/g, ' ')}
                  </span>
                  <ChevronDown className="w-3 h-3 transition-transform group-open:rotate-180" />
                </summary>
                <div className="px-4 pb-4">
                  <ResponseRenderer data={res} isDark={isDark} />
                </div>
              </details>
            ))}
          </div>
        </div>
      )}

      {/* Fallback for unknown object keys (not in lists or main text) */}
      {(() => {
        const standardKeys = [...mainTextFields, ...listFields, 'verdict', 'risk_level', 'risk_score', 'overall_risk_score', 'confidence', 'agents_used', 'agents_executed', 'results', 'agent_results', 'final_answer', 'synthesis', 'answer', 'result', 'response', 'session_id', 'source_clauses', 'sources'];
        const otherKeys = Object.keys(obj).filter(k => !standardKeys.includes(k));

        if (otherKeys.length === 0) return null;

        return (
          <div className="pt-6 border-t border-white/5 space-y-4">
            {otherKeys.map(k => {
              const val = obj[k];
              if (val === null || val === undefined || val === '') return null;

              return (
                <div key={k} className="space-y-2">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 pl-1">{k.replace(/_/g, ' ')}</h4>
                  <div className="pl-1 border-l-2 border-white/5">
                    {typeof val === 'object' ? (
                      <ResponseRenderer data={val} isDark={isDark} />
                    ) : (
                      <div className="text-sm text-gray-300 font-light whitespace-pre-wrap">{String(val)}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })()}
    </div>
  );
}
