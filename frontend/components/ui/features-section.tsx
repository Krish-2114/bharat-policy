"use client";

import { CardStack, CardStackItem } from "@/components/ui/card-stack";

const items: CardStackItem[] = [
  {
    id: 1,
    title: "AI-Powered Policy Intelligence",
    subtitle: "Understand national policies with precision, clarity, and speed.",
    description: "Bharat Policy Twin transforms complex government policy documents into an intelligent, searchable knowledge system. Using advanced AI agents, semantic retrieval, and vector intelligence, it enables instant policy understanding at clause-level granularity.",
    imageSrc: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: 2,
    title: "Automated Policy Knowledge Creation",
    subtitle: "Convert static policy documents into living intelligence.",
    description: "Upload policy documents in PDF, DOCX, or text formats. Bharat Policy Twin automatically parses, structures, and converts them into semantic embeddings stored in a vector database, making every clause searchable and analyzable by AI.",
    imageSrc: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: 3,
    title: "Deep Policy Insights & Analysis",
    subtitle: "Extract intelligence using advanced AI agents.",
    description: "Instead of manually reading hundreds of pages, utilize specialized AI agents to analyze policies for gaps, risks, and compliance. Get human-readable summaries and deep structural insights with exact clause citations for full transparency.",
    imageSrc: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: 4,
    title: "Traceable and Explainable AI",
    subtitle: "Every answer is grounded in real policy clauses.",
    description: "Bharat Policy Twin uses Retrieval Augmented Generation (RAG) to ensure AI responses are backed by real policy text. Users can view exact clauses, sources, and supporting context, ensuring trust, auditability, and transparency.",
    imageSrc: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: 5,
    title: "Agentic Intelligence for Policy Analysis",
    subtitle: "From static documents to intelligent decision support.",
    description: "Bharat Policy Twin acts as an intelligent agent that assists policymakers, researchers, analysts, and institutions by enabling faster policy interpretation, compliance analysis, and decision-making using advanced AI workflows.",
    imageSrc: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop",
  },
];

import { useState, useEffect } from "react";

export function FeaturesSection() {
  const [screenWidth, setScreenWidth] = useState(600); // Desktop fallback

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    handleResize(); // Set immediately on client mount
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const cardWidth = screenWidth < 640 ? 320 : 600;
  const cardHeight = screenWidth < 640 ? 480 : 400;

  return (
    <section className="w-full py-12 relative z-10 border-t border-slate-800/50 bg-slate-900/20 backdrop-blur-sm">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="mb-8 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/50 px-4 py-1.5 text-xs font-semibold text-cyan-400 mb-6 uppercase tracking-wider backdrop-blur-sm shadow-sm">
            Platform Capabilities
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            Core <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Infrastructure</span>
          </h2>
          <p className="text-slate-400 text-lg md:text-xl leading-relaxed font-light">
            Explore how Bharat Policy Twin redefines policy intelligence through cutting-edge generative AI, semantic search, and autonomous workflows.
          </p>
        </div>

        <div className="w-full mx-auto flex justify-center">
          {/* Constrain width to ensure the card stack stays perfectly centered on desktop and responsive on mobile */}
          <div className="w-full max-w-3xl lg:max-w-4xl">
            <CardStack
              items={items}
              initialIndex={0}
              autoAdvance={true}
              intervalMs={4000}
              pauseOnHover={true}
              showDots={true}
              cardWidth={cardWidth}
              cardHeight={cardHeight}
              overlap={0.75}
              spreadDeg={15}
              inactiveScale={0.85}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
