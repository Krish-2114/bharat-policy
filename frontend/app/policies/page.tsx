"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import PolicyTable from '@/components/policies/PolicyTable';
import { Plus, RefreshCw, AlertCircle, Search } from 'lucide-react';
import { getPolicies } from '@/lib/api';
import { Policy } from '@/types/policy';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function PoliciesPage() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchPolicies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPolicies();
      setPolicies(data);
    } catch (err) {
      setError('Failed to fetch policies from the server. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPolicies();
  }, [fetchPolicies]);

  const handleDeletePolicy = (id: number) => {
    // Optimistic UI update: mock deletion
    setPolicies(prev => prev.filter(p => p.id !== id));
  };

  const filteredPolicies = useMemo(() => {
    return policies.filter(policy =>
      policy.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (policy.description && policy.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [policies, searchQuery]);

  return (
    <div className="flex flex-col gap-8 h-full w-full max-w-7xl mx-auto px-8 py-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-white tracking-tight drop-shadow-sm">
            Policies
          </h1>
          <p className="text-sm text-gray-400 max-w-xl">
            Manage, search, and review national policy documents and frameworks.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={fetchPolicies}
            disabled={loading}
            className="hover:border-white/20 hover:bg-white/5 transition-all"
          >
            <RefreshCw
              className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
          <Link href="/upload">
            <Button variant="primary" className="shadow-lg shadow-blue-500/20">
              <Plus className="h-4 w-4" />
              Add Policy
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex items-center w-full max-w-md bg-[#111827] border border-white/10 rounded-xl px-4 py-2.5 shadow-sm focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:border-blue-500/50 transition-all">
        <Search className="w-5 h-5 text-gray-400 mr-3 shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search policies..."
          className="bg-transparent border-none outline-none text-white text-sm w-full placeholder-gray-500 font-medium"
        />
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {error}
        </div>
      )}

      <PolicyTable policies={filteredPolicies} loading={loading} onDelete={handleDeletePolicy} />
    </div>
  );
}
