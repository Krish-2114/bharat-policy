"use client";

import { useState, useEffect } from 'react';
import { getPolicyClauses } from '@/lib/api';
import { Clause } from '@/types/policy';
import { AlertCircle, FileText } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';

interface ClauseViewerProps {
  policyId: number;
}

export default function ClauseViewer({ policyId }: ClauseViewerProps) {
  const [clauses, setClauses] = useState<Clause[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchClauses() {
      try {
        setLoading(true);
        setError(null);
        const data = await getPolicyClauses(policyId);
        setClauses(data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch clauses for this policy.');
      } finally {
        setLoading(false);
      }
    }

    if (policyId) {
      fetchClauses();
    }
  }, [policyId]);

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-white/5 bg-[#0F172A] p-5"
          >
            <Skeleton className="h-5 w-24 mb-3 bg-white/5" />
            <Skeleton className="h-4 w-full mb-2 bg-white/5" />
            <Skeleton className="h-4 w-3/4 bg-white/5" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
        <AlertCircle className="h-5 w-5 shrink-0" />
        {error}
      </div>
    );
  }

  if (clauses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center rounded-xl border border-dashed border-white/10 bg-[#0F172A]/50">
        <FileText className="h-8 w-8 text-gray-500 mb-3" />
        <h3 className="text-sm font-medium text-gray-400">No clauses found</h3>
        <p className="text-gray-500 text-xs mt-1">
          This policy does not have any processed clauses yet.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto pr-2">
      {clauses.map((clause) => (
        <div
          key={clause.id}
          className="rounded-xl border border-white/5 bg-[#0F172A] p-5 transition-colors duration-150 hover:bg-white/5"
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center rounded-lg bg-blue-500/10 px-2 py-1 text-xs font-medium text-blue-400 border border-blue-500/20">
              Clause {clause.clause_number}
            </span>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
            {clause.text}
          </p>
        </div>
      ))}
    </div>
  );
}
