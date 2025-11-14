import { create } from "zustand";
import { Balances } from "@/lib/types";

interface UserState {
  balances: Balances | null;
  setBalances: (balances: Balances) => void;
  updateBalance: (type: keyof Balances, amount: number) => void;
}

export const useUserStore = create<UserState>((set) => ({
  balances: null,
  setBalances: (balances) => set({ balances }),
  updateBalance: (type, amount) =>
    set((state) => ({
      balances: state.balances
        ? { ...state.balances, [type]: amount }
        : null,
    })),
}));

