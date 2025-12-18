import { create } from 'zustand';
import { AuthUser } from '@/types';
import { authApi } from '@/mocks/api';

const AUTH_STORAGE_KEY = 'si_releves_auth';
const INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10 minutes

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  lastActivity: number;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateActivity: () => void;
  checkInactivity: () => boolean;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  lastActivity: Date.now(),

  login: async (email: string, password: string) => {
    const user = await authApi.login(email, password);
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      set({ user, lastActivity: Date.now() });
      return true;
    }
    return false;
  },

  logout: () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    set({ user: null });
  },

  updateActivity: () => {
    set({ lastActivity: Date.now() });
  },

  checkInactivity: () => {
    const { lastActivity, user } = get();
    if (!user) return false;
    
    const now = Date.now();
    if (now - lastActivity > INACTIVITY_TIMEOUT) {
      get().logout();
      return true;
    }
    return false;
  },

  initialize: () => {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      try {
        const user = JSON.parse(stored) as AuthUser;
        set({ user, isLoading: false, lastActivity: Date.now() });
      } catch {
        set({ isLoading: false });
      }
    } else {
      set({ isLoading: false });
    }
  },
}));
