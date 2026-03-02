export interface QueryHistoryItem {
  id: string;
  query: string;
  timestamp: string;
}

export const queryHistory = {
  saveQuery: (query: string) => {
    if (typeof window === 'undefined') return;
    try {
      const history = queryHistory.getQueryHistory();
      const newItem: QueryHistoryItem = {
        id: Date.now().toString(),
        query,
        timestamp: new Date().toISOString()
      };
      const updated = [newItem, ...history.filter(h => h.query !== query)].slice(0, 50);
      localStorage.setItem('query_history', JSON.stringify(updated));
      window.dispatchEvent(new Event('queryHistoryUpdated'));
    } catch { }
  },
  getQueryHistory: (): QueryHistoryItem[] => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem('query_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  },
  clearQueryHistory: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('query_history');
    window.dispatchEvent(new Event('queryHistoryUpdated'));
  }
};
