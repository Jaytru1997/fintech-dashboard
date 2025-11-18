const TRADE_PAIR_STORAGE_KEY = "fintech-dashboard:selectedTradePair";

export function getStoredTradePair(): string | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const value = window.localStorage.getItem(TRADE_PAIR_STORAGE_KEY);
    return value || undefined;
  } catch {
    return undefined;
  }
}

export function setStoredTradePair(pair: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(TRADE_PAIR_STORAGE_KEY, pair);
  } catch {
    // Ignore quota/security errors
  }
}

export function clearStoredTradePair() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(TRADE_PAIR_STORAGE_KEY);
  } catch {
    // Ignore quota/security errors
  }
}


