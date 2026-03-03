"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  UploadCloud,
  Shield,
  X,
  Sidebar as SidebarIcon,
  Bot,
  GitBranch,
  BarChart3,
  FlaskConical,
  Sparkles
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTheme } from '@/context/ThemeContext';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Policies', href: '/policies', icon: FileText },
  { name: 'Upload', href: '/upload', icon: UploadCloud },
  { name: 'Agents', href: '/agents', icon: Bot },
  { name: 'Orchestrator', href: '/orchestrator', icon: GitBranch },
  { name: 'Observability', href: '/observability', icon: BarChart3 },
  { name: 'Evaluation', href: '/evaluation', icon: FlaskConical },
  { name: 'Task Center', href: '/tasks', icon: Sparkles },
];

export default function Sidebar({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
}) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { isDark } = useTheme();

  // Drag to resize state
  const [sidebarWidth, setSidebarWidth] = useState(256);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const newWidth = Math.max(200, Math.min(600, e.clientX));
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };
  }, [isDragging]);

  const handleDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    if (isCollapsed) setIsCollapsed(false);
  };

  useEffect(() => {
    setIsOpen(false);
  }, [pathname, setIsOpen]);

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-[#0B0F17]/80 backdrop-blur-sm transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      />
      <div
        className={`
          relative z-50 flex h-full flex-col shrink-0
          border-r theme-sidebar
          transform ease-in-out
          fixed lg:static inset-y-0 left-0
          ${isDragging ? '' : 'transition-all duration-300'}
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{ width: isCollapsed ? '80px' : `${sidebarWidth}px` }}
      >
        {/* Resize Handle */}
        {!isCollapsed && (
          <div
            onMouseDown={handleDragStart}
            className="absolute top-0 right-0 bottom-0 w-1.5 cursor-col-resize hover:bg-blue-500/50 active:bg-blue-500 transition-colors z-[100]"
          />
        )}
        {/* Logo area */}
        <div className={`flex h-16 shrink-0 items-center border-b border-white/5 transition-all px-4 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20">
              <Shield className="h-6 w-6 text-blue-400" />
            </div>
            {!isCollapsed && (
              <span className="font-semibold text-white text-base tracking-tight transition-opacity duration-300">
                Bharat Policy Twin
              </span>
            )}
          </div>
          <button
            className="lg:hidden p-2 shrink-0 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-150"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Global Navigation */}
        <div className="flex flex-col py-6 px-3 gap-1">
          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center rounded-lg py-2.5 transition-all duration-150
                    ${isCollapsed ? 'justify-center px-0 w-12 mx-auto' : 'px-3 gap-3'}
                    ${isActive
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      : 'text-gray-400 border border-transparent hover:text-white hover:bg-white/5'
                    }
                  `}
                  title={isCollapsed ? item.name : undefined}
                >
                  <item.icon
                    className={`h-5 w-5 shrink-0 ${isActive ? 'text-blue-400' : 'text-gray-500'}`}
                    aria-hidden="true"
                  />
                  {!isCollapsed && <span className="text-sm font-medium">{item.name}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Toggle */}
        <div className={`mt-auto p-4 shrink-0 flex border-t border-white/5 ${isCollapsed ? 'justify-center' : 'justify-end'}`}>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-150 flex items-center gap-2 group outline-none"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            <SidebarIcon className="w-5 h-5 group-hover:text-blue-400 transition-colors" />
          </button>
        </div>
      </div>
    </>
  );
}
