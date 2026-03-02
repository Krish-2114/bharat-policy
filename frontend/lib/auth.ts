const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
const TOKEN_KEY = 'bharat_access_token';
const USER_KEY = 'bharat_user';

export interface User {
  id: string;
  email: string;
  username: string;
}

// ─── Token helpers ────────────────────────────────────────────────────────────

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token: string) {
  if (typeof window !== 'undefined') localStorage.setItem(TOKEN_KEY, token);
}

function clearToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
}

// ─── Auth Actions ─────────────────────────────────────────────────────────────

export const authActions = {
  /**
   * Step 1: Send OTP to email via real backend.
   */
  sendOtp: async (email: string): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.detail || 'Failed to send OTP. Please try again.');
    }
  },

  /**
   * Step 2: Verify OTP and receive JWT token from backend.
   */
  verifyOtp: async (email: string, otp: string): Promise<User> => {
    const res = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.detail || 'Invalid or expired OTP.');
    }
    const data = await res.json();
    setToken(data.access_token);
    const user: User = { id: data.email, email: data.email, username: data.email.split('@')[0] };
    if (typeof window !== 'undefined') localStorage.setItem(USER_KEY, JSON.stringify(user));
    return user;
  },

  /**
   * Logout: clear token from storage.
   */
  logout: async (): Promise<void> => {
    clearToken();
  },

  getCurrentUser: (): User | null => {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(USER_KEY);
    try { return raw ? JSON.parse(raw) : null; } catch { return null; }
  },

  isAuthenticated: (): boolean => {
    return !!getToken();
  },
};
