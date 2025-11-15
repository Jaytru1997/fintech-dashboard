import { create } from "zustand";
import { Balances } from "@/lib/types";

interface UserState {
  balances: Balances | null;
  setBalances: (balances: Balances) => void;
  updateBalance: (type: keyof Balances, amount: number, currency?: string) => void;
}

export const useUserStore = create<UserState>((set) => ({
  balances: null,
  setBalances: (balances) => set({ balances }),
  updateBalance: (type, amount, currency) =>
    set((state) => ({
      balances: state.balances
        ? { 
            ...state.balances, 
            [type]: { 
              amount, 
              currency: currency || state.balances[type]?.currency || "USD" 
            } 
          }
        : null,
    })),
}));

