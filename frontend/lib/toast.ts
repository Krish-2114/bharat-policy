type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

type Listener = (toast: ToastMessage) => void;
let listeners: Listener[] = [];

export const toast = {
  notify: (message: string, type: ToastType = 'info') => {
    const newToast = { id: Date.now().toString(), type, message };
    listeners.forEach((l) => l(newToast));
  },
  success: (message: string) => toast.notify(message, 'success'),
  error: (message: string) => toast.notify(message, 'error'),
  info: (message: string) => toast.notify(message, 'info'),
  subscribe: (listener: Listener) => {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }
};
