"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { adminApi } from "@/lib/api/endpoints";
import { AdminUser, ExecuteTradeRequest, Trade } from "@/lib/types";
import { toast } from "react-toastify";
import { Edit } from "lucide-react";

type TradeStatus = "" | "open" | "closed" | "canceled";
type TradeResult = "" | "win" | "loss";

const TRADE_STATUSES: TradeStatus[] = ["", "open", "closed", "canceled"];
const TRADE_RESULTS: TradeResult[] = ["", "win", "loss"];

const isTradeStatus = (value: string): value is TradeStatus =>
  TRADE_STATUSES.includes(value as TradeStatus);

const isTradeResult = (value: string): value is TradeResult =>
  TRADE_RESULTS.includes(value as TradeResult);

export default function AdminTradesPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExecuteDialogOpen, setIsExecuteDialogOpen] = useState(false);
  const [isExecutingTrade, setIsExecutingTrade] = useState(false);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [formData, setFormData] = useState<{
    status: TradeStatus;
    result: TradeResult;
  }>({
    status: "",
    result: "",
  });
  const [executeForm, setExecuteForm] = useState<{
    userId: string;
    tradeType: string;
    pair: string;
    amount: string;
    leverage: string;
    duration: string;
    direction: "BUY" | "SELL";
    takeProfit: string;
    stopLoss: string;
    isSwap: boolean;
    swapPair: string;
    result: TradeResult;
  }>({
    userId: "",
    tradeType: "",
    pair: "",
    amount: "",
    leverage: "",
    duration: "",
    direction: "BUY",
    takeProfit: "",
    stopLoss: "",
    isSwap: false,
    swapPair: "",
    result: "",
  });

  useEffect(() => {
    loadTrades();
    loadUsers();
  }, []);

  const loadTrades = async () => {
    setIsLoading(true);
    try {
      const response = await adminApi.getTrades();
      // API client extracts data field, so response should be array directly
      const validTrades = Array.isArray(response) ? response : [];
      setTrades(validTrades);
    } catch (error: any) {
      console.error("Error loading trades:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to load trades");
      setTrades([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const response = await adminApi.getUsers();
      setUsers(Array.isArray(response) ? response : []);
    } catch (error: any) {
      console.error("Error loading users:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to load users");
      setUsers([]);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleStatusChange = (value: string) => {
    if (!isTradeStatus(value)) return;
    setFormData((prev) => ({ ...prev, status: value }));
  };

  const handleResultChange = (value: string) => {
    if (!isTradeResult(value)) return;
    setFormData((prev) => ({ ...prev, result: value }));
  };

  const resetExecuteForm = () =>
    setExecuteForm({
      userId: "",
      tradeType: "",
      pair: "",
      amount: "",
      leverage: "",
      duration: "",
      direction: "BUY",
      takeProfit: "",
      stopLoss: "",
      isSwap: false,
      swapPair: "",
      result: "",
    });

  const closeExecuteDialog = () => {
    setIsExecuteDialogOpen(false);
    resetExecuteForm();
  };

  const handleExecuteTrade = async () => {
    if (!executeForm.userId) {
      toast.error("Select a user to execute the trade for");
      return;
    }
    if (!executeForm.tradeType.trim() || !executeForm.pair.trim()) {
      toast.error("Trade type and pair are required");
      return;
    }
    if (!executeForm.result) {
      toast.error("Select a trade result");
      return;
    }

    const amountValue = parseFloat(executeForm.amount);
    const leverageValue = parseFloat(executeForm.leverage);
    const durationValue = parseFloat(executeForm.duration);
    const takeProfitValue = parseFloat(executeForm.takeProfit);
    const stopLossValue = parseFloat(executeForm.stopLoss);

    if (Number.isNaN(amountValue) || amountValue <= 0) {
      toast.error("Enter a valid amount greater than zero");
      return;
    }
    if (Number.isNaN(leverageValue) || leverageValue < 0 || leverageValue > 100) {
      toast.error("Leverage must be between 0 and 100");
      return;
    }
    if (Number.isNaN(durationValue) || durationValue <= 0) {
      toast.error("Duration must be greater than zero");
      return;
    }
    if (executeForm.isSwap && !executeForm.swapPair.trim()) {
      toast.error("Swap pair is required when swap mode is enabled");
      return;
    }

    const payload: ExecuteTradeRequest = {
      userId: executeForm.userId,
      tradeType: executeForm.tradeType.trim(),
      pair: executeForm.pair.trim(),
      amount: amountValue,
      leverage: leverageValue,
      duration: durationValue,
      direction: executeForm.direction,
      result: executeForm.result as "win" | "loss",
    };

    if (!Number.isNaN(takeProfitValue)) {
      payload.takeProfit = takeProfitValue;
    }
    if (!Number.isNaN(stopLossValue)) {
      payload.stopLoss = stopLossValue;
    }
    if (executeForm.isSwap) {
      payload.isSwap = true;
      payload.swapPair = executeForm.swapPair.trim();
    } else if (executeForm.isSwap === false) {
      payload.isSwap = false;
    }

    setIsExecutingTrade(true);
    try {
      await adminApi.executeTrade(payload);
      toast.success("Trade executed successfully");
      closeExecuteDialog();
      loadTrades();
    } catch (error: any) {
      console.error("Error executing trade:", error);
      toast.error(error.response?.data?.message || "Failed to execute trade");
    } finally {
      setIsExecutingTrade(false);
    }
  };

  const handleUpdateTrade = async () => {
    if (!selectedTrade?._id) return;
    setIsSubmitting(true);
    try {
      const updateData: any = {};
      if (formData.status) updateData.status = formData.status;
      if (formData.result) updateData.result = formData.result;
      await adminApi.updateTrade(selectedTrade._id, updateData);
      toast.success("Trade updated successfully");
      setSelectedTrade(null);
      loadTrades();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update trade");
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
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Trades</h1>
          <p className="text-gray-400 mt-2">
            Manage all platform trades
          </p>
        </div>
        <Button onClick={() => setIsExecuteDialogOpen(true)}>
          Execute Trade
        </Button>
      </div>
      <Dialog open={isExecuteDialogOpen} onOpenChange={(open) => (open ? setIsExecuteDialogOpen(true) : closeExecuteDialog())}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Execute Trade</DialogTitle>
            <DialogDescription>
              Execute a trade immediately for a selected user and settle the result.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>User</Label>
              <Select
                value={executeForm.userId}
                onValueChange={(value) => setExecuteForm((prev) => ({ ...prev, userId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isLoadingUsers ? "Loading users..." : "Select a user"} />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user._id} value={user._id}>
                      {user.firstName} {user.lastName} ({user.email})
                    </SelectItem>
                  ))}
                  {users.length === 0 && !isLoadingUsers && (
                    <SelectItem value="no-users" disabled>
                      No users available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tradeType">Trade Type</Label>
                <Input
                  id="tradeType"
                  value={executeForm.tradeType}
                  onChange={(e) => setExecuteForm((prev) => ({ ...prev, tradeType: e.target.value }))}
                  placeholder="e.g. Spot"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pair">Pair</Label>
                <Input
                  id="pair"
                  value={executeForm.pair}
                  onChange={(e) => setExecuteForm((prev) => ({ ...prev, pair: e.target.value }))}
                  placeholder="e.g. BTC/USD"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={executeForm.amount}
                  onChange={(e) => setExecuteForm((prev) => ({ ...prev, amount: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="leverage">Leverage (0-100)</Label>
                <Input
                  id="leverage"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={executeForm.leverage}
                  onChange={(e) => setExecuteForm((prev) => ({ ...prev, leverage: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (hours)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="0"
                  step="1"
                  value={executeForm.duration}
                  onChange={(e) => setExecuteForm((prev) => ({ ...prev, duration: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Direction</Label>
                <Select
                  value={executeForm.direction}
                  onValueChange={(value: "BUY" | "SELL") =>
                    setExecuteForm((prev) => ({ ...prev, direction: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BUY">Buy</SelectItem>
                    <SelectItem value="SELL">Sell</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Result</Label>
                <Select
                  value={executeForm.result}
                  onValueChange={(value) => setExecuteForm((prev) => ({ ...prev, result: value as TradeResult }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select result" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="win">Win</SelectItem>
                    <SelectItem value="loss">Loss</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="takeProfit">Take Profit</Label>
                <Input
                  id="takeProfit"
                  type="number"
                  step="0.01"
                  value={executeForm.takeProfit}
                  onChange={(e) => setExecuteForm((prev) => ({ ...prev, takeProfit: e.target.value }))}
                  placeholder="Optional"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stopLoss">Stop Loss</Label>
                <Input
                  id="stopLoss"
                  type="number"
                  step="0.01"
                  value={executeForm.stopLoss}
                  onChange={(e) => setExecuteForm((prev) => ({ ...prev, stopLoss: e.target.value }))}
                  placeholder="Optional"
                />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-md border border-border px-4 py-3">
              <div>
                <Label htmlFor="isSwap">Enable Swap</Label>
                <p className="text-xs text-gray-400">Toggle if this trade is a swap and requires an alternate pair.</p>
              </div>
              <Switch
                id="isSwap"
                checked={executeForm.isSwap}
                onCheckedChange={(checked) =>
                  setExecuteForm((prev) => ({
                    ...prev,
                    isSwap: checked,
                    swapPair: checked ? prev.swapPair : "",
                  }))
                }
              />
            </div>
            {executeForm.isSwap && (
              <div className="space-y-2">
                <Label htmlFor="swapPair">Swap Pair</Label>
                <Input
                  id="swapPair"
                  value={executeForm.swapPair}
                  onChange={(e) => setExecuteForm((prev) => ({ ...prev, swapPair: e.target.value }))}
                  placeholder="e.g. ETH/USD"
                />
              </div>
            )}
            <Button onClick={handleExecuteTrade} disabled={isExecutingTrade} className="w-full">
              {isExecutingTrade ? "Executing..." : "Execute Trade"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Card className="overflow-hidden max-w-full">
        <CardHeader>
          <CardTitle>All Trades</CardTitle>
        </CardHeader>
        <CardContent className="max-w-full" style={{ minWidth: 0 }}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Pair</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Direction</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Result</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
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
                  <TableRow key={trade?._id || 'unknown'}>
                    <TableCell>{trade?.tradeType || 'N/A'}</TableCell>
                    <TableCell>{trade?.pair || 'N/A'}</TableCell>
                    <TableCell>${(trade?.amount ?? 0).toLocaleString()}</TableCell>
                    <TableCell>{(trade?.direction || '').toUpperCase()}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          trade?.status === "open"
                            ? "bg-primary/20 text-primary"
                            : trade?.status === "closed"
                            ? "bg-green-500/20 text-green-500"
                            : "bg-background-dark text-gray-400"
                        }`}
                      >
                        {trade?.status || 'open'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {trade?.result && (
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            trade.result === "win"
                              ? "bg-green-500/20 text-green-500"
                              : trade.result === "loss"
                              ? "bg-error/20 text-error"
                              : "bg-yellow-500/20 text-yellow-500"
                          }`}
                        >
                          {trade.result}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {trade?.createdAt ? new Date(trade.createdAt).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (!trade?._id) return;
                              setSelectedTrade(trade);
                              setFormData({
                                status: trade?.status || "",
                                result: trade?.result || "",
                              });
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Update Trade</DialogTitle>
                            <DialogDescription>
                              Update trade status and result
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Status</label>
                              <Select value={formData.status} onValueChange={handleStatusChange}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="open">Open</SelectItem>
                                  <SelectItem value="closed">Closed</SelectItem>
                                  <SelectItem value="canceled">Canceled</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Result</label>
                              <Select value={formData.result} onValueChange={handleResultChange}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select result" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="win">Win</SelectItem>
                                  <SelectItem value="loss">Loss</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <Button
                              onClick={handleUpdateTrade}
                              disabled={isSubmitting}
                              className="w-full"
                            >
                              {isSubmitting ? "Updating..." : "Update Trade"}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );
}

