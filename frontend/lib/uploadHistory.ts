export interface UploadRecord {
  id: string;
  title: string;
  filename: string;
  size: string;
  timestamp: number;
  status: 'completed' | 'processing' | 'failed';
}

const UPLOAD_HISTORY_KEY = 'policy_twin_upload_history';

export const uploadHistoryManager = {
  getUploads: (): UploadRecord[] => {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(UPLOAD_HISTORY_KEY);
      if (!data) return [];
      return JSON.parse(data).sort((a: UploadRecord, b: UploadRecord) => b.timestamp - a.timestamp);
    } catch {
      return [];
    }
  },

  addUpload: (record: UploadRecord) => {
    if (typeof window === 'undefined') return;
    const current = uploadHistoryManager.getUploads();
    current.unshift(record);
    localStorage.setItem(UPLOAD_HISTORY_KEY, JSON.stringify(current));
    window.dispatchEvent(new Event('uploadHistoryUpdated'));
  },

  deleteUpload: (id: string) => {
    if (typeof window === 'undefined') return;
    const current = uploadHistoryManager.getUploads().filter((r) => r.id !== id);
    localStorage.setItem(UPLOAD_HISTORY_KEY, JSON.stringify(current));
    window.dispatchEvent(new Event('uploadHistoryUpdated'));
  },

  clearHistory: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(UPLOAD_HISTORY_KEY);
    window.dispatchEvent(new Event('uploadHistoryUpdated'));
  }
};
