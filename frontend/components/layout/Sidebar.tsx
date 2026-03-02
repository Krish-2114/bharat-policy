"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  UploadCloud,
  Shield,
  X,
  Sidebar as SidebarIcon,
  Plus,
  MessageSquare as ChatIcon,
  Trash2,
  Edit2,
  Bot,
  GitBranch,
  BarChart3,
  FlaskConical,
  Sparkles
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { chatHistoryManager, ChatSession } from '@/lib/chatHistory';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Policies', href: '/policies', icon: FileText },
  { name: 'Query', href: '/query', icon: MessageSquare },
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
  const isQueryPage = pathname === '/query';
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

  // Chat History State
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  useEffect(() => {
    setIsOpen(false);
  }, [pathname, setIsOpen]);

  // Load chat history if on query page
  useEffect(() => {
    if (!isQueryPage) return;
    const loadSessions = () => setSessions(chatHistoryManager.getSessions());
    loadSessions();
    window.addEventListener('chatHistoryUpdated', loadSessions);
    return () => window.removeEventListener('chatHistoryUpdated', loadSessions);
  }, [isQueryPage]);

  // Chat History Handlers
  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    chatHistoryManager.deleteSession(id);
  };
  const startEditing = (session: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setEditingId(session.id);
    setEditTitle(session.title);
  };
  const saveEditing = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (editTitle.trim()) {
      chatHistoryManager.renameSession(id, editTitle.trim());
    }
    setEditingId(null);
  };

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

        {/* Dynamic Context Area (Query History) */}
        {isQueryPage && (
          <div className="flex-1 flex flex-col overflow-hidden border-t border-white/5">
            {!isCollapsed && (
              <div className="px-4 py-3 shrink-0">
                <Link
                  href="/query"
                  className="flex items-center gap-2 w-full px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 rounded-xl transition-all shadow-inner font-medium text-sm"
                >
                  <Plus className="w-4 h-4" />
                  New Chat
                </Link>
              </div>
            )}

            <div className={`flex-1 overflow-y-auto ${isCollapsed ? 'px-2' : 'px-3'} py-2 space-y-1 custom-scrollbar`}>
              {!isCollapsed && (
                <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2 ml-2 mt-1">
                  Recent queries
                </h3>
              )}

              {!isCollapsed && sessions.length === 0 && (
                <div className="text-center p-4 text-gray-600 text-xs mt-4">
                  No chat history yet.
                </div>
              )}

              {sessions.map((session) => (
                <Link
                  key={session.id}
                  href={`/query?id=${session.id}`}
                  className={`flex items-center group rounded-xl cursor-pointer transition-all border
                    ${isCollapsed ? 'justify-center p-2.5 mx-auto w-10' : 'justify-between px-3 py-2.5'}
                    bg-transparent border-transparent hover:bg-white/5 text-gray-400 hover:text-gray-200
                  `}
                  title={isCollapsed ? session.title : undefined}
                >
                  <div className="flex items-center gap-3 overflow-hidden flex-1">
                    <ChatIcon className="w-4 h-4 shrink-0 opacity-70" />

                    {!isCollapsed && (
                      editingId === session.id ? (
                        <input
                          autoFocus
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onBlur={(e) => saveEditing(session.id, e as unknown as React.MouseEvent)}
                          onKeyDown={(e) => e.key === 'Enter' && saveEditing(session.id, e as unknown as React.MouseEvent)}
                          className="bg-[#0B0F17] text-sm text-white px-2 py-0.5 rounded outline-none w-full border border-blue-500/50"
                          onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}
                        />
                      ) : (
                        <span className="text-sm truncate font-medium">
                          {session.title}
                        </span>
                      )
                    )}
                  </div>

                  {!isCollapsed && editingId !== session.id && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => startEditing(session, e)} className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={(e) => handleDeleteSession(session.id, e)} className="p-1 rounded hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

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
