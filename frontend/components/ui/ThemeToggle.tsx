"use client";

import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export default function ThemeToggle({ className = '' }: { className?: string }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`relative w-14 h-7 rounded-full border transition-all duration-300 focus:outline-none
        ${isDark
          ? 'bg-blue-600/20 border-blue-500/30'
          : 'bg-amber-100 border-amber-300'
        } ${className}`}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label="Toggle theme"
    >
      {/* Track */}
      <span
        className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full transition-all duration-300 flex items-center justify-center
          ${isDark
            ? 'translate-x-0 bg-blue-600 shadow-lg shadow-blue-500/30'
            : 'translate-x-7 bg-amber-400 shadow-lg shadow-amber-400/30'
          }`}
      >
        {isDark
          ? <Moon className="w-3.5 h-3.5 text-white" />
          : <Sun className="w-3.5 h-3.5 text-white" />
        }
      </span>
    </button>
  );
}
