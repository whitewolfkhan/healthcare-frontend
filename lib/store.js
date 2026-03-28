import { create } from 'zustand';
import { clearAuth, setAuth, getStoredUser } from './auth';

const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  token: null,
  isLoading: true,

  setUser: (user, token, profile) => {
    setAuth(token, user);
    set({ user, token, profile, isLoading: false });
  },

  updateUser: (updates) => set(state => ({ user: { ...state.user, ...updates } })),

  updateProfile: (updates) => set(state => ({ profile: { ...state.profile, ...updates } })),

  logout: () => {
    clearAuth();
    set({ user: null, token: null, profile: null, isLoading: false });
  },

  initialize: () => {
    const user = getStoredUser();
    if (user) {
      set({ user, isLoading: false });
    } else {
      set({ isLoading: false });
    }
  },
}));

export default useAuthStore;
