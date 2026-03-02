"use client";

import { useState, useEffect } from 'react';
import { queryHistory, QueryHistoryItem } from '@/lib/queryHistory';
import { History, Trash2, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface QueryHistoryProps {
  onSelectQuery: (query: string) => void;
}

export default function QueryHistory({ onSelectQuery }: QueryHistoryProps) {
  const [history, setHistory] = useState<QueryHistoryItem[]>([]);

  useEffect(() => {
    const loadHistory = () => {
      setHistory(queryHistory.getQueryHistory());
    };
    loadHistory();
    window.addEventListener('queryHistoryUpdated', loadHistory);
    return () => window.removeEventListener('queryHistoryUpdated', loadHistory);
  }, []);

  const handleClear = () => {
    queryHistory.clearQueryHistory();
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#111827] border border-white/5 rounded-xl overflow-hidden shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 bg-[#0F172A]">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2 tracking-tight">
          <History className="w-4 h-4 text-blue-400" />
          Query History
        </h3>
        {history.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150"
            title="Clear History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        <AnimatePresence>
          {history.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8 text-gray-500 text-xs flex flex-col items-center gap-2"
            >
              <MessageSquare className="w-6 h-6 opacity-30" />
              <span>No recent queries.</span>
            </motion.div>
          ) : (
            history.map((item) => (
              <motion.button
                key={item.id}
                type="button"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                onClick={() => onSelectQuery(item.query)}
                className="w-full text-left p-3 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/5 transition-all duration-150 group flex flex-col gap-1"
              >
                <div className="text-sm text-gray-300 group-hover:text-white transition-colors line-clamp-2">
                  {item.query}
                </div>
                <div className="text-[10px] text-gray-500 uppercase tracking-wide">
                  {new Date(item.timestamp).toLocaleDateString()} •{' '}
                  {new Date(item.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </motion.button>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
