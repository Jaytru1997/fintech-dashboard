"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useAuthStore } from "@/stores/auth";
import { useUserStore } from "@/stores/user";
import { userApi } from "@/lib/api/endpoints";
import {
  Wallet,
  TrendingUp,
  Activity,
  ArrowDownCircle,
  ArrowUpCircle,
  PieChart,
} from "lucide-react";
import Link from "next/link";
import { toast } from "react-toastify";
import { SignalStrengthBar } from "@/components/ui/SignalStrengthBar";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { balances, setBalances } = useUserStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingTrade, setIsSubmittingTrade] = useState(false);
  const [tradeSide, setTradeSide] = useState<"BUY" | "SELL">("BUY");
  const [quickTrade, setQuickTrade] = useState({
    tradeType: "Crypto",
    pair: "BTC/USD",
    amount: "100",
    leverage: "5",
    durationMinutes: "2",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // If balances are already available from login, use them and skip API call
    if (balances) {
      setIsLoading(false);
      return;
    }

    // Also check if balances are in user object from auth store
    if (user?.balances) {
      setBalances(user.balances);
      setIsLoading(false);
      return;
    }

    // Only fetch if balances are not available
    try {
      const balancesData = await userApi.getBalances();
      setBalances(balancesData);
    } catch (error) {
      toast.error("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  const leverageValue = useMemo(
    () => Math.min(100, Math.max(1, Number(quickTrade.leverage) || 1)),
    [quickTrade.leverage]
  );

  const handleQuickTrade = async () => {
    if (isSubmittingTrade) return;
    const amountNum = parseFloat(quickTrade.amount);
    if (!quickTrade.tradeType || !quickTrade.pair || !amountNum || amountNum <= 0) {
      toast.error("Enter a valid amount to trade");
      return;
    }
    setIsSubmittingTrade(true);
    try {
      const durationMinutes = parseInt(quickTrade.durationMinutes, 10) || 2;
      const durationHours = durationMinutes / 60;
      await userApi.trade({
        tradeType: quickTrade.tradeType,
        pair: quickTrade.pair,
        amount: amountNum,
        leverage: leverageValue,
        duration: durationHours,
        direction: tradeSide,
      });
      toast.success("Quick trade submitted");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Quick trade failed");
    } finally {
      setIsSubmittingTrade(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-2">
          Manage your balances, monitor markets, and execute trades.
        </p>
      </div>

      {/* Top strip: total balance + top assets + right info panel */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-6">
        {/* Left: balances / top assets */}
        <Card className="bg-background-darkest/80 border-none">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 flex items-center gap-2">
                  Total Balance
                </p>
                <p className="mt-1 text-3xl font-semibold text-white">
                  ${balances?.main?.amount?.toLocaleString() || "0"}
                </p>
              </div>
              <Link href="/dashboard/deposits">
                <Button size="sm" variant="outline" className="border-primary/40 text-primary">
                  <ArrowDownCircle className="h-4 w-4 mr-2" />
                  Move money
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span className="uppercase tracking-wide">Top Assets</span>
              <Link href="/dashboard/assets" className="text-primary text-[11px]">
                View all assets &rsaquo;
              </Link>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Bitcoin</p>
                  <p className="text-gray-500 text-xs">BTC</p>
                </div>
                <div className="text-right text-xs text-gray-400">
                  <p>$0.00</p>
                  <p>0.0000 BTC</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Ethereum</p>
                  <p className="text-gray-500 text-xs">ETH</p>
                </div>
                <div className="text-right text-xs text-gray-400">
                  <p>$0.00</p>
                  <p>0.0000 ETH</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Solana</p>
                  <p className="text-gray-500 text-xs">SOL</p>
                </div>
                <div className="text-right text-xs text-gray-400">
                  <p>$0.00</p>
                  <p>0.0000 SOL</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Apple</p>
                  <p className="text-gray-500 text-xs">AAPL</p>
                </div>
                <div className="text-right text-xs text-gray-400">
                  <p>$0.00</p>
                  <p>0.0000 AAPL</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right: categories / progress / signal strength */}
        <Card className="bg-background-darkest/80 border-none">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 flex items-center gap-2">
                  <PieChart className="h-4 w-4" />
                  Categories
                </p>
              </div>
              <Link href="/dashboard/deposits" className="text-primary text-[11px]">
                Deposit now
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-gray-500">
              No categories yet. Deposit now to see your portfolio breakdown.
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>Trading progress</span>
                <span>0%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-gray-800 overflow-hidden">
                <div className="h-full w-0 bg-emerald-500" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>Signal strength</span>
                <span>{user?.signalStrength || 0}%</span>
              </div>
              <SignalStrengthBar value={user?.signalStrength || 0} />
            </div>
            <div className="space-y-2 pt-2 border-t border-gray-800/60 mt-2">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>KYC Status</span>
                <span
                  className={`font-medium ${
                    user?.kycStatus === "approved" ? "text-emerald-400" : "text-gray-400"
                  }`}
                >
                  {user?.kycStatus || "Pending"}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>2FA</span>
                <span
                  className={`font-medium ${
                    user?.twoFactorEnabled ? "text-emerald-400" : "text-gray-400"
                  }`}
                >
                  {user?.twoFactorEnabled ? "Enabled" : "Disabled"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Middle: chart + compact trade execution, side by side on large screens */}
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,2.2fr)_minmax(0,1.1fr)] gap-6">
        <Card className="overflow-hidden bg-background-darkest/80 border-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-300">Market chart</CardTitle>
          </CardHeader>
          <CardContent className="max-w-full" style={{ minWidth: 0 }}>
            <div className="relative h-[260px] md:h-[320px] rounded-xl border border-gray-800 bg-background-dark overflow-hidden">
              {/* This is a placeholder for a full TradingView chart embed */}
              <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_0%_0%,#22c55e_0,transparent_55%),radial-gradient(circle_at_100%_100%,#0ea5e9_0,transparent_55%)]" />
              <div className="relative z-10 flex h-full items-center justify-center">
                <p className="text-xs md:text-sm text-gray-300 text-center px-6">
                  Connect your TradingView chart here to mirror live price action across your
                  favourite markets.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-background-darkest/80 border-none">
          <CardHeader className="pb-3 space-y-4">
            <Tabs
              value={tradeSide === "BUY" ? "buy" : "sell"}
              onValueChange={(val) => setTradeSide(val === "buy" ? "BUY" : "SELL")}
            >
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
                onValueChange={(value) =>
                  setQuickTrade((prev) => ({ ...prev, tradeType: value }))
                }
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
                  onChange={(e) =>
                    setQuickTrade((prev) => ({ ...prev, amount: e.target.value }))
                  }
                />
                <Select
                  value={quickTrade.pair}
                  onValueChange={(value) =>
                    setQuickTrade((prev) => ({ ...prev, pair: value }))
                  }
                >
                  <SelectTrigger className="h-7 w-28 text-[11px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BTC/USD">BTC</SelectItem>
                    <SelectItem value="ETH/USD">ETH</SelectItem>
                    <SelectItem value="SOL/USD">SOL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1 text-[11px] text-gray-400">
              <div className="flex justify-between">
                <span>Current USD balance:</span>
                <span>
                  {balances?.main?.amount?.toLocaleString() || 0}{" "}
                  {balances?.main?.currency || "USD"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Current BTC price:</span>
                <span className="text-emerald-400">$--,--</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] text-gray-400">
                <span>Leverage</span>
                <span className="font-semibold text-primary">
                  {leverageValue.toFixed(0)}x
                </span>
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
                  {/* Ruler backdrop */}
                  <div className="absolute left-3 right-3 h-1 rounded-full bg-gradient-to-r from-gray-500 via-emerald-400 via-yellow-300 to-red-500" />
                  {/* Graduated ticks every 5x, major every 20x */}
                  <div className="absolute inset-x-3 bottom-1.5 flex h-4 items-end pointer-events-none">
                    {Array.from({ length: 21 }).map((_, index) => {
                      const value = index * 5; // 0..100
                      const isMajor = value % 20 === 0;
                      let color = "#6b7280"; // ash / gray
                      if (value >= 60 && value < 85) color = "#f97316"; // orange
                      if (value >= 85) color = "#ef4444"; // red
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
                  {/* Continuous slider on top, like an accelerator */}
                  <input
                    type="range"
                    min={1}
                    max={100}
                    value={leverageValue}
                    onChange={(e) =>
                      setQuickTrade((prev) => ({ ...prev, leverage: e.target.value }))
                    }
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
              <Label htmlFor="qt-duration">Duration</Label>
              <Select
                value={quickTrade.durationMinutes}
                onValueChange={(value) =>
                  setQuickTrade((prev) => ({ ...prev, durationMinutes: value }))
                }
              >
                <SelectTrigger id="qt-duration" className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 minutes</SelectItem>
                  <SelectItem value="5">5 minutes</SelectItem>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              className="w-full mt-2"
              disabled={isSubmittingTrade}
              onClick={handleQuickTrade}
            >
              {isSubmittingTrade
                ? "Submitting..."
                : tradeSide === "BUY"
                ? "Buy"
                : "Sell"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Bottom: quick actions + trades summary placeholder */}
      <div className="grid grid-cols-1">
        <Card className="bg-background-darkest/80 border-none overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-white">My trades</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-gray-400">
            <div className="flex gap-2 text-xs">
              <span className="px-3 py-1 rounded-full bg-primary text-white">All</span>
              <span className="px-3 py-1 rounded-full bg-background-dark border border-gray-700">
                Swaps
              </span>
              <span className="px-3 py-1 rounded-full bg-background-dark border border-gray-700">
                Auto
              </span>
            </div>
            <div className="space-y-3 border-t border-gray-800 pt-3">
              <p className="text-xs text-gray-500 uppercase">Open (0)</p>
              <p className="text-xs text-gray-500">No open trades yet.</p>
            </div>
            <div className="space-y-3 border-t border-gray-800 pt-3">
              <p className="text-xs text-gray-500 uppercase">Closed (0)</p>
              <p className="text-xs text-gray-500">No closed trades yet.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

