"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { userApi } from "@/lib/api/endpoints";
import { Trade } from "@/lib/types";
import { toast } from "react-toastify";
import { QuickTradePanel } from "@/components/trading/QuickTradePanel";
import { TradingViewWidget } from "@/components/trading/TradingViewWidget";
import { formatPairToTradingViewSymbol, mapTradingViewSymbolToPair } from "@/lib/utils";
import { useUserStore } from "@/stores/user";
import { useSearchParams } from "next/navigation";

const tradePairs = ["BTC/USD", "ETH/USD", "EUR/USD", "GBP/USD"];

export default function TradingPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { balances } = useUserStore();
  const searchParams = useSearchParams();
  const symbolFromQuery = searchParams.get("symbol") || undefined;
  const pairFromSymbol = mapTradingViewSymbolToPair(symbolFromQuery);
  const defaultPair = pairFromSymbol || tradePairs[0];
  const [chartPair, setChartPair] = useState(defaultPair);
  const chartSymbol = formatPairToTradingViewSymbol(chartPair);

  const selectablePairs = useMemo(() => Array.from(new Set([chartPair, ...tradePairs])), [chartPair]);

  useEffect(() => {
    loadTrades();
  }, []);

  useEffect(() => {
    if (pairFromSymbol) {
      setChartPair(pairFromSymbol);
    }
  }, [pairFromSymbol]);

  const loadTrades = async () => {
    try {
      const data = await userApi.getTrades();
      // Ensure data is always an array
      setTrades(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Failed to load trades");
      // Ensure trades is always an array even on error
      setTrades([]);
    } finally {
      setIsLoading(false);
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
      className="space-y-6 max-w-full overflow-x-hidden"
      style={{ minWidth: 0 }}
    >
      <div>
        <h1 className="text-2xl font-semibold text-white">Trading</h1>
        <p className="text-gray-400 mt-2">
          Execute trades and manage your trading portfolio
        </p>
      </div>

      {/* Simple market ticker row */}
      <Card className="overflow-hidden">
        <CardContent className="py-3">
          <div className="flex flex-nowrap gap-6 animate-[marquee_40s_linear_infinite] whitespace-nowrap text-xs md:text-sm">
            {tradePairs.map((pair, idx) => (
              <div key={pair + idx} className="flex items-center gap-2 text-gray-300">
                <span className="font-semibold text-white">{pair}</span>
                <span className="text-emerald-400">+{(Math.random() * 2).toFixed(2)}%</span>
                <span className="text-gray-500">|</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="execute" className="space-y-4">
        <TabsList>
          <TabsTrigger value="execute">Execute Trade</TabsTrigger>
          <TabsTrigger value="history">Trade History</TabsTrigger>
        </TabsList>

        <TabsContent value="execute" className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,2.2fr)_minmax(0,1.1fr)] gap-4">
            <Card className="overflow-hidden bg-background-darkest/80 border-none">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-gray-300">Live Market Chart</CardTitle>
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
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card className="overflow-hidden max-w-full">
            <CardHeader>
              <CardTitle>Trade History</CardTitle>
            </CardHeader>
            <CardContent className="max-w-full" style={{ minWidth: 0 }}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Pair</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Leverage</TableHead>
                    <TableHead>Direction</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trades.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-gray-400">
                        No trades found
                      </TableCell>
                    </TableRow>
                  ) : (
                    trades.map((trade) => (
                      <TableRow key={trade._id}>
                        <TableCell>{trade.tradeType}</TableCell>
                        <TableCell>{trade.pair}</TableCell>
                        <TableCell>${trade.amount.toLocaleString()}</TableCell>
                        <TableCell>{trade.leverage}x</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              trade.direction === "BUY"
                                ? "bg-primary/20 text-primary"
                                : "bg-error/20 text-error"
                            }`}
                          >
                            {trade.direction}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              trade.status === "open"
                                ? "bg-primary/20 text-primary"
                                : trade.status === "closed"
                                ? "bg-green-500/20 text-green-500"
                                : "bg-background-dark text-gray-400"
                            }`}
                          >
                            {trade.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          {trade.result && (
                            <span
                              className={`px-2 py-1 rounded text-xs ${
                                trade.result === "win"
                                  ? "bg-green-500/20 text-green-500"
                                  : "bg-error/20 text-error"
                              }`}
                            >
                              {trade.result}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(trade.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}

