import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { POPULAR_ASSETS } from "@/lib/constants/assets";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const PAIR_TO_SYMBOL_MAP: Record<string, string> = {};
const SYMBOL_TO_PAIR_MAP: Record<string, string> = {};

POPULAR_ASSETS.forEach((asset) => {
  PAIR_TO_SYMBOL_MAP[asset.pair] = asset.symbol;
  SYMBOL_TO_PAIR_MAP[asset.symbol] = asset.pair;
});

export function formatPairToTradingViewSymbol(pair?: string) {
  if (!pair) return PAIR_TO_SYMBOL_MAP["BTC/USD"] || "BINANCE:BTCUSDT";
  return (
    PAIR_TO_SYMBOL_MAP[pair] ||
    pair.replace(/\s+/g, "").replace("/", "") ||
    PAIR_TO_SYMBOL_MAP["BTC/USD"]
  );
}

export function mapTradingViewSymbolToPair(symbol?: string) {
  if (!symbol) return undefined;
  return SYMBOL_TO_PAIR_MAP[symbol] || undefined;
}

