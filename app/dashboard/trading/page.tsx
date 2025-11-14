"use client";

import { useEffect, useState } from "react";
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
    direction: "long" as "long" | "short",
    isSwap: false,
  });

  useEffect(() => {
    loadTrades();
  }, []);

  const loadTrades = async () => {
    try {
      const data = await userApi.getTrades();
      setTrades(data);
    } catch (error) {
      toast.error("Failed to load trades");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await userApi.trade({
        ...formData,
        amount: parseFloat(formData.amount),
        leverage: parseFloat(formData.leverage),
        takeProfit: formData.takeProfit ? parseFloat(formData.takeProfit) : undefined,
        stopLoss: formData.stopLoss ? parseFloat(formData.stopLoss) : undefined,
        duration: parseInt(formData.duration),
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
        direction: "long",
        isSwap: false,
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
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold text-white">Trading</h1>
        <p className="text-gray-400 mt-2">
          Execute trades and manage your trading portfolio
        </p>
      </div>

      <Tabs defaultValue="execute" className="space-y-4">
        <TabsList>
          <TabsTrigger value="execute">Execute Trade</TabsTrigger>
          <TabsTrigger value="history">Trade History</TabsTrigger>
        </TabsList>

        <TabsContent value="execute" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                New Trade
              </CardTitle>
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
                    <Input
                      id="leverage"
                      type="number"
                      min="1"
                      value={formData.leverage}
                      onChange={(e) => setFormData({ ...formData, leverage: e.target.value })}
                      placeholder="Enter leverage"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="direction">Direction</Label>
                    <Select
                      value={formData.direction}
                      onValueChange={(value: "long" | "short") => setFormData({ ...formData, direction: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="long">Long</SelectItem>
                        <SelectItem value="short">Short</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      min="1"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      placeholder="Enter duration"
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

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isSwap"
                    checked={formData.isSwap}
                    onCheckedChange={(checked) => setFormData({ ...formData, isSwap: checked as boolean })}
                  />
                  <Label htmlFor="isSwap">Is Swap</Label>
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Executing..." : "Execute Trade"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Trade History</CardTitle>
            </CardHeader>
            <CardContent>
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
                              trade.direction === "long"
                                ? "bg-primary/20 text-primary"
                                : "bg-error/20 text-error"
                            }`}
                          >
                            {trade.direction.toUpperCase()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              trade.status === "active"
                                ? "bg-primary/20 text-primary"
                                : trade.status === "completed"
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

