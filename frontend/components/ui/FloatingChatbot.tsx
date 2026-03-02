"use client";

import { useState, useRef, useEffect } from 'react';
import {
  MessageSquare, X, Send, Sparkles, Loader2, Minimize2,
  Maximize2, Bot, User, ChevronDown, Zap, Copy, CheckCheck,
  RefreshCw, Brain
} from 'lucide-react';
import { queryPolicies } from '@/lib/api';
import { useTheme } from '@/context/ThemeContext';

interface ChatMsg {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  typing?: boolean;
}

const QUICK_PROMPTS = [
  "Summarize the latest policy",
  "What are key compliance rules?",
  "Show me risk areas",
  "Compare IT Act vs DPDP Act",
  "Find penalties for data breach",
  "What's the telecom policy say?",
];

export default function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "👋 Hi! I'm your **Policy AI Assistant**. Ask me anything about Indian government policies — compliance, clauses, penalties, comparisons, and more.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { isDark } = useTheme();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const sendMessage = async (text?: string) => {
    const q = (text || input).trim();
    if (!q || loading) return;
    setInput('');

    const userMsg: ChatMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Typing indicator
    const typingId = Date.now().toString() + '-typing';
    setMessages(prev => [...prev, userMsg, { id: typingId, role: 'assistant', content: '', timestamp: '', typing: true }]);
    setLoading(true);

    try {
      const { answer } = await queryPolicies(q);

      setMessages(prev => prev
        .filter(m => m.id !== typingId)
        .concat({
          id: Date.now().toString() + '-ai',
          role: 'assistant',
          content: answer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        })
      );

      if (!isOpen) setHasUnread(true);
    } catch {
      setMessages(prev => prev
        .filter(m => m.id !== typingId)
        .concat({
          id: Date.now().toString() + '-err',
          role: 'assistant',
          content: "⚠️ I couldn't connect to the backend. Make sure the API is running on port 8000.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        })
      );
    } finally {
      setLoading(false);
    }
  };

  const chatW = isExpanded ? 'w-[520px]' : 'w-[380px]';
  const chatH = isExpanded ? 'h-[600px]' : 'h-[480px]';

  const bg = isDark
    ? 'bg-[#0c0414] border-white/10'
    : 'bg-white border-gray-200';

  const msgBg = isDark ? 'bg-white/5' : 'bg-gray-50';
  const inputBg = isDark ? 'bg-[#111827] border-white/10' : 'bg-gray-50 border-gray-200';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const subText = isDark ? 'text-gray-400' : 'text-gray-500';

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3">
      {/* Chat Window */}
      {isOpen && (
        <div className={`${chatW} ${chatH} ${bg} border rounded-2xl shadow-2xl flex flex-col overflow-hidden slide-up`}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-gradient-to-r from-blue-600/20 to-purple-600/20 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                <Brain className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p className={`text-sm font-semibold ${textColor}`}>Policy AI</p>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs text-emerald-400">Online</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`p-1.5 rounded-lg ${msgBg} ${subText} hover:text-blue-400 transition-colors`}
                title={isExpanded ? 'Minimize' : 'Expand'}
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setMessages(prev => [prev[0]])}
                className={`p-1.5 rounded-lg ${msgBg} ${subText} hover:text-amber-400 transition-colors`}
                title="Clear chat"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className={`p-1.5 rounded-lg ${msgBg} ${subText} hover:text-red-400 transition-colors`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {messages.map((msg) => (
              <MessageRow key={msg.id} msg={msg} isDark={isDark} />
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts (show when only welcome msg) */}
          {messages.length === 1 && (
            <div className="px-4 pb-2 shrink-0">
              <p className={`text-[11px] font-semibold uppercase tracking-wider mb-2 ${subText}`}>Quick Questions</p>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_PROMPTS.map(p => (
                  <button
                    key={p}
                    onClick={() => sendMessage(p)}
                    className={`text-[11px] px-2.5 py-1.5 rounded-full border transition-all hover:border-blue-500/50 hover:text-blue-400
                      ${isDark ? 'bg-white/5 border-white/10 text-gray-400' : 'bg-gray-100 border-gray-200 text-gray-600'}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className={`px-3 py-3 border-t shrink-0 ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
            <div className={`flex items-center gap-2 rounded-xl px-3 py-2 border ${inputBg}`}>
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="Ask about any policy..."
                disabled={loading}
                className={`flex-1 bg-transparent text-sm outline-none placeholder-gray-500 ${textColor}`}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                className="w-7 h-7 rounded-lg bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className={`text-[10px] mt-1.5 text-center ${subText}`}>Powered by Bharat Policy Twin RAG Engine</p>
          </div>
        </div>
      )}

      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative w-14 h-14 rounded-2xl shadow-2xl flex items-center justify-center transition-all duration-300
          ${isOpen
            ? 'bg-red-600/80 hover:bg-red-600 rotate-0'
            : 'bg-gradient-to-br from-blue-600 to-purple-600 hover:scale-110 chatbot-bounce'
          } glow-blue`}
      >
        {isOpen ? <X className="w-6 h-6 text-white" /> : <MessageSquare className="w-6 h-6 text-white" />}
        {hasUnread && !isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-[#0B0F17] flex items-center justify-center">
            <span className="text-[9px] text-white font-bold">!</span>
          </span>
        )}
      </button>
    </div>
  );
}

function MessageRow({ msg, isDark }: { msg: ChatMsg; isDark: boolean }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (msg.typing) {
    return (
      <div className="flex items-start gap-2">
        <div className="w-6 h-6 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
          <Bot className="w-3.5 h-3.5 text-blue-400" />
        </div>
        <div className={`px-3 py-2.5 rounded-2xl rounded-tl-sm ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
          <div className="flex gap-1 items-center h-4">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 typing-dot" />
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 typing-dot" />
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 typing-dot" />
          </div>
        </div>
      </div>
    );
  }

  if (msg.role === 'user') {
    return (
      <div className="flex justify-end gap-2">
        <div className="max-w-[80%] px-3 py-2.5 rounded-2xl rounded-tr-sm bg-blue-600 text-white text-sm leading-relaxed">
          {msg.content}
        </div>
        <div className="w-6 h-6 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
          <User className="w-3.5 h-3.5 text-blue-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2 group">
      <div className="w-6 h-6 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0 mt-0.5">
        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
      </div>
      <div className={`flex-1 max-w-[85%] px-3 py-2.5 rounded-2xl rounded-tl-sm text-sm leading-relaxed relative
        ${isDark ? 'bg-white/5 text-gray-200' : 'bg-gray-100 text-gray-800'}`}>
        <FormattedText text={msg.content} />
        <div className="flex items-center justify-between mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className={`text-[10px] ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>{msg.timestamp}</span>
          <button onClick={handleCopy} className={`flex items-center gap-1 text-[10px] ${isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'} transition-colors`}>
            {copied ? <CheckCheck className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  );
}

function FormattedText({ text }: { text: string }) {
  // Simple markdown-like formatting
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <span>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}
