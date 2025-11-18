"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { userApi } from "@/lib/api/endpoints";
import { Trade } from "@/lib/types";
import { toast } from "react-toastify";
import { TrendingUp } from "lucide-react";

const tradePairs = ["BTC/USD", "ETH/USD", "EUR/USD", "GBP/USD"];
const tradeTypes = ["CFD", "Forex", "Crypto"];

export default function TradingPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    tradeType: "",
    pair: "",
    amount: "",
    leverage: "1",
    takeProfit: "",
    stopLoss: "",
    duration: "",
    direction: "BUY" as "BUY" | "SELL",
    isSwap: false,
    swapPair: "",
  });

  const leverageValue = useMemo(
    () => Math.min(100, Math.max(1, Number(formData.leverage) || 1)),
    [formData.leverage]
  );

  useEffect(() => {
    loadTrades();
  }, []);

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

  const handleTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await userApi.trade({
        tradeType: formData.tradeType,
        pair: formData.pair,
        amount: parseFloat(formData.amount),
        leverage: leverageValue,
        takeProfit: formData.takeProfit ? parseFloat(formData.takeProfit) : undefined,
        stopLoss: formData.stopLoss ? parseFloat(formData.stopLoss) : undefined,
        duration: parseInt(formData.duration), // Duration in hours
        direction: formData.direction,
        isSwap: formData.isSwap,
        swapPair: formData.isSwap && formData.swapPair ? formData.swapPair : undefined,
      });
      toast.success("Trade executed successfully!");
      setFormData({
        tradeType: "",
        pair: "",
        amount: "",
        leverage: "1",
        takeProfit: "",
        stopLoss: "",
        duration: "",
        direction: "BUY",
        isSwap: false,
        swapPair: "",
      });
      loadTrades();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Trade execution failed");
    } finally {
      setIsSubmitting(false);
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

        <TabsContent value="execute" className="space-y-4">
          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] gap-4">
            <Card className="order-2 xl:order-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  New Trade
                </CardTitle>
                <CardDescription>
                  Configure position size, direction, and risk with a tactile leverage control.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleTrade} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tradeType">Trade Type</Label>
                    <Select
                      value={formData.tradeType}
                      onValueChange={(value) => setFormData({ ...formData, tradeType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select trade type" />
                      </SelectTrigger>
                      <SelectContent>
                        {tradeTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pair">Pair</Label>
                    <Select
                      value={formData.pair}
                      onValueChange={(value) => setFormData({ ...formData, pair: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select pair" />
                      </SelectTrigger>
                      <SelectContent>
                        {tradePairs.map((pair) => (
                          <SelectItem key={pair} value={pair}>
                            {pair}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      min="0"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="Enter amount"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="leverage">Leverage</Label>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-gray-400">
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
                          {/* Continuous slider on top */}
                          <input
                            id="leverage"
                            type="range"
                            min={1}
                            max={100}
                            value={leverageValue}
                            onChange={(e) =>
                              setFormData({ ...formData, leverage: e.target.value })
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
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="direction">Direction</Label>
                    <Select
                      value={formData.direction}
                      onValueChange={(value: "BUY" | "SELL") => setFormData({ ...formData, direction: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BUY">BUY</SelectItem>
                        <SelectItem value="SELL">SELL</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (hours)</Label>
                    <Input
                      id="duration"
                      type="number"
                      min="1"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      placeholder="Enter duration in hours"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="takeProfit">Take Profit (optional)</Label>
                    <Input
                      id="takeProfit"
                      type="number"
                      value={formData.takeProfit}
                      onChange={(e) => setFormData({ ...formData, takeProfit: e.target.value })}
                      placeholder="Enter take profit"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stopLoss">Stop Loss (optional)</Label>
                    <Input
                      id="stopLoss"
                      type="number"
                      value={formData.stopLoss}
                      onChange={(e) => setFormData({ ...formData, stopLoss: e.target.value })}
                      placeholder="Enter stop loss"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isSwap"
                      checked={formData.isSwap}
                      onCheckedChange={(checked) => setFormData({ ...formData, isSwap: checked as boolean })}
                    />
                    <Label htmlFor="isSwap">Is Swap</Label>
                  </div>
                  {formData.isSwap && (
                    <div className="space-y-2">
                      <Label htmlFor="swapPair">Swap Pair</Label>
                      <Input
                        id="swapPair"
                        value={formData.swapPair}
                        onChange={(e) => setFormData({ ...formData, swapPair: e.target.value })}
                        placeholder="e.g., BTC/ETH"
                        required={formData.isSwap}
                      />
                    </div>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Executing..." : "Execute Trade"}
                </Button>
              </form>
            </CardContent>
            </Card>

            {/* Right side: futuristic chart placeholder / TradingView iframe */}
            <Card className="order-1 xl:order-2">
              <CardHeader>
                <CardTitle>Live Market View</CardTitle>
                <CardDescription>
                  Embed your preferred TradingView or custom chart here for full-screen execution.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative w-full h-[260px] md:h-[320px] rounded-xl border border-primary/30 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
                  <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_0%_0%,#22c55e_0,transparent_55%),radial-gradient(circle_at_100%_100%,#0ea5e9_0,transparent_55%)]" />
                  <div className="relative z-10 flex h-full items-center justify-center">
                    <p className="text-xs md:text-sm text-gray-300 text-center px-6">
                      TradingView advanced chart embed goes here. Connect it to the selected{" "}
                      <span className="font-semibold text-white">
                        {formData.pair || "market"}
                      </span>{" "}
                      to mirror professional trading terminals.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
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

