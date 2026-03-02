"use client";

import { useState, useEffect } from "react";
import { uploadHistoryManager, UploadRecord } from "@/lib/uploadHistory";
import { CopyPlus, Clock, Trash2, CheckCircle2, FileText, Database } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function UploadHistory() {
  const [history, setHistory] = useState<UploadRecord[]>([]);

  useEffect(() => {
    const loadHistory = () => {
      setHistory(uploadHistoryManager.getUploads());
    };
    loadHistory();
    window.addEventListener("uploadHistoryUpdated", loadHistory);
    return () => window.removeEventListener("uploadHistoryUpdated", loadHistory);
  }, []);

  const handleDelete = (id: string) => {
    uploadHistoryManager.deleteUpload(id);
  };

  const clearHistory = () => {
    uploadHistoryManager.clearHistory();
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#111827]/80 backdrop-blur-lg border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
      <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-[#0F172A]/50 backdrop-blur-md">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2 tracking-tight">
          <Database className="w-5 h-5 text-emerald-400" />
          Recent Ingestions
        </h3>
        {history.length > 0 && (
          <button
            onClick={clearHistory}
            className="text-xs text-gray-500 hover:text-red-400 transition-colors px-2 py-1 rounded hover:bg-red-500/10"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        <AnimatePresence>
          {history.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center p-12 text-gray-500 gap-3"
            >
              <CopyPlus className="w-10 h-10 opacity-20" />
              <p className="text-sm font-medium">No previous uploads</p>
            </motion.div>
          ) : (
            history.map((record) => (
              <motion.div
                key={record.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col bg-[#0B0F17]/50 border border-white/5 rounded-xl p-4 gap-3 relative group hover:border-white/10 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex gap-3">
                    <div className="bg-blue-500/10 p-2.5 rounded-lg border border-blue-500/20 shadow-inner h-fit">
                      <FileText className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-200 text-sm">{record.title}</span>
                      <span className="text-xs text-gray-500 font-medium">{record.filename}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(record.id)}
                    className="p-1.5 rounded-md text-gray-600 hover:text-red-400 hover:bg-red-400/10 transition-colors opacity-0 group-hover:opacity-100"
                    title="Remove from history"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px] font-medium text-gray-500 uppercase tracking-wider pl-12">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(record.timestamp).toLocaleDateString()} {new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span>•</span>
                    <span>{record.size} MB</span>
                  </div>

                  {record.status === "completed" && (
                    <div className="flex items-center gap-1.5 text-emerald-400/80 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Ingested</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
