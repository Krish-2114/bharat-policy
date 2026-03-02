import { Source } from '@/types/chat';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
  timestamp: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
}

const CHAT_HISTORY_KEY = 'policy_twin_chat_history';

export const chatHistoryManager = {
  getSessions: (): ChatSession[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(CHAT_HISTORY_KEY);
    if (!data) return [];
    return JSON.parse(data).sort((a: ChatSession, b: ChatSession) => b.updatedAt - a.updatedAt);
  },

  getSession: (id: string): ChatSession | undefined => {
    return chatHistoryManager.getSessions().find(s => s.id === id);
  },

  saveSession: (session: ChatSession) => {
    if (typeof window === 'undefined') return;
    const current = chatHistoryManager.getSessions();
    const existingIndex = current.findIndex(s => s.id === session.id);

    // Auto-generate title from first user message if title is effectively new
    if (session.messages.length > 0 && session.title === 'New Chat') {
      const firstUserMsg = session.messages.find(m => m.role === 'user');
      if (firstUserMsg) {
        session.title = firstUserMsg.content.slice(0, 30) + (firstUserMsg.content.length > 30 ? '...' : '');
      }
    }

    session.updatedAt = Date.now();

    if (existingIndex >= 0) {
      current[existingIndex] = session;
    } else {
      current.unshift(session);
    }
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(current));
    window.dispatchEvent(new Event('chatHistoryUpdated'));
  },

  deleteSession: (id: string) => {
    if (typeof window === 'undefined') return;
    const current = chatHistoryManager.getSessions().filter(s => s.id !== id);
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(current));
    window.dispatchEvent(new Event('chatHistoryUpdated'));
  },

  renameSession: (id: string, newTitle: string) => {
    if (typeof window === 'undefined') return;
    const session = chatHistoryManager.getSession(id);
    if (session) {
      session.title = newTitle;
      chatHistoryManager.saveSession(session);
    }
  },

  clearAll: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(CHAT_HISTORY_KEY);
    window.dispatchEvent(new Event('chatHistoryUpdated'));
  }
};
