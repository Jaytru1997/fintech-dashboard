"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { adminApi } from "@/lib/api/endpoints";
import { Trade } from "@/lib/types";
import { toast } from "react-toastify";
import { Edit } from "lucide-react";

export default function AdminTradesPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    status: "",
    result: "" as "win" | "loss" | "",
  });

  useEffect(() => {
    loadTrades();
  }, []);

  const loadTrades = async () => {
    setIsLoading(true);
    try {
      const response = await adminApi.getTrades();
      // Handle different response structures
      let data = response;
      if (response && typeof response === 'object' && 'data' in response && Array.isArray(response.data)) {
        data = response.data;
      } else if (response && typeof response === 'object' && 'trades' in response && Array.isArray(response.trades)) {
        data = response.trades;
      }
      
      // Ensure data is always an array and filter out any null/undefined entries
      const validTrades = Array.isArray(data) 
        ? data.filter((trade): trade is Trade => trade != null && typeof trade === 'object' && ('_id' in trade || 'id' in trade))
          .map((trade: any) => {
            if ('id' in trade && !('_id' in trade)) {
              const { id, ...rest } = trade;
              return { ...rest, _id: id } as Trade;
            }
            return trade as Trade;
          })
        : [];
      setTrades(validTrades);
    } catch (error: any) {
      console.error("Error loading trades:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to load trades");
      // Ensure trades is always an array even on error
      setTrades([]);
    } finally {
      setIsLoading(false);
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
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-semibold text-white">Trades</h1>
        <p className="text-gray-400 mt-2">
          Manage all platform trades
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Trades</CardTitle>
        </CardHeader>
        <CardContent>
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
                          trade?.status === "active"
                            ? "bg-primary/20 text-primary"
                            : trade?.status === "completed"
                            ? "bg-green-500/20 text-green-500"
                            : "bg-background-dark text-gray-400"
                        }`}
                      >
                        {trade?.status || 'pending'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {trade?.result && (
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
                              <Select
                                value={formData.status}
                                onValueChange={(value) =>
                                  setFormData({ ...formData, status: value })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="active">Active</SelectItem>
                                  <SelectItem value="completed">Completed</SelectItem>
                                  <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Result</label>
                              <Select
                                value={formData.result}
                                onValueChange={(value) =>
                                  setFormData({ ...formData, result: value as "win" | "loss" })
                                }
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

