"use client";

import { useState } from 'react';
import { Send, FileUp } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSend(input);
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 border-t border-white/5 bg-[#0F172A]">
      <div
        className={`
          relative flex w-full flex-col rounded-lg border border-white/5 bg-[#111827]
          focus-within:ring-2 focus-within:ring-blue-500/30 focus-within:border-blue-500/50
          transition-all duration-150
          ${disabled ? 'opacity-70 pointer-events-none' : ''}
        `}
      >
        <textarea
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question to the Policy Twin... (Enter to send)"
          className="w-full resize-none bg-transparent px-4 pt-3 pb-2 text-sm text-white placeholder:text-gray-500 focus:outline-none min-h-[44px] max-h-32"
          style={{ height: '44px' }}
        />
        <div className="flex items-center justify-between px-2 pb-2">
          <button
            type="button"
            className="p-2 text-gray-500 hover:text-blue-400 hover:bg-white/5 rounded-lg transition-all duration-150"
          >
            <FileUp className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleSend}
            disabled={!input.trim() || disabled}
            className={`
              flex items-center justify-center p-2 rounded-lg
              transition-all duration-150
              ${
                !input.trim() || disabled
                  ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-400 text-white'
              }
            `}
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
      <p className="text-center mt-3 text-[10px] text-gray-500">
        AI can make mistakes. Verify important policy details.
      </p>
    </div>
  );
}
