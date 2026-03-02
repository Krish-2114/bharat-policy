"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function AuthBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute inset-0 bg-[#0a0f18]" />

      {/* Abstract Glowing Orbs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-1/4 -left-32 w-96 h-96 bg-cyan-700/20 rounded-full blur-[100px]"
      />

      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
        className="absolute bottom-1/4 -right-32 w-96 h-96 bg-emerald-700/20 rounded-full blur-[100px]"
      />

      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Grid fade out edges */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f18] via-transparent to-[#0a0f18]" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0f18] via-transparent to-[#0a0f18]" />
    </div>
  );
}
