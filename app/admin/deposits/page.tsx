"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { adminApi } from "@/lib/api/endpoints";
import { Deposit } from "@/lib/types";
import { toast } from "react-toastify";
import { Check, X } from "lucide-react";

export default function AdminDepositsPage() {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDeposits();
  }, []);

  const loadDeposits = async () => {
    setIsLoading(true);
    try {
      const response = await adminApi.getDeposits();
      // Handle different response structures
      let data = response;
      if (response && typeof response === 'object' && 'data' in response && Array.isArray(response.data)) {
        data = response.data;
      } else if (response && typeof response === 'object' && 'deposits' in response && Array.isArray(response.deposits)) {
        data = response.deposits;
      }
      
      // Ensure data is always an array and filter out any null/undefined entries
      const validDeposits = Array.isArray(data) 
        ? data.filter((deposit): deposit is Deposit => deposit != null && typeof deposit === 'object' && ('_id' in deposit || 'id' in deposit))
          .map((deposit: any) => {
            if ('id' in deposit && !('_id' in deposit)) {
              const { id, ...rest } = deposit;
              return { ...rest, _id: id } as Deposit;
            }
            return deposit as Deposit;
          })
        : [];
      setDeposits(validDeposits);
    } catch (error: any) {
      console.error("Error loading deposits:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to load deposits");
      // Ensure deposits is always an array even on error
      setDeposits([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: "approved" | "rejected") => {
    try {
      await adminApi.updateDepositStatus(id, { status });
      toast.success(`Deposit ${status}`);
      loadDeposits();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update deposit");
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
        <h1 className="text-2xl font-semibold text-white">Deposits</h1>
        <p className="text-gray-400 mt-2">
          Review and manage deposit requests
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Deposits</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Method</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deposits.length === 0 ? (
                <TableRow>
                      <TableCell colSpan={6} className="text-center text-gray-400">
                    No deposits found
                  </TableCell>
                </TableRow>
              ) : (
                deposits.map((deposit) => (
                  <TableRow key={deposit?._id || 'unknown'}>
                    <TableCell>{deposit?.method || 'N/A'}</TableCell>
                    <TableCell>{(deposit?.amount ?? 0).toLocaleString()}</TableCell>
                    <TableCell>{deposit?.currency || 'N/A'}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          deposit?.status === "approved"
                            ? "bg-green-500/20 text-green-500"
                            : deposit?.status === "rejected"
                            ? "bg-error/20 text-error"
                            : "bg-primary/20 text-primary"
                        }`}
                      >
                        {deposit?.status || 'pending'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {deposit?.createdAt ? new Date(deposit.createdAt).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {deposit?.status === "pending" && deposit?._id && (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusUpdate(deposit._id, "approved")}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusUpdate(deposit._id, "rejected")}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
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

