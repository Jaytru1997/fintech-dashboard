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
    try {
      const data = await adminApi.getDeposits();
      setDeposits(data);
    } catch (error) {
      toast.error("Failed to load deposits");
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
        <h1 className="text-3xl font-bold">Deposits</h1>
        <p className="text-muted-foreground mt-2">
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
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No deposits found
                  </TableCell>
                </TableRow>
              ) : (
                deposits.map((deposit) => (
                  <TableRow key={deposit._id}>
                    <TableCell>{deposit.method}</TableCell>
                    <TableCell>{deposit.amount.toLocaleString()}</TableCell>
                    <TableCell>{deposit.currency}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          deposit.status === "approved"
                            ? "bg-green-500/20 text-green-500"
                            : deposit.status === "rejected"
                            ? "bg-error/20 text-error"
                            : "bg-primary/20 text-primary"
                        }`}
                      >
                        {deposit.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(deposit.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {deposit.status === "pending" && (
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

