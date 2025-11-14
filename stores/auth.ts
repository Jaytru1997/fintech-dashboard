import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/lib/types";

interface AuthState {
  token: string | null;
  user: User | null;
  isAdmin: boolean;
  setAuth: (token: string, user: User, isAdmin: boolean) => void;
  clearAuth: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAdmin: false,
      setAuth: (token, user, isAdmin) => set({ token, user, isAdmin }),
      clearAuth: () => set({ token: null, user: null, isAdmin: false }),
      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),
    }),
    {
      name: "auth-storage",
    }
  )
);

