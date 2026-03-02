"use client";

import { Search, Bell, User, Server, Menu, LogOut, Settings, Sliders } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { checkHealth } from '@/lib/api';

export default function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const [isOnline, setIsOnline] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const { logout, user } = useAuth();
  // Theme handled by ThemeToggle component

  useEffect(() => {
    let mounted = true;
    const ping = async () => {
      const status = await checkHealth();
      if (mounted) setIsOnline(status);
    };
    ping();
    const interval = setInterval(ping, 30000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // Click outside to close profile dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="flex h-16 items-center justify-between border-b border-white/5 px-6" style={{ backgroundColor: "var(--bg-topbar)" }}>
      <div className="flex flex-1 items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-150"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="relative w-full max-w-md hidden sm:block">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-gray-500" aria-hidden="true" />
          </div>
          <input
            type="search"
            name="search"
            id="search"
            placeholder="Search policies..."
            className="
              block w-full rounded-lg border border-white/5 bg-[#111827]
              py-2 pl-10 pr-4 text-sm text-white placeholder:text-gray-500
              focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50
              transition-all duration-150
            "
          />
        </div>
      </div>

      <div className="flex items-center gap-3 relative">
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#111827] border border-white/5 cursor-help transition-all duration-150 hover:border-white/10"
          title={isOnline ? 'Backend Online' : 'Backend Offline'}
        >
          <div
            className={`h-2 w-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-red-500'
              }`}
          />
          <Server className="h-4 w-4 text-gray-500" />
        </div>
        <button
          type="button"
          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-150 border border-transparent hover:border-white/5"
        >
          <span className="sr-only">View notifications</span>
          <Bell className="h-5 w-5" aria-hidden="true" />
        </button>
        <ThemeToggle />

        <div className="flex items-center pl-2 border-l border-white/5 relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="relative p-1 rounded-full outline-none focus:ring-2 focus:ring-blue-500/50 hover:bg-white/5 transition-all"
            aria-expanded={isProfileOpen}
            aria-haspopup="true"
          >
            <div className="h-9 w-9 rounded-full bg-[#111827] border border-white/5 flex items-center justify-center">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <div
              className={`absolute bottom-1 right-1 h-2.5 w-2.5 rounded-full border-2 border-[#0B0F17] ${isOnline ? 'bg-emerald-500' : 'bg-red-500'
                }`}
            />
          </button>

          {/* Dropdown Menu */}
          {isProfileOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 origin-top-right rounded-xl bg-[#111827] border border-white/10 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-white/5">
                <p className="text-sm font-medium text-white truncate">{user?.username || 'user@example.com'}</p>
                <p className="text-xs text-gray-500 truncate mt-0.5">Administrator</p>
              </div>
              <div className="py-1">
                <button
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                  onClick={() => setIsProfileOpen(false)}
                >
                  <Settings className="mr-3 h-4 w-4 text-gray-400" aria-hidden="true" />
                  Account Settings
                </button>
                <button
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                  onClick={() => setIsProfileOpen(false)}
                >
                  <Sliders className="mr-3 h-4 w-4 text-gray-400" aria-hidden="true" />
                  System Preferences
                </button>
              </div>
              <div className="border-t border-white/5 py-1">
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    logout();
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="mr-3 h-4 w-4" aria-hidden="true" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
