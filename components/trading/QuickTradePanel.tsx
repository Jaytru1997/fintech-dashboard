"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { userApi } from "@/lib/api/endpoints";
import type { Balances } from "@/lib/types";
import clsx from "clsx";
import { getCurrencySymbol } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { setStoredTradePair } from "@/lib/storage/tradePair";
import { useAuthStore } from "@/stores/auth";

type TradeSide = "BUY" | "SELL";

interface QuickTradeState {
  tradeType: string;
  pair: string;
  amount: string;
  leverage: string;
  durationMinutes: string;
  takeProfit: string;
  stopLoss: string;
  isSwap: boolean;
  swapPair: string;
}

export interface QuickTradePanelProps {
  balances?: Balances | null;
  className?: string;
  initialPair?: string;
  onPairChange?: (pair: string) => void;
  pairs?: string[];
}

const defaultPairs = ["BTC/USD", "ETH/USD", "SOL/USD"];

export function QuickTradePanel({
  balances,
  className,
  initialPair = defaultPairs[0],
  onPairChange,
  pairs = defaultPairs,
}: QuickTradePanelProps) {
  const { user } = useAuthStore();
  const userCurrencyCode = user?.currency || "USD";
  const userCurrencySymbol = getCurrencySymbol(userCurrencyCode);
  const [tradeSide, setTradeSide] = useState<TradeSide>("BUY");
  const [isSubmittingTrade, setIsSubmittingTrade] = useState(false);
  const [isPriceLoading, setIsPriceLoading] = useState(false);
  const [livePrice, setLivePrice] = useState<string | null>(null);
  const [quickTrade, setQuickTrade] = useState<QuickTradeState>({
    tradeType: "Crypto",
    pair: initialPair,
    amount: "100",
    leverage: "5",
    durationMinutes: "60",
    takeProfit: "",
    stopLoss: "",
    isSwap: false,
    swapPair: "",
  });

  const leverageValue = useMemo(
    () => Math.min(100, Math.max(1, Number(quickTrade.leverage) || 1)),
    [quickTrade.leverage]
  );

  const [baseSymbol, quoteSymbol] = useMemo(() => {
    const [base, quote] = (quickTrade.pair || "").split("/");
    return [base?.toUpperCase() || "", quote?.toUpperCase() || ""];
  }, [quickTrade.pair]);

  const prioritizedBalance = useMemo(() => {
    if (balances?.trade) return balances.trade;
    if (balances?.main) return balances.main;
    if (balances?.mining) return balances.mining;
    if (balances?.realEstate) return balances.realEstate;
    if (balances?.referral) return balances.referral;
    return null;
  }, [balances]);

  useEffect(() => {
    setQuickTrade((prev) => ({ ...prev, pair: initialPair }));
  }, [initialPair]);

  useEffect(() => {
    if (quickTrade.pair) {
      onPairChange?.(quickTrade.pair);
    }
  }, [quickTrade.pair, onPairChange]);

  useEffect(() => {
    if (quickTrade.pair) {
      setStoredTradePair(quickTrade.pair);
    }
  }, [quickTrade.pair]);

  useEffect(() => {
    let isMounted = true;
    const fetchPrice = async () => {
      if (!quickTrade.pair) {
        if (isMounted) setLivePrice(null);
        return;
      }
      const [base, quote] = quickTrade.pair.split("/");
      if (!base || !quote) {
        if (isMounted) setLivePrice(null);
        return;
      }
      setIsPriceLoading(true);
      try {
        const baseKey = base.toLowerCase();
        const quoteKey = quote.toLowerCase();
        let price: number | null = null;
        const response = await fetch(
          `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${baseKey}.json`
        );
        const data = await response.json();
        const baseRates = data?.[baseKey];
        if (baseRates && typeof baseRates[quoteKey] !== "undefined") {
          price = Number(baseRates[quoteKey]);
        }
        if (isMounted) {
          setLivePrice(
            price
              ? price.toLocaleString(undefined, {
                  maximumFractionDigits: price >= 1 ? 4 : 8,
                })
              : null
          );
        }
      } catch (error) {
        if (isMounted) setLivePrice(null);
      } finally {
        if (isMounted) setIsPriceLoading(false);
      }
    };

    fetchPrice();

    return () => {
      isMounted = false;
    };
  }, [quickTrade.pair]);

  const handleQuickTrade = async () => {
    if (isSubmittingTrade) return;

    const amountNum = parseFloat(quickTrade.amount);
    if (!quickTrade.tradeType || !quickTrade.pair || !amountNum || amountNum <= 0) {
      toast.error("Enter a valid amount to trade");
      return;
    }

    if (user?.minTradingAmount && amountNum < user.minTradingAmount) {
      toast.error(`Minimum trading amount for your account is ${userCurrencySymbol}${user.minTradingAmount} (${userCurrencyCode})`);
      return;
    }

    const duration = parseFloat(quickTrade.durationMinutes);
    if (!duration || duration <= 0) {
      toast.error("Enter a valid duration in minutes");
      return;
    }

    if (quickTrade.isSwap && !quickTrade.swapPair) {
      toast.error("Enter a swap pair");
      return;
    }

    setIsSubmittingTrade(true);
    try {
      await userApi.trade({
        tradeType: quickTrade.tradeType,
        pair: quickTrade.pair,
        amount: amountNum,
        leverage: leverageValue,
        takeProfit: quickTrade.takeProfit ? parseFloat(quickTrade.takeProfit) : undefined,
        stopLoss: quickTrade.stopLoss ? parseFloat(quickTrade.stopLoss) : undefined,
        duration,
        direction: tradeSide,
        isSwap: quickTrade.isSwap,
        swapPair: quickTrade.isSwap && quickTrade.swapPair ? quickTrade.swapPair : undefined,
      });
      toast.success("Quick trade submitted");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Quick trade failed");
    } finally {
      setIsSubmittingTrade(false);
    }
  };

  const handlePairChange = (value: string) => {
    setQuickTrade((prev) => ({ ...prev, pair: value }));
  };

  return (
    <Card className={clsx("bg-background-darkest/80 border-none", className)}>
      <CardHeader className="pb-3 space-y-4">
        <Tabs value={tradeSide === "BUY" ? "buy" : "sell"} onValueChange={(val) => setTradeSide(val === "buy" ? "BUY" : "SELL")}>
          <TabsList className="grid grid-cols-3 bg-background-dark">
            <TabsTrigger value="buy" className="text-xs">
              Buy
            </TabsTrigger>
            <TabsTrigger value="sell" className="text-xs">
              Sell
            </TabsTrigger>
            <TabsTrigger value="convert" disabled className="text-xs">
              Convert
            </TabsTrigger>
          </TabsList>
          <TabsContent value="buy" className="pt-4" />
          <TabsContent value="sell" className="pt-4" />
          <TabsContent value="convert" className="pt-4" />
        </Tabs>
      </CardHeader>
      <CardContent className="space-y-4 text-xs md:text-sm">
        <div className="space-y-2">
          <Label htmlFor="qt-trade-type">Trade type</Label>
          <Select
            value={quickTrade.tradeType}
            onValueChange={(value) => setQuickTrade((prev) => ({ ...prev, tradeType: value }))}
          >
            <SelectTrigger id="qt-trade-type" className="h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Crypto">Crypto</SelectItem>
              <SelectItem value="CFD">CFD</SelectItem>
              <SelectItem value="Forex">Forex</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="qt-amount">Amount</Label>
          <div className="flex items-center gap-2 rounded-lg bg-background-dark border border-gray-800 px-3">
            <Input
              id="qt-amount"
              type="number"
              min="0"
              className="h-9 border-none bg-transparent px-0 text-xs flex-1"
              value={quickTrade.amount}
              onChange={(e) => setQuickTrade((prev) => ({ ...prev, amount: e.target.value }))}
            />
            <Select value={quickTrade.pair} onValueChange={handlePairChange}>
              <SelectTrigger className="h-7 w-28 text-[11px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pairs.map((pair) => (
                  <SelectItem key={pair} value={pair}>
                    {pair}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1 text-[11px] text-gray-400">
          <div className="flex justify-between">
            <span>Trading account balance:</span>
            <span>
              {(prioritizedBalance?.amount ?? 0).toLocaleString()}{" "}
              {prioritizedBalance?.currency || userCurrencyCode}
            </span>
          </div>
          <div className="flex justify-between">
            <span>
              Current {quickTrade.pair || "pair"} price:
            </span>
            <span className="text-emerald-400">
              {isPriceLoading
                ? "Loading..."
                : livePrice
                ? `${getCurrencySymbol(quoteSymbol)}${livePrice}`
                : "--"}
            </span>
          </div>
          {user?.minTradingAmount && (
            <div className="flex justify-between items-center pt-1 border-t border-gray-800">
              <span className="text-amber-400/80">Min. trading amount:</span>
              <span className="font-semibold text-amber-400">
                {userCurrencySymbol}{user.minTradingAmount.toLocaleString()} {userCurrencyCode}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] text-gray-400">
            <span>Leverage</span>
            <span className="font-semibold text-primary">{leverageValue.toFixed(0)}x</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-gray-500 justify-between">
            <span>0x</span>
            <span>25x</span>
            <span>50x</span>
            <span>75x</span>
            <span>100x</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative flex-1 h-10 rounded-lg bg-background-dark border border-gray-800 px-3 flex items-center">
              <div className="absolute left-3 right-3 h-1 rounded-full bg-gradient-to-r from-gray-500 via-emerald-400 via-yellow-300 to-red-500" />
              <div className="absolute inset-x-3 bottom-1.5 flex h-4 items-end pointer-events-none">
                {Array.from({ length: 21 }).map((_, index) => {
                  const value = index * 5;
                  const isMajor = value % 20 === 0;
                  let color = "#6b7280";
                  if (value >= 60 && value < 85) color = "#f97316";
                  if (value >= 85) color = "#ef4444";
                  return (
                    <div key={value} className="flex-1 flex justify-center">
                      <div
                        style={{
                          width: isMajor ? 2 : 1,
                          height: isMajor ? 16 : 8,
                          backgroundColor: color,
                          opacity: 0.8,
                        }}
                      />
                    </div>
                  );
                })}
              </div>
              <input
                type="range"
                min={1}
                max={100}
                value={leverageValue}
                onChange={(e) => setQuickTrade((prev) => ({ ...prev, leverage: e.target.value }))}
                className="relative z-10 w-full h-1 bg-transparent appearance-none cursor-pointer"
              />
              <style jsx>{`
                input[type="range"]::-webkit-slider-runnable-track {
                  height: 4px;
                  background: transparent;
                }
                input[type="range"]::-moz-range-track {
                  height: 4px;
                  background: transparent;
                }
                input[type="range"]::-webkit-slider-thumb {
                  -webkit-appearance: none;
                  appearance: none;
                  margin-top: -6px;
                  height: 16px;
                  width: 16px;
                  border-radius: 9999px;
                  background: #020617;
                  border: 2px solid #f97316;
                  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.35);
                }
                input[type="range"]::-moz-range-thumb {
                  height: 16px;
                  width: 16px;
                  border-radius: 9999px;
                  background: #020617;
                  border: 2px solid #f97316;
                  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.35);
                }
              `}</style>
            </div>
            <div className="px-3 py-1 rounded-md bg-background-dark border border-gray-800 text-[11px] text-gray-200">
              {leverageValue.toFixed(0)}x
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="qt-duration">Duration (minutes)</Label>
          <Input
            id="qt-duration"
            type="number"
            min="1"
            step="1"
            className="h-9 text-xs"
            value={quickTrade.durationMinutes}
            onChange={(e) => setQuickTrade((prev) => ({ ...prev, durationMinutes: e.target.value }))}
            placeholder="e.g., 15"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="space-y-2">
            <Label htmlFor="qt-take-profit">Take Profit (optional)</Label>
            <Input
              id="qt-take-profit"
              type="number"
              className="h-9"
              value={quickTrade.takeProfit}
              onChange={(e) => setQuickTrade((prev) => ({ ...prev, takeProfit: e.target.value }))}
              placeholder="Enter TP"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="qt-stop-loss">Stop Loss (optional)</Label>
            <Input
              id="qt-stop-loss"
              type="number"
              className="h-9"
              value={quickTrade.stopLoss}
              onChange={(e) => setQuickTrade((prev) => ({ ...prev, stopLoss: e.target.value }))}
              placeholder="Enter SL"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="qt-is-swap"
              checked={quickTrade.isSwap}
              onCheckedChange={(checked) =>
                setQuickTrade((prev) => ({ ...prev, isSwap: Boolean(checked) }))
              }
            />
            <Label htmlFor="qt-is-swap">Is Swap</Label>
          </div>
          {quickTrade.isSwap && (
            <div className="space-y-2">
              <Label htmlFor="qt-swap-pair">Swap Pair</Label>
              <Input
                id="qt-swap-pair"
                className="h-9 text-xs"
                value={quickTrade.swapPair}
                onChange={(e) => setQuickTrade((prev) => ({ ...prev, swapPair: e.target.value }))}
                placeholder="e.g., BTC/ETH"
                required
              />
            </div>
          )}
        </div>

        <Button className="w-full mt-2" disabled={isSubmittingTrade} onClick={handleQuickTrade}>
          {isSubmittingTrade ? "Submitting..." : tradeSide === "BUY" ? "Buy" : "Sell"}
        </Button>
      </CardContent>
    </Card>
  );
}


