"use client";

import { useState, useEffect, useRef, Suspense } from 'react';
import { Sparkles, Paperclip, Loader2 } from 'lucide-react';
import { chatHistoryManager, ChatSession, Message } from '@/lib/chatHistory';
import { queryPolicies } from '@/lib/api';
import { toast } from '@/lib/toast';
import MessageBubble from '@/components/query/MessageBubble';
import { Source } from '@/types/chat';
import { useSearchParams } from 'next/navigation';

function QueryContent() {
  const searchParams = useSearchParams();
  const queryId = searchParams.get('id');

  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);

  // Active Chat State
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messages = activeSession?.messages || [];

  // Load session based on URL param
  useEffect(() => {
    if (queryId) {
      const session = chatHistoryManager.getSession(queryId);
      setActiveSession(session || null);
    } else {
      setActiveSession(null);
    }
  }, [queryId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, loading]);

  const simulateStreaming = (finalText: string, sessionObj: ChatSession, msgId: string, sources?: Source[]) => {
    let index = 0;
    const speed = 15;

    const streamingMsg: Message = {
      id: msgId,
      role: 'assistant',
      content: '',
      sources: undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    sessionObj.messages.push(streamingMsg);

    // Trigger tick
    chatHistoryManager.saveSession({ ...sessionObj });
    setActiveSession({ ...sessionObj });

    const interval = setInterval(() => {
      index += 2;
      const currentSession = chatHistoryManager.getSession(sessionObj.id);
      if (!currentSession) {
        clearInterval(interval);
        return;
      }

      const activeMsgIndex = currentSession.messages.findIndex(m => m.id === msgId);

      if (index >= finalText.length) {
        clearInterval(interval);
        if (activeMsgIndex >= 0) {
          currentSession.messages[activeMsgIndex].content = finalText;
          currentSession.messages[activeMsgIndex].sources = sources;
          chatHistoryManager.saveSession(currentSession);
          setActiveSession(currentSession);
        }
        setLoading(false);
      } else {
        if (activeMsgIndex >= 0) {
          currentSession.messages[activeMsgIndex].content = finalText.substring(0, index) + '...';
          chatHistoryManager.saveSession(currentSession);
          setActiveSession(currentSession);
        }
      }
    }, speed);
  };

  const handleSendMessage = async (providedQuery?: string) => {
    const textQuery = (providedQuery || query).trim();
    if (!textQuery || loading) return;

    let currentSessionId = activeSession?.id;
    let currentSession: ChatSession;

    // Create session if it doesn't exist yet
    if (!currentSessionId) {
      currentSessionId = Date.now().toString();
      currentSession = {
        id: currentSessionId,
        title: textQuery.substring(0, 30) + (textQuery.length > 30 ? "..." : ""),
        messages: [],
        updatedAt: Date.now()
      };

      // Update URL to reflect new session without full reload
      window.history.replaceState(null, '', `?id=${currentSessionId}`);
    } else {
      currentSession = chatHistoryManager.getSession(currentSessionId) || {
        id: currentSessionId,
        title: "Chat",
        messages: [],
        updatedAt: Date.now()
      };
    }

    const userMessage: Message = {
      id: Date.now().toString() + "-user",
      role: 'user',
      content: textQuery,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    currentSession.messages.push(userMessage);
    chatHistoryManager.saveSession(currentSession);
    setActiveSession({ ...currentSession });

    setQuery("");
    setLoading(true);

    try {
      const { answer, sources } = await queryPolicies(textQuery);
      const messageId = Date.now().toString() + "-assistant";
      simulateStreaming(answer, currentSession, messageId, sources);
    } catch (error) {
      console.error(error);
      toast.error('Failed to query policies.');

      const errorMessage: Message = {
        id: Date.now().toString() + "-error",
        role: 'assistant',
        content: "I'm sorry, I encountered an error while processing your request. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      const updatedSession = chatHistoryManager.getSession(currentSessionId);
      if (updatedSession) {
        updatedSession.messages.push(errorMessage);
        chatHistoryManager.saveSession(updatedSession);
        setActiveSession({ ...updatedSession });
      }
      setLoading(false);
    }
  };

  const SuggestionCard = ({ text }: { text: string }) => (
    <button
      onClick={() => handleSendMessage(text)}
      className="bg-[#1c1528]/80 hover:bg-[#2a1f3d] border border-blue-500/20 backdrop-blur-md rounded-full px-5 py-2.5 text-sm text-gray-300 hover:text-white transition-all shadow-sm whitespace-nowrap"
    >
      {text}
    </button>
  );

  return (
    <div className="flex w-full h-full text-white relative">

      {/* MAIN VIEW: Fullscreen Hero / Chat Area */}
      <div className="flex-1 bg-transparent overflow-hidden relative flex flex-col">

        {/* Content area */}
        <div className="flex-1 flex flex-col relative z-10 overflow-hidden">

          {/* Default Start Screen (Hero UI) */}
          {(!activeSession || messages.length === 0) ? (
            <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">
              <div className="max-w-4xl mx-auto space-y-6">

                <div className="flex-1 flex justify-center">
                  <div className="bg-[#1c1528] border border-blue-500/20 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2 w-fit mx-4 shadow-lg shadow-blue-500/5">
                    <span className="text-xs flex items-center gap-2 font-medium text-blue-100">
                      <span className="bg-blue-500 text-white p-1 rounded-full"><Sparkles className="w-3 h-3" /></span>
                      Semantic Policy Intelligence
                    </span>
                  </div>
                </div>

                <h1 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight px-4 shadow-black drop-shadow-md">
                  Ask questions.<br />
                  <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Get verified answers.</span>
                </h1>

                <p className="text-md text-gray-400 max-w-xl mx-auto font-light leading-relaxed px-4">
                  Bharat Policy Twin analyzes thousands of government documents to fetch exact clauses and clear insights instantly.
                </p>

                {/* Input box */}
                <form
                  onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                  className="relative max-w-3xl mx-auto w-full px-4 mt-8"
                >
                  <div className="bg-[#1c1528]/80 backdrop-blur-xl border border-white/10 rounded-full p-2 flex items-center shadow-2xl focus-within:ring-2 focus-within:ring-cyan-500/40 focus-within:border-cyan-500/50 transition-all">
                    <button type="button" className="p-3 rounded-full hover:bg-[#2a1f3d] transition-all">
                      <Paperclip className="w-5 h-5 text-gray-400" />
                    </button>
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="e.g. What are the telecom compliance requirements for spectrum allocation?"
                      className="bg-transparent flex-1 outline-none text-white placeholder-gray-500 pl-2 text-sm md:text-base font-medium"
                    />
                    <button
                      type="submit"
                      disabled={!query.trim() || loading}
                      className="p-3 rounded-full bg-blue-500 hover:bg-blue-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-lg mx-1"
                    >
                      <Sparkles className="w-5 h-5" />
                    </button>
                  </div>
                </form>

                {/* Suggestion pills */}
                <div className="flex flex-wrap justify-center gap-3 mt-12 max-w-2xl mx-auto relative z-20 px-4">
                  <SuggestionCard text="Summarize the Data Protection Bill" />
                  <SuggestionCard text="What are the latest semiconductor subsidies?" />
                  <SuggestionCard text="Telecom vs IT guidelines comparison" />
                  <SuggestionCard text="Define 'critical infrastructure' officially" />
                </div>

              </div>
            </div>
          ) : (
            /* Active Chat View */
            <div className="flex flex-col h-full bg-[#0B0F17]/40">
              <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 scroll-smooth w-full max-w-4xl mx-auto custom-scrollbar">
                {messages.map((msg, idx) => (
                  <div key={msg.id} className="w-full">
                    <MessageBubble message={msg} onSourceClick={() => { }} />
                  </div>
                ))}

                {loading && (
                  <div className="flex w-full justify-start items-center gap-3 text-cyan-400 p-4 bg-cyan-900/10 border border-cyan-800/30 rounded-2xl w-fit">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-sm font-medium">Analyzing neural policy networks...</span>
                  </div>
                )}
                <div ref={messagesEndRef} className="h-4" />
              </div>

              {/* Chat Output Bar */}
              <div className="p-4 md:p-6 bg-gradient-to-t from-[#0c0414] to-transparent shrink-0">
                <form
                  onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                  className="relative max-w-4xl mx-auto w-full"
                >
                  <div className="bg-[#1c1528] border border-white/10 rounded-2xl p-2 flex items-center shadow-2xl focus-within:ring-2 focus-within:ring-cyan-500/40">
                    <button type="button" className="p-3 rounded-xl hover:bg-[#2a1f3d] transition-all">
                      <Paperclip className="w-5 h-5 text-gray-400" />
                    </button>
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Ask a follow-up question..."
                      className="bg-transparent flex-1 outline-none text-white placeholder-gray-500 pl-3 py-3"
                    />
                    <button
                      type="submit"
                      disabled={!query.trim() || loading}
                      className="p-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed mx-1"
                    >
                      <Sparkles className="w-5 h-5" />
                    </button>
                  </div>
                </form>
                <p className="text-center text-[11px] text-gray-500 mt-3 font-medium">
                  AI responses are verified against national documents, but may contain hallucinations. Verify directly via clauses.
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default function QueryPage() {
  return (
    <Suspense fallback={<div className="flex h-screen w-full items-center justify-center bg-[#0B0F17]"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>}>
      <QueryContent />
    </Suspense>
  )
}
