"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { userApi } from "@/lib/api/endpoints";
import { Withdrawal, WithdrawalMethod } from "@/lib/types";
import { toast } from "react-toastify";
import { ArrowUpCircle } from "lucide-react";
import { useAuthStore } from "@/stores/auth";

export default function WithdrawalsPage() {
  const { user } = useAuthStore();
  const userCurrency = user?.currency || "USD";
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [methods, setMethods] = useState<WithdrawalMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    balanceType: "main" as "main" | "mining" | "trade" | "realEstate" | "referral",
    methodId: "",
    amount: "",
    currency: userCurrency,
    details: {
      accountNumber: "",
      bankName: "",
    },
    withdrawalCode: "",
  });

  const selectedMethod = useMemo(
    () => methods.find((method) => method._id === formData.methodId),
    [methods, formData.methodId]
  );

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [withdrawalsData, methodsData] = await Promise.all([
        userApi.getWithdrawals(),
        userApi.getWithdrawalMethods(),
      ]);
      // Ensure all data is always an array
      setWithdrawals(Array.isArray(withdrawalsData) ? withdrawalsData : []);
      setMethods(Array.isArray(methodsData) ? methodsData : []);
    } catch (error) {
      toast.error("Failed to load withdrawal data");
      // Ensure all arrays are initialized even on error
      setWithdrawals([]);
      setMethods([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Build details object - only include non-empty fields
      const detailsObj: Record<string, any> = {};
      if (formData.details.accountNumber) detailsObj.accountNumber = formData.details.accountNumber;
      if (formData.details.bankName) detailsObj.bankName = formData.details.bankName;
      
      await userApi.withdrawal({
        balanceType: formData.balanceType,
        methodId: formData.methodId,
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        details: Object.keys(detailsObj).length > 0 ? detailsObj : undefined,
        withdrawalCode: formData.withdrawalCode || undefined,
      });
      toast.success("Withdrawal request submitted successfully!");
      setFormData({
        balanceType: "main",
        methodId: "",
        amount: "",
        currency: userCurrency,
        details: {
          accountNumber: "",
          bankName: "",
        },
        withdrawalCode: "",
      });
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Withdrawal failed");
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
        <h1 className="text-2xl font-semibold text-white">Withdrawals</h1>
        <p className="text-gray-400 mt-2">
          Request a withdrawal from your account
        </p>
      </div>

      <Tabs defaultValue="new" className="space-y-4">
        <TabsList>
          <TabsTrigger value="new">New Withdrawal</TabsTrigger>
          <TabsTrigger value="history">Withdrawal History</TabsTrigger>
        </TabsList>

        <TabsContent value="new" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowUpCircle className="h-5 w-5" />
                Create Withdrawal Request
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleWithdrawal} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="balanceType">Balance Type</Label>
                    <Select
                      value={formData.balanceType}
                      onValueChange={(value) => setFormData({ 
                        ...formData, 
                        balanceType: value as "main" | "mining" | "trade" | "realEstate" | "referral"
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="main">Main Balance</SelectItem>
                        <SelectItem value="mining">Mining Balance</SelectItem>
                        <SelectItem value="trade">Trade Balance</SelectItem>
                        <SelectItem value="realEstate">Real Estate Balance</SelectItem>
                        <SelectItem value="referral">Referral Balance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="methodId">Withdrawal Method</Label>
                    <Select
                      value={formData.methodId}
                      onValueChange={(value) => setFormData({ ...formData, methodId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        {methods.map((method) => (
                          <SelectItem key={method._id} value={method._id}>
                            {method.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select
                      value={formData.currency}
                      onValueChange={(value) => setFormData({ ...formData, currency: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                        <SelectItem value="BTC">BTC</SelectItem>
                        <SelectItem value="ETH">ETH</SelectItem>
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
                    <Label htmlFor="accountNumber">Account Number / Wallet Address</Label>
                    <Input
                      id="accountNumber"
                      value={formData.details.accountNumber}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        details: { ...formData.details, accountNumber: e.target.value }
                      })}
                      placeholder="Enter account number or wallet address"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bankName">Bank Name (if applicable)</Label>
                    <Input
                      id="bankName"
                      value={formData.details.bankName}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        details: { ...formData.details, bankName: e.target.value }
                      })}
                      placeholder="Enter bank name"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="withdrawalCode">Withdrawal Code (Optional)</Label>
                    <Input
                      id="withdrawalCode"
                      value={formData.withdrawalCode}
                      onChange={(e) => setFormData({ ...formData, withdrawalCode: e.target.value })}
                      placeholder="Enter withdrawal code if required"
                    />
                    <p className="text-xs text-gray-400">
                      Some withdrawal methods may require a code. Contact support if needed.
                    </p>
                  </div>

                {selectedMethod && (
                  <div className="md:col-span-2 rounded-lg border border-gray-800 bg-background/40 p-4 space-y-3">
                    <div>
                      <p className="text-sm font-medium text-white">
                        {selectedMethod.name} details
                      </p>
                      <p className="text-xs text-gray-400 mt-1 capitalize">
                        Type: {selectedMethod.type?.replace(/_/g, " ") || "N/A"}
                      </p>
                    </div>
                    {selectedMethod.details && Object.keys(selectedMethod.details).length > 0 ? (
                      <div className="grid gap-2 sm:grid-cols-2">
                        {Object.entries(selectedMethod.details).map(([key, value]) => (
                          <div key={key} className="rounded border border-gray-800 p-2">
                            <p className="text-[11px] uppercase tracking-wide text-gray-500">
                              {key
                                .replace(/([A-Z])/g, " $1")
                                .replace(/_/g, " ")
                                .trim()}
                            </p>
                            <p className="text-sm text-white break-words">{value}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500">
                        No structured details provided for this method.
                      </p>
                    )}
                  </div>
                )}
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting || !formData.methodId || !formData.amount}>
                  {isSubmitting ? "Submitting..." : "Submit Withdrawal Request"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card className="overflow-hidden max-w-full">
            <CardHeader>
              <CardTitle>Withdrawal History</CardTitle>
            </CardHeader>
            <CardContent className="max-w-full" style={{ minWidth: 0 }}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Method</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Currency</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {withdrawals.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-gray-400">
                        No withdrawals found
                      </TableCell>
                    </TableRow>
                  ) : (
                    withdrawals.map((withdrawal) => (
                      <TableRow key={withdrawal._id}>
                        <TableCell>{withdrawal.methodId || 'N/A'}</TableCell>
                        <TableCell>{withdrawal.amount.toLocaleString()}</TableCell>
                        <TableCell>{withdrawal.currency}</TableCell>
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

