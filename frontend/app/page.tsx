"use client";

import { Component as DocumentScanner } from "@/components/ui/document-scanner";
import { Activity } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { FeaturesSection } from "@/components/ui/features-section";
import { FooterSection } from "@/components/ui/footer-section";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen w-full relative overflow-x-hidden bg-[#0B0F17]">
      {/* Top Navbar */}
      <nav className="absolute top-0 left-0 w-full flex justify-between items-center py-6 px-6 md:px-12 lg:px-24 z-50">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20">
            <Activity className="h-5 w-5 text-blue-400" />
          </div>
          <span className="font-bold text-lg tracking-tight text-white">Bharat Policy</span>
        </div>
        <div className="flex items-center gap-4 ml-auto">
          <Link href="/login">
            <Button variant="ghost">Log In</Button>
          </Link>
          <Link href="/signup">
            <Button variant="primary">Sign Up</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="flex-1 flex flex-col md:flex-row items-center justify-between w-full pt-32 pb-12 px-6 md:px-12 lg:px-24 relative">
        {/* Ambient glow */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-blue-500/10 blur-[100px] pointer-events-none" />
        <div className="absolute top-1/4 right-0 w-[600px] h-[600px] rounded-full bg-cyan-500/10 blur-[100px] pointer-events-none" />

        {/* Left content */}
        <div className="flex-1 flex flex-col justify-center relative z-10 max-w-3xl pt-10 pb-20 md:py-0">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-400 mb-8 w-fit backdrop-blur-sm">
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
            AI-Powered Intelligence
          </div>

          <div className="flex items-center gap-4 mb-6">
            <Activity className="w-10 h-10 text-blue-400" />
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
              Bharat Policy
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                Intelligence Twin
              </span>
            </h1>
          </div>

          <p className="text-lg md:text-xl text-gray-400 leading-relaxed mb-12 max-w-2xl">
            Navigate and analyze national policies with unprecedented depth, semantic search, and structural comprehension powered by advanced AI and Retrieval Augmented Generation.
          </p>

          <div className="flex items-center gap-8 md:gap-12">
            <div>
              <p className="text-3xl md:text-4xl font-bold text-white">10,000+</p>
              <p className="text-sm md:text-base text-gray-500 mt-1">Policies Indexed</p>
            </div>
            <div className="w-px h-12 bg-white/10" />
            <div>
              <p className="text-3xl md:text-4xl font-bold text-white">Context-Aware</p>
              <p className="text-sm md:text-base text-gray-500 mt-1">Semantic Search</p>
            </div>
            <div className="w-px h-12 bg-white/10" />
            <div>
              <p className="text-3xl md:text-4xl font-bold text-white">Clause-Level</p>
              <p className="text-sm md:text-base text-gray-500 mt-1">Resolution</p>
            </div>
          </div>
        </div>

        {/* Right — Document Scanner */}
        <div className="flex-1 flex items-center justify-end w-full relative z-10 min-h-[500px] md:min-h-[700px] md:-mt-16 lg:-mt-24">
          <DocumentScanner className="w-full h-full max-w-[800px] max-h-[800px] object-contain opacity-90" />
        </div>
      </div>

      {/* Features Card Stack Section */}
      <FeaturesSection />

      {/* Footer Section */}
      <FooterSection />
    </div>
  );
}
