"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { QuickTradePanel } from "@/components/trading/QuickTradePanel";
import { TradingViewWidget } from "@/components/trading/TradingViewWidget";
import { formatPairToTradingViewSymbol } from "@/lib/utils";
import { getStoredTradePair, setStoredTradePair } from "@/lib/storage/tradePair";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { balances, setBalances } = useUserStore();
  const [isLoading, setIsLoading] = useState(true);
  const [chartPair, setChartPair] = useState<string>(getStoredTradePair() || "BTC/USD");
  const chartSymbol = formatPairToTradingViewSymbol(chartPair);
  const selectablePairs = useMemo(() => Array.from(new Set([chartPair, "BTC/USD", "ETH/USD", "SOL/USD"])), [chartPair]);

  const loadData = async (): Promise<void> => {
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

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (chartPair) {
      setStoredTradePair(chartPair);
    }
  }, [chartPair]);

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
          <CardContent className="max-w-full h-full" style={{ minWidth: 0 }}>
            <div className="relative w-full aspect-[9/16] lg:aspect-[16/9] rounded-xl border border-gray-800 bg-background-dark overflow-hidden">
              <TradingViewWidget symbol={chartSymbol} className="absolute inset-0" />
            </div>
          </CardContent>
        </Card>

        <QuickTradePanel
          balances={balances}
          initialPair={chartPair}
          onPairChange={setChartPair}
          pairs={selectablePairs}
          className="bg-background-darkest/80"
        />
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

