"use client";

import { useState, useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import { ChatMessage, Source } from '@/types/chat';
import { queryPolicies } from '@/lib/api';
import ClauseViewer from '@/components/policies/ClauseViewer';
import { X } from 'lucide-react';
import { queryHistory } from '@/lib/queryHistory';
import { toast } from '@/lib/toast';

const initialMessages: ChatMessage[] = [
  {
    id: '1',
    role: 'assistant',
    content:
      'Hello! I am the Bharat Policy Twin AI. How can I assist you with government policy analysis today?',
    timestamp: new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    }),
  },
];

interface ChatContainerProps {
  initialQuery?: string | null;
  onQueryCleared?: () => void;
}

export default function ChatContainer({
  initialQuery,
  onQueryCleared,
}: ChatContainerProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [loading, setLoading] = useState(false);
  const [selectedPolicyId, setSelectedPolicyId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const simulateStreaming = (
    finalText: string,
    messageId: string,
    sources?: Source[]
  ) => {
    let index = 0;
    const speed = 15;

    setMessages((prev) => [
      ...prev,
      {
        id: messageId,
        role: 'assistant',
        content: '',
        sources: undefined,
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      },
    ]);

    const interval = setInterval(() => {
      index += 2;
      if (index >= finalText.length) {
        clearInterval(interval);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId ? { ...msg, content: finalText, sources } : msg
          )
        );
        setLoading(false);
      } else {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId
              ? { ...msg, content: finalText.substring(0, index) + '...' }
              : msg
          )
        );
      }
    }, speed);
  };

  const handleSendMessage = async (query: string) => {
    if (!query.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const { answer, sources } = await queryPolicies(query);
      queryHistory.saveQuery(query);

      const messageId = (Date.now() + 1).toString();
      simulateStreaming(answer, messageId, sources);
    } catch (error) {
      console.error(error);
      toast.error('Failed to query policies. Please try again.');
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content:
          "I'm sorry, I encountered an error while processing your request. Please try again.",
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      handleSendMessage(initialQuery);
      if (onQueryCleared) onQueryCleared();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  const handleSourceClick = (source: Source) => {
    setSelectedPolicyId(source.policy_id);
  };

  return (
    <>
      <div className="flex flex-col h-full w-full max-w-4xl mx-auto rounded-xl border border-white/5 bg-[#111827] overflow-hidden shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              onSourceClick={handleSourceClick}
            />
          ))}
          {loading &&
            messages.length > 0 &&
            messages[messages.length - 1].role === 'user' && (
              <div className="flex w-full justify-start items-center gap-3 text-gray-500">
                <div className="flex gap-1 items-center px-4 py-2.5 border border-white/5 rounded-lg bg-[#0F172A]">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500/60 animate-bounce" />
                  <div
                    className="w-1.5 h-1.5 rounded-full bg-blue-500/60 animate-bounce"
                    style={{ animationDelay: '150ms' }}
                  />
                  <div
                    className="w-1.5 h-1.5 rounded-full bg-blue-500/60 animate-bounce"
                    style={{ animationDelay: '300ms' }}
                  />
                </div>
                <span className="text-xs">Analyzing policy corpus...</span>
              </div>
            )}
          <div ref={messagesEndRef} />
        </div>
        <ChatInput onSend={handleSendMessage} disabled={loading} />
      </div>

      {selectedPolicyId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B0F17]/80 backdrop-blur-sm">
          <div className="relative w-full max-w-3xl max-h-[85vh] flex flex-col bg-[#111827] border border-white/5 rounded-xl overflow-hidden shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#0F172A]">
              <div>
                <h2 className="text-xl font-semibold text-white tracking-tight">
                  Policy Document
                </h2>
                <p className="text-sm text-gray-400 mt-1 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-lg bg-white/5 text-gray-400 text-xs">
                    ID: {selectedPolicyId}
                  </span>
                  <span>Viewing source clauses</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedPolicyId(null)}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-150"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 p-6 overflow-hidden bg-[#111827]">
              <ClauseViewer policyId={selectedPolicyId} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
