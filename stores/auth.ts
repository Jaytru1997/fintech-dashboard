import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { User } from "@/lib/types";

interface AuthState {
  token: string | null;
  user: User | null;
  isAdmin: boolean;
  setAuth: (token: string, user: User, isAdmin: boolean) => void;
  clearAuth: () => void;
  updateUser: (user: Partial<User>) => void;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
}

// Helper function to normalize user object and remove unwanted fields
const normalizeUser = (user: any): User => {
  if (!user) return user;
  
  // Preserve balances from top level if they exist (before extracting nested data)
  const topLevelBalances = user.balances;
  
  // If user has a nested 'data' property, use that instead
  const userData = user.data || user;
  
  // Extract id before destructuring (in case it needs to become _id)
  const id = userData.id || user.id;
  
  // Remove unwanted fields (message, status, data, id)
  const { data, message, status, id: _unusedId, ...cleanUser } = userData;
  
  // Ensure _id is present (use id if _id doesn't exist)
  if (!cleanUser._id && id) {
    cleanUser._id = id;
  }
  
  // Preserve balances - prioritize top level, then userData, then keep existing in cleanUser
  if (topLevelBalances) {
    cleanUser.balances = topLevelBalances;
  } else if (userData.balances && !cleanUser.balances) {
    cleanUser.balances = userData.balances;
  }
  // If cleanUser already has balances from destructuring, keep it
  
  // Remove any other non-User fields that might have been added
  return cleanUser as User;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAdmin: false,
      _hasHydrated: false,
      setAuth: (token, user, isAdmin) => {
        const normalizedUser = normalizeUser(user);
        set({ token, user: normalizedUser, isAdmin });
      },
      clearAuth: () => set({ token: null, user: null, isAdmin: false }),
      updateUser: (userData) => {
        // For partial updates, only normalize if it contains unwanted fields
        const hasUnwantedFields = userData && ('data' in userData || 'message' in userData || 'status' in userData);
        const normalizedData = hasUnwantedFields ? normalizeUser(userData) : userData;
        set((state) => ({
          user: state.user ? { ...state.user, ...normalizedData } : null,
        }));
      },
      setHasHydrated: (state) => {
        set({
          _hasHydrated: state,
        });
      },
    }),
    {
      name: "auth-storage",
      storage: typeof window !== "undefined" 
        ? createJSONStorage(() => localStorage)
        : {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          },
      onRehydrateStorage: () => (state) => {
        // Clean up corrupted user data on rehydration
        if (state?.user) {
          const normalizedUser = normalizeUser(state.user);
          state.user = normalizedUser;
        }
        state?.setHasHydrated(true);
      },
    }
  )
);

