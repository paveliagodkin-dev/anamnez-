import { create } from 'zustand';
import { api } from '../lib/api.js';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('anamnez_token'),
  loading: true,

  init: async () => {
    const token = localStorage.getItem('anamnez_token');
    if (!token) return set({ loading: false });
    try {
      const user = await api.getMe();
      set({ user, token, loading: false });
    } catch {
      localStorage.removeItem('anamnez_token');
      set({ user: null, token: null, loading: false });
    }
  },

  login: async (email, password) => {
    const { token, profile } = await api.login({ email, password });
    localStorage.setItem('anamnez_token', token);
    set({ user: profile, token });
  },

  logout: () => {
    localStorage.removeItem('anamnez_token');
    set({ user: null, token: null });
  }
}));
