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
    setIsLoading(true);
    try {
      const response = await adminApi.getWithdrawals();
      // Handle different response structures
      let data = response;
      if (response && typeof response === 'object' && 'data' in response && Array.isArray(response.data)) {
        data = response.data;
      } else if (response && typeof response === 'object' && 'withdrawals' in response && Array.isArray(response.withdrawals)) {
        data = response.withdrawals;
      }
      
      // Ensure data is always an array and filter out any null/undefined entries
      const validWithdrawals = Array.isArray(data) 
        ? data.filter((withdrawal): withdrawal is Withdrawal => withdrawal != null && typeof withdrawal === 'object' && ('_id' in withdrawal || 'id' in withdrawal))
          .map((withdrawal: any) => {
            if ('id' in withdrawal && !('_id' in withdrawal)) {
              const { id, ...rest } = withdrawal;
              return { ...rest, _id: id } as Withdrawal;
            }
            return withdrawal as Withdrawal;
          })
        : [];
      setWithdrawals(validWithdrawals);
    } catch (error: any) {
      console.error("Error loading withdrawals:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to load withdrawals");
      // Ensure withdrawals is always an array even on error
      setWithdrawals([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateCode = async (id: string) => {
    if (!id) return;
    try {
      const response = await adminApi.generateWithdrawalCode(id);
      const code = response?.code || 'N/A';
      toast.success(`Withdrawal code: ${code}`);
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
        <h1 className="text-2xl font-semibold text-white">Withdrawals</h1>
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
                  <TableRow key={withdrawal?._id || 'unknown'}>
                    <TableCell>{withdrawal?.method || 'N/A'}</TableCell>
                    <TableCell>{(withdrawal?.amount ?? 0).toLocaleString()}</TableCell>
                    <TableCell>{withdrawal?.currency || 'N/A'}</TableCell>
                    <TableCell className="max-w-xs truncate">{withdrawal?.details || 'N/A'}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          withdrawal?.status === "approved"
                            ? "bg-green-500/20 text-green-500"
                            : withdrawal?.status === "rejected"
                            ? "bg-error/20 text-error"
                            : "bg-primary/20 text-primary"
                        }`}
                      >
                        {withdrawal?.status || 'pending'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {withdrawal?.createdAt ? new Date(withdrawal.createdAt).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {!withdrawal?.withdrawalCode && withdrawal?._id && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleGenerateCode(withdrawal._id)}
                          >
                            <Key className="h-4 w-4" />
                          </Button>
                        )}
                        {withdrawal?.status === "pending" && withdrawal?._id && (
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

