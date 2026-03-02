"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Wand2, Database, BrainCircuit, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExtractedCard {
  id: string;
  title: string;
  type: string;
  delay: number;
  icon: React.ElementType;
  position: { top: string; right: string };
}

const EXTRACTED_CARDS: ExtractedCard[] = [
  {
    id: "card-1",
    title: "Clause 4.2: Data Sovereignty",
    type: "Regulation",
    delay: 2.5,
    icon: Database,
    position: { top: "10%", right: "-10%" },
  },
  {
    id: "card-2",
    title: "Compliance Mandate",
    type: "Requirement",
    delay: 5.5,
    icon: CheckCircle2,
    position: { top: "45%", right: "-25%" },
  },
  {
    id: "card-3",
    title: "Semantic Embedding",
    type: "Vector Action",
    delay: 8.5,
    icon: BrainCircuit,
    position: { top: "80%", right: "-5%" },
  },
];

export function Component({ className }: { className?: string }) {
  const [activeCards, setActiveCards] = useState<string[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Control card popping based on scanner cycle
  useEffect(() => {
    const intervals: NodeJS.Timeout[] = [];
    const cycleDuration = 12000; // 12 seconds per full loop

    const scheduleCards = () => {
      EXTRACTED_CARDS.forEach((card) => {
        intervals.push(
          setTimeout(() => {
            setActiveCards((prev) => [...new Set([...prev, card.id])]);

            // Hide the card after a bit so it can repeat seamlessly
            intervals.push(
              setTimeout(() => {
                setActiveCards((prev) => prev.filter((id) => id !== card.id));
              }, 4000)
            );
          }, card.delay * 1000)
        );
      });
    };

    scheduleCards();
    const mainLoop = setInterval(scheduleCards, cycleDuration);

    return () => {
      clearInterval(mainLoop);
      intervals.forEach(clearTimeout);
    };
  }, []);

  if (!isClient) return <div className={cn("relative", className)} />;

  return (
    <div className={cn("relative flex items-center justify-center w-full h-full min-h-[500px] perspective-1000", className)}>

      {/* Container holding the 3D-ish document */}
      <motion.div
        className="relative w-[320px] sm:w-[380px] h-[480px] rounded-xl border border-slate-700/50 bg-slate-900/60 backdrop-blur-md shadow-2xl p-6 overflow-hidden flex flex-col gap-4 z-10"
        initial={{ rotateY: 15, rotateX: 5 }}
        animate={{ rotateY: [15, 5, 15], rotateX: [5, 10, 5] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Document Header */}
        <div className="flex items-center gap-3 border-b border-slate-700/50 pb-4 mb-2">
          <div className="p-2 rounded-lg bg-blue-500/20">
            <FileText className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="h-4 w-32 bg-slate-700/50 rounded-md mb-2" />
            <div className="h-2 w-20 bg-slate-800 rounded-md" />
          </div>
        </div>

        {/* Skeleton Document Lines */}
        <div className="flex-1 flex flex-col gap-3 relative z-0">
          {[...Array(9)].map((_, i) => (
            <div key={`skel-line-${i}`} className="flex flex-col gap-2">
              <div className="h-2 w-full bg-slate-800/80 rounded" />
              <div className={`h-2 bg-slate-800/80 rounded ${i % 2 === 0 ? 'w-5/6' : 'w-3/4'}`} />
            </div>
          ))}

          {/* Glowing Scanner Line */}
          <motion.div
            className="absolute left-[-20%] right-[-20%] h-[2px] bg-cyan-400 shadow-[0_0_20px_4px_rgba(34,211,238,0.5)] z-20"
            animate={{ top: ["0%", "100%", "0%"] }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "linear",
            }}
          />

          {/* Faint scanner trail beam */}
          <motion.div
            className="absolute left-0 right-0 h-16 bg-gradient-to-b from-cyan-400/0 via-cyan-400/5 to-cyan-400/20 pointer-events-none z-10"
            animate={{ top: ["-16px", "calc(100% - 16px)", "-16px"] }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </div>

        {/* Highlight triggers within the document mapping to the cards */}
        <AnimatePresence>
          {activeCards.includes("card-1") && (
            <motion.div
              key="highlight-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute top-[20%] left-6 right-6 h-10 bg-blue-500/20 border border-blue-400/30 rounded-md z-0"
            />
          )}
          {activeCards.includes("card-2") && (
            <motion.div
              key="highlight-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute top-[52%] left-6 right-6 h-10 bg-emerald-500/20 border border-emerald-400/30 rounded-md z-0"
            />
          )}
          {activeCards.includes("card-3") && (
            <motion.div
              key="highlight-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute top-[82%] left-6 right-6 h-10 bg-purple-500/20 border border-purple-400/30 rounded-md z-0"
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* Extracted Floating Data Cards */}
      <AnimatePresence>
        {EXTRACTED_CARDS.map(
          (card) =>
            activeCards.includes(card.id) && (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, x: -40, scale: 0.9, filter: "blur(4px)" }}
                animate={{ opacity: 1, x: 0, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, x: 20, scale: 0.95, filter: "blur(4px)" }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="absolute z-20 w-[240px] p-4 rounded-xl border border-slate-600 bg-slate-800/90 shadow-2xl backdrop-blur-xl flex items-center gap-4"
                style={card.position as React.CSSProperties}
              >
                <div className="p-2 rounded-lg bg-slate-700/50">
                  <card.icon className="w-5 h-5 text-slate-300" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-cyan-400 mb-0.5 tracking-wider uppercase">
                    {card.type}
                  </p>
                  <p className="text-sm text-slate-200 font-medium">
                    {card.title}
                  </p>
                </div>

                {/* Connection Line connecting back to document visually */}
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 60, opacity: 0.3 }}
                  exit={{ opacity: 0 }}
                  className="absolute right-full top-1/2 -translate-y-1/2 h-px bg-cyan-400"
                />
              </motion.div>
            )
        )}
      </AnimatePresence>

      {/* Extraction Process Visualization */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <Wand2 className="w-32 h-32 text-blue-500/5 blur-xl" />
      </div>

    </div>
  );
}
