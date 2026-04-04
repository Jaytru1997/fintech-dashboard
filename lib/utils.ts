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

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  CNY: "¥",
  CHF: "Fr",
  CAD: "CA$",
  AUD: "A$",
  NZD: "NZ$",
  HKD: "HK$",
  SGD: "S$",
  KRW: "₩",
  INR: "₹",
  BRL: "R$",
  MXN: "MX$",
  ZAR: "R",
  NGN: "₦",
  GHS: "₵",
  KES: "KSh",
  AED: "د.إ",
  SAR: "﷼",
  TRY: "₺",
  SEK: "kr",
  NOK: "kr",
  DKK: "kr",
  PLN: "zł",
  RUB: "₽",
  THB: "฿",
  MYR: "RM",
  IDR: "Rp",
  PHP: "₱",
  VND: "₫",
  CZK: "Kč",
  HUF: "Ft",
  RON: "lei",
  ILS: "₪",
  CLP: "CL$",
  COP: "CO$",
  ARS: "AR$",
  PEN: "S/",
  EGP: "E£",
  PKR: "₨",
  BDT: "৳",
};

/** Returns the symbol for a given ISO 4217 currency code, e.g. "EUR" → "€". Falls back to the code itself. */
export function getCurrencySymbol(currency?: string | null): string {
  if (!currency) return "$";
  return CURRENCY_SYMBOLS[currency.toUpperCase()] ?? currency.toUpperCase();
}


