"use client";

import UploadBox from '@/components/upload/UploadBox';
import UploadHistory from '@/components/upload/UploadHistory';
import { Database, Zap, ShieldCheck } from 'lucide-react';

export default function UploadPage() {
  return (
    <div className="flex flex-col h-full w-full relative overflow-hidden">
      <div className="relative z-10 w-full max-w-7xl mx-auto h-full flex flex-col pt-4 px-8 pb-6">

        {/* Header */}
        <div className="flex flex-col gap-2 mb-8 items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Zap className="w-4 h-4" />
            Core Ingestion Engine
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white drop-shadow-md">
            Knowledge Base Uploads
          </h1>
          <p className="text-sm md:text-base text-gray-400 max-w-xl font-light">
            Securely upload PDFs, DOCs, and text files. All ingested documents are immediately vectorized and available globally for intelligent semantic querying.
          </p>
        </div>

        {/* 2-Column Grid */}
        <div className="flex flex-col lg:flex-row gap-8 flex-1 min-h-0">

          {/* Left: Dropzone */}
          <div className="flex-1 flex flex-col h-full gap-4 relative">
            <div className="absolute -inset-0.5 bg-gradient-to-br from-blue-500/20 to-cyan-500/0 rounded-2xl blur-lg pointer-events-none opacity-50" />
            <div className="relative bg-[#0c0414]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl h-full flex flex-col justify-center items-center overflow-hidden">
              <UploadBox />

              <div className="mt-8 flex gap-6 text-gray-500 text-xs font-medium">
                <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-400" /> End-to-end Encrypted</span>
                <span className="flex items-center gap-1.5"><Database className="w-4 h-4 text-blue-400" /> Auto-Vectorized</span>
              </div>
            </div>
          </div>

          {/* Right: History Panel */}
          <div className="w-full lg:w-[450px] flex flex-col h-[500px] lg:h-full relative shrink-0">
            <UploadHistory />
          </div>

        </div>
      </div>
    </div>
  );
}
