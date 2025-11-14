"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { adminApi } from "@/lib/api/endpoints";
import { Withdrawal } from "@/lib/types";
import { toast } from "react-toastify";
import { Check, X, Key } from "lucide-react";

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadWithdrawals();
  }, []);

  const loadWithdrawals = async () => {
    try {
      const data = await adminApi.getWithdrawals();
      setWithdrawals(data);
    } catch (error) {
      toast.error("Failed to load withdrawals");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateCode = async (id: string) => {
    try {
      const response = await adminApi.generateWithdrawalCode(id);
      toast.success(`Withdrawal code: ${response.code}`);
      loadWithdrawals();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to generate code");
    }
  };

  const handleStatusUpdate = async (id: string, status: "approved" | "rejected") => {
    try {
      await adminApi.updateWithdrawalStatus(id, { status });
      toast.success(`Withdrawal ${status}`);
      loadWithdrawals();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update withdrawal");
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
        <h1 className="text-3xl font-bold text-white">Withdrawals</h1>
        <p className="text-gray-400 mt-2">
          Review and manage withdrawal requests
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Withdrawals</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Method</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {withdrawals.length === 0 ? (
                <TableRow>
                      <TableCell colSpan={7} className="text-center text-gray-400">
                    No withdrawals found
                  </TableCell>
                </TableRow>
              ) : (
                withdrawals.map((withdrawal) => (
                  <TableRow key={withdrawal._id}>
                    <TableCell>{withdrawal.method}</TableCell>
                    <TableCell>{withdrawal.amount.toLocaleString()}</TableCell>
                    <TableCell>{withdrawal.currency}</TableCell>
                    <TableCell className="max-w-xs truncate">{withdrawal.details}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          withdrawal.status === "approved"
                            ? "bg-green-500/20 text-green-500"
                            : withdrawal.status === "rejected"
                            ? "bg-error/20 text-error"
                            : "bg-primary/20 text-primary"
                        }`}
                      >
                        {withdrawal.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(withdrawal.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {!withdrawal.withdrawalCode && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleGenerateCode(withdrawal._id)}
                          >
                            <Key className="h-4 w-4" />
                          </Button>
                        )}
                        {withdrawal.status === "pending" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusUpdate(withdrawal._id, "approved")}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusUpdate(withdrawal._id, "rejected")}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
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

