"use client";

import { useState } from 'react';
import {
  FileDown, Printer, X, ChevronRight, AlertTriangle,
  CheckCircle2, Clock, BarChart3, Shield, User, BookOpen,
  AlertCircle, TrendingUp, FileText, Info
} from 'lucide-react';

interface ReportData {
  title: string;
  agentName: string;
  policyTitle?: string;
  result: Record<string, unknown> | string | unknown[] | null;
  timestamp?: string;
  query?: string;
}

interface ReportGeneratorProps {
  data: ReportData;
  onClose?: () => void;
  trigger?: React.ReactNode;
}

export function ReportGenerator({ data, onClose, trigger }: ReportGeneratorProps) {
  const [showModal, setShowModal] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const reportContent = buildReportHTML(data);
    const blob = new Blob([reportContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div onClick={() => setShowModal(true)}>
        {trigger || (
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/30 transition-all">
            <FileDown className="w-4 h-4" /> Generate Report
          </button>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative z-10 w-full max-w-3xl max-h-[90vh] flex flex-col bg-[#0c0414] border border-white/10 rounded-2xl shadow-2xl overflow-hidden slide-up">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-gradient-to-r from-emerald-600/10 to-blue-600/10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-white">Policy Intelligence Report</h2>
                  <p className="text-xs text-gray-400">{data.agentName} • {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={handleDownload} className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium bg-blue-600/20 border border-blue-500/30 text-blue-400 hover:bg-blue-600/30 transition-all">
                  <FileDown className="w-3.5 h-3.5" /> Download HTML
                </button>
                <button onClick={handlePrint} className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/30 transition-all no-print">
                  <Printer className="w-3.5 h-3.5" /> Print / PDF
                </button>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Report Preview */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <ReportPreview data={data} />
            </div>

            <div className="px-6 py-3 border-t border-white/5 bg-white/5 shrink-0 text-center text-xs text-gray-500">
              Use <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-gray-300">Ctrl+P</kbd> or the Print button to save as PDF
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ReportPreview({ data }: { data: ReportData }) {
  const result = data.result as Record<string, unknown>;

  // Try to extract structured fields
  const answer = (result?.answer || result?.result || result?.analysis || result?.summary || result?.verdict || result?.amendment || '') as string;
  const confidence = result?.confidence as number | undefined;
  const riskLevel = result?.risk_level as string | undefined;
  const agents = (result?.agents_used || result?.agents_executed || []) as string[];

  return (
    <div className="p-6 space-y-6 print-page">
      {/* Report Header */}
      <div className="rounded-2xl bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-blue-500/20 p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-5 h-5 text-blue-400" />
              <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Bharat Policy Twin — Intelligence Report</span>
            </div>
            <h1 className="text-xl font-bold text-white mb-1">{data.title}</h1>
            {data.policyTitle && <p className="text-sm text-gray-400">Policy: {data.policyTitle}</p>}
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Generated</p>
            <p className="text-sm text-gray-300">{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
            <p className="text-xs text-gray-500 mt-0.5">{new Date().toLocaleTimeString()}</p>
          </div>
        </div>

        {/* Metadata row */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-white/5 rounded-xl p-3">
            <p className="text-xs text-gray-500">Agent</p>
            <p className="text-sm font-medium text-white">{data.agentName}</p>
          </div>
          {confidence !== undefined && (
            <div className="bg-white/5 rounded-xl p-3">
              <p className="text-xs text-gray-500">Confidence</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${confidence >= 0.7 ? 'bg-emerald-500' : confidence >= 0.4 ? 'bg-amber-500' : 'bg-red-500'}`}
                    style={{ width: `${Math.round(confidence * 100)}%` }} />
                </div>
                <span className="text-sm font-bold text-white">{Math.round(confidence * 100)}%</span>
              </div>
            </div>
          )}
          {riskLevel && (
            <div className="bg-white/5 rounded-xl p-3">
              <p className="text-xs text-gray-500">Risk Level</p>
              <RiskBadge level={riskLevel} />
            </div>
          )}
          {!confidence && !riskLevel && (
            <div className="bg-white/5 rounded-xl p-3">
              <p className="text-xs text-gray-500">Status</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium text-emerald-400">Completed</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Query (if present) */}
      {data.query && (
        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5" /> Query / Task
          </p>
          <p className="text-sm text-gray-200 italic">"{data.query}"</p>
        </div>
      )}

      {/* Main Analysis */}
      {answer && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <BarChart3 className="w-3.5 h-3.5 text-blue-400" /> Analysis & Findings
          </p>
          <div className="rounded-xl bg-white/5 border border-white/10 p-5">
            <div className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">
              {answer}
            </div>
          </div>
        </div>
      )}

      {/* Agents used (orchestrator results) */}
      {agents.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5 text-purple-400" /> Agents Executed
          </p>
          <div className="flex flex-wrap gap-2">
            {agents.map(a => (
              <span key={a} className="text-xs px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3" /> {a.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Nested results */}
      {renderStructuredSections(result)}

      {/* Disclaimer */}
      <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4 flex items-start gap-3">
        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-200/80 leading-relaxed">
          <strong className="text-amber-400">Disclaimer:</strong> This report is generated by an AI system and is intended for research and decision-support purposes only. All findings should be verified against official government publications before any legal or policy action.
        </p>
      </div>

      {/* Footer */}
      <div className="border-t border-white/10 pt-4 flex items-center justify-between text-xs text-gray-500">
        <span>🇮🇳 Bharat Policy Twin v3.0 — Elite Tier</span>
        <span>Confidential — Internal Use Only</span>
      </div>
    </div>
  );
}

function renderStructuredSections(result: Record<string, unknown>) {
  const skipKeys = new Set(['answer', 'result', 'analysis', 'summary', 'verdict', 'amendment', 'confidence', 'risk_level', 'agents_used', 'agents_executed', 'session_id', 'error']);

  const entries = Object.entries(result).filter(([k]) => !skipKeys.has(k) && result[k]);

  if (!entries.length) return null;

  return (
    <div className="space-y-4">
      {entries.map(([key, value]) => {
        if (!value) return null;

        const label = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

        if (typeof value === 'string') {
          return (
            <div key={key} className="rounded-xl bg-white/5 border border-white/10 p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{label}</p>
              <p className="text-sm text-gray-200 whitespace-pre-wrap">{value}</p>
            </div>
          );
        }

        if (Array.isArray(value)) {
          return (
            <div key={key} className="rounded-xl bg-white/5 border border-white/10 p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{label}</p>
              <ul className="space-y-1.5">
                {(value as unknown[]).slice(0, 10).map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                    <ChevronRight className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                    {typeof item === 'string' ? item : JSON.stringify(item)}
                  </li>
                ))}
              </ul>
            </div>
          );
        }

        if (typeof value === 'object') {
          return (
            <div key={key} className="rounded-xl bg-white/5 border border-white/10 p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{label}</p>
              <pre className="text-xs text-gray-300 overflow-auto">{JSON.stringify(value, null, 2)}</pre>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

function RiskBadge({ level }: { level: string }) {
  const l = level.toLowerCase();
  if (l === 'high' || l === 'critical') return <span className="text-sm font-bold text-red-400">🔴 {level}</span>;
  if (l === 'medium') return <span className="text-sm font-bold text-amber-400">🟡 {level}</span>;
  return <span className="text-sm font-bold text-emerald-400">🟢 {level}</span>;
}

function buildReportHTML(data: ReportData): string {
  const result = data.result as Record<string, unknown>;
  const answer = (result?.answer || result?.result || result?.analysis || result?.summary || '') as string;
  const confidence = result?.confidence as number | undefined;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${data.title} — Bharat Policy Twin Report</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', sans-serif; background: #f8fafc; color: #1e293b; padding: 40px; max-width: 900px; margin: 0 auto; }
  .header { background: linear-gradient(135deg, #1e3a5f, #1e1b4b); color: white; padding: 32px; border-radius: 16px; margin-bottom: 24px; }
  .header h1 { font-size: 22px; font-weight: 700; margin-bottom: 6px; }
  .header p { opacity: 0.7; font-size: 14px; }
  .badge { display: inline-block; padding: 4px 12px; border-radius: 100px; font-size: 12px; font-weight: 600; background: rgba(255,255,255,0.2); }
  .section { background: white; border-radius: 12px; padding: 24px; margin-bottom: 16px; border: 1px solid #e2e8f0; }
  .section h2 { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #64748b; margin-bottom: 12px; }
  .content { font-size: 14px; line-height: 1.8; color: #334155; white-space: pre-wrap; }
  .meta-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 16px; }
  .meta-item { background: rgba(255,255,255,0.1); padding: 12px; border-radius: 8px; }
  .meta-item p:first-child { font-size: 11px; opacity: 0.6; }
  .meta-item p:last-child { font-size: 15px; font-weight: 600; margin-top: 2px; }
  .disclaimer { background: #fffbeb; border: 1px solid #fbbf24; border-radius: 12px; padding: 16px 20px; margin-top: 16px; font-size: 12px; color: #92400e; }
  .footer { text-align: center; padding: 20px 0 0; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; margin-top: 24px; }
  @media print { body { padding: 20px; } }
</style>
</head>
<body>
<div class="header">
  <span class="badge">🇮🇳 Bharat Policy Twin — Elite v3.0</span>
  <h1 style="margin-top:12px">${data.title}</h1>
  <p>${data.agentName} • Generated ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} at ${new Date().toLocaleTimeString()}</p>
  <div class="meta-grid">
    <div class="meta-item"><p>Agent</p><p>${data.agentName}</p></div>
    ${confidence !== undefined ? `<div class="meta-item"><p>Confidence</p><p>${Math.round(confidence * 100)}%</p></div>` : ''}
    ${data.policyTitle ? `<div class="meta-item"><p>Policy</p><p>${data.policyTitle}</p></div>` : ''}
  </div>
</div>

${data.query ? `<div class="section"><h2>Query / Task</h2><p class="content" style="font-style:italic">"${data.query}"</p></div>` : ''}

${answer ? `<div class="section"><h2>Analysis &amp; Findings</h2><p class="content">${answer}</p></div>` : ''}

<div class="disclaimer">
  <strong>⚠️ Disclaimer:</strong> This report is generated by an AI system for research and decision-support purposes only. All findings must be verified against official government publications before any legal or policy action.
</div>

<div class="footer">
  <p>🇮🇳 Bharat Policy Twin — Confidential, Internal Use Only</p>
</div>
</body>
</html>`;
}

// Convenience wrapper for use on agent/orchestrator pages
export function ReportButton({ result, agentName, title, query }: {
  result: Record<string, unknown> | string | unknown[] | null;
  agentName: string;
  title: string;
  query?: string;
}) {
  return (
    <ReportGenerator
      data={{ title, agentName, result, query }}
      trigger={
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-all">
          <FileDown className="w-3.5 h-3.5" /> Export Report
        </button>
      }
    />
  );
}
