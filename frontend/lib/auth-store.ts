import { create } from "zustand";
import type { AuthUser } from "./types";

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isLoading: boolean;

  setAuth: (user: AuthUser, accessToken: string) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isLoading: true,

  setAuth: (user, accessToken) => set({ user, accessToken, isLoading: false }),
  clearAuth: () => set({ user: null, accessToken: null, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading })
}));
