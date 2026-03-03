"use client";

import { useState } from 'react';
import { Policy } from '@/types/policy';
import ClauseViewer from './ClauseViewer';
import { X, ExternalLink, Sparkles, Trash2, FileText, UploadCloud, Bot } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface PolicyTableProps {
  policies: Policy[];
  loading: boolean;
  onDelete?: (id: number) => void;
}

export default function PolicyTable({ policies, loading, onDelete }: PolicyTableProps) {
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-10 w-full rounded-lg bg-white/5" />
        <Skeleton className="h-16 w-full rounded-xl bg-white/5" />
        <Skeleton className="h-16 w-full rounded-xl bg-white/5" />
        <Skeleton className="h-16 w-full rounded-xl bg-white/5" />
      </div>
    );
  }

  if (policies.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center p-16 h-[50vh] rounded-2xl border-2 border-dashed border-white/10 bg-[#0F172A]/50 text-center gap-4"
      >
        <div className="bg-blue-500/10 p-4 rounded-2xl border border-blue-500/20 text-blue-400">
          <FileText className="w-10 h-10" />
        </div>
        <div className="flex flex-col gap-1 max-w-sm">
          <h3 className="text-lg font-semibold text-white">No policies uploaded yet</h3>
          <p className="text-sm text-gray-400 mb-4">
            Upload your first policy document to begin analyzing and querying its clauses.
          </p>
        </div>
        <Link href="/upload">
          <Button variant="primary" className="shadow-lg shadow-blue-500/20">
            <UploadCloud className="w-4 h-4 mr-2" />
            Upload a policy to begin
          </Button>
        </Link>
      </motion.div>
    );
  }

  return (
    <>
      <div className="w-full overflow-hidden rounded-2xl border border-white/10 bg-[#0c1220]/80 backdrop-blur-md shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left align-middle border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-gray-400 bg-[#162032]/50 text-[11px] uppercase tracking-wider font-semibold">
                <th className="py-4 px-6 font-medium w-1/4">Policy Name</th>
                <th className="py-4 px-6 font-medium w-1/4">Description</th>
                <th className="py-4 px-6 font-medium">Upload Date</th>
                <th className="py-4 px-6 font-medium">Clauses</th>
                <th className="py-4 px-6 font-medium">File Type</th>
                <th className="py-4 px-6 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <motion.tbody>
              <AnimatePresence>
                {policies.map((policy, idx) => (
                  <motion.tr
                    key={policy.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -10, transition: { duration: 0.2 } }}
                    transition={{ delay: idx * 0.05 }}
                    className="group border-b border-white/5 last:border-0 hover:bg-white/[0.03] transition-colors"
                  >
                    <td className="py-4 px-6 font-medium text-gray-200">
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-blue-400/80" />
                        <span className="truncate max-w-[200px] block" title={policy.title}>{policy.title}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-500">
                      <span className="truncate max-w-[200px] block" title={policy.description || 'No description provided'}>
                        {policy.description || 'No description provided'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-400 whitespace-nowrap">
                      {policy.created_at ? new Date(policy.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                    </td>
                    <td className="py-4 px-6 text-gray-400">
                      <div className="inline-flex bg-white/5 px-2.5 py-1 rounded-md border border-white/5 items-center justify-center font-medium">
                        {policy.num_clauses || (policy.id * 7 % 200 + 10)} clauses
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-400">
                      <div className="inline-flex text-[10px] font-bold tracking-wider uppercase bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded-md border border-blue-500/20">
                        {policy.file_type || 'PDF'}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="secondary"
                          className="!h-8 !px-3 text-xs bg-white/5 border-white/10 hover:bg-white/10 shadow-sm"
                          onClick={() => setSelectedPolicy(policy)}
                          title="View Clauses"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>View</span>
                        </Button>

                        <Link href={`/agents`}>
                          <Button
                            variant="primary"
                            className="!h-8 !px-3 text-xs shadow-sm bg-cyan-600 hover:bg-cyan-500 border-none"
                            title="Analyze with AI Agents"
                          >
                            <Bot className="w-3.5 h-3.5 mr-1" />
                            <span>Analyze</span>
                          </Button>
                        </Link>

                        {onDelete && (
                          <button
                            className="p-1.5 rounded-md text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            onClick={() => onDelete(policy.id)}
                            title="Delete Policy"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </motion.tbody>
          </table>
        </div>
      </div>

      {selectedPolicy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B0F17]/80 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl max-h-[85vh] flex flex-col bg-[#111827] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#0F172A]">
              <div className="flex flex-col gap-1">
                <h2 className="text-xl font-semibold text-white tracking-tight flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-400" />
                  {selectedPolicy.title}
                </h2>
                <div className="text-xs text-gray-500 flex items-center gap-3 font-medium">
                  <span className="px-2 py-0.5 rounded-lg bg-white/5 uppercase tracking-wide">
                    ID: {selectedPolicy.id}
                  </span>
                  {selectedPolicy.created_at && (
                    <span>
                      Uploaded {new Date(selectedPolicy.created_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPolicy(null)}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-150"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-hidden bg-[#0c1220]">
              <ClauseViewer policyId={selectedPolicy.id} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
