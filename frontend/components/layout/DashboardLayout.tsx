"use client";

import { useEffect, useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isDark } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  const isLoginPage = pathname === '/login';
  const isSignupPage = pathname === '/signup';
  const isHomePage = pathname === '/';
  const isPublicPage = isLoginPage || isHomePage || isSignupPage;

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated && !isPublicPage) {
        router.push('/login');
      }
    }
  }, [isAuthenticated, isLoading, isPublicPage, router]);

  if (
    isLoading ||
    (!isAuthenticated && !isPublicPage)
  ) {
    return (
      <div className="flex h-screen w-full items-center justify-center" style={{ backgroundColor: "var(--bg-base)" }}>
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (isPublicPage) {
    return (
      <div className="relative min-h-screen flex flex-col" style={{ backgroundColor: "var(--bg-base)" }}>
        <div className="pointer-events-none fixed inset-0 bg-gradient-to-br from-blue-950/5 via-transparent to-blue-950/5 z-0" />
        <main className="relative z-10 flex-1 flex flex-col w-full">
          {children}
        </main>
      </div>
    );
  }

  const isQueryPage = pathname === '/query';

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "var(--bg-base)" }}>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="flex flex-1 flex-col overflow-hidden w-full">
        <Topbar onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto relative">
          {/* Global Background Orbs */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-[0]">
            <div className="flex gap-[10rem] rotate-[10deg] absolute top-[-10rem] right-[-20rem] blur-[4rem] skew-[-20deg] opacity-20">
              <div className="w-[15rem] h-[30rem] bg-gradient-to-r from-blue-500 to-cyan-300"></div>
              <div className="w-[15rem] h-[30rem] bg-gradient-to-r from-blue-500 to-cyan-300"></div>
            </div>
            <div className="flex gap-[6rem] rotate-[-15deg] absolute bottom-[-10rem] left-[-20rem] blur-[5rem] skew-[20deg] opacity-20">
              <div className="w-[20rem] h-[20rem] bg-gradient-to-r from-emerald-500 to-teal-400"></div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-950/5 via-transparent to-[#0B0F17]/80 backdrop-blur-[50px]" />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="relative z-10 h-full w-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
