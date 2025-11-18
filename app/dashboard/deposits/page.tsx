"use client";

import { useEffect, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { userApi } from "@/lib/api/endpoints";
import { Deposit, DepositMethod } from "@/lib/types";
import { toast } from "react-toastify";
import { ArrowDownCircle, Upload } from "lucide-react";

const formatDetailKey = (key: string) =>
  key
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

export default function DepositsPage() {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [methods, setMethods] = useState<DepositMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    methodId: "",
    amount: "",
    currency: "USD",
    proof: null as File | null,
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
      const [depositsData, methodsData] = await Promise.all([
        userApi.getDeposits(),
        userApi.getDepositMethods(),
      ]);
      // Ensure all data is always an array
      setDeposits(Array.isArray(depositsData) ? depositsData : []);
      setMethods(Array.isArray(methodsData) ? methodsData : []);
    } catch (error) {
      toast.error("Failed to load deposit data");
      // Ensure all arrays are initialized even on error
      setDeposits([]);
      setMethods([]);
    } finally {
      setIsLoading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "image/*": [".png", ".jpg", ".jpeg"],
      "application/pdf": [".pdf"],
    },
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setFormData({ ...formData, proof: acceptedFiles[0] });
      }
    },
    maxFiles: 1,
  });

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.proof) {
      toast.error("Proof of payment is required");
      return;
    }
    if (!formData.methodId) {
      toast.error("Please select a deposit method");
      return;
    }
    const amountValue = parseFloat(formData.amount);
    if (Number.isNaN(amountValue) || amountValue <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    setIsSubmitting(true);
    try {
      await userApi.deposit({
        methodId: formData.methodId,
        amount: amountValue,
        currency: formData.currency,
        proof: formData.proof,
      });
      toast.success("Deposit request submitted successfully!");
      setFormData({
        methodId: "",
        amount: "",
        currency: "USD",
        proof: null,
      });
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Deposit failed");
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
        <h1 className="text-2xl font-semibold text-white">Deposits</h1>
        <p className="text-gray-400 mt-2">
          Make a deposit to fund your account
        </p>
      </div>

      <Tabs defaultValue="new" className="space-y-4">
        <TabsList>
          <TabsTrigger value="new">New Deposit</TabsTrigger>
          <TabsTrigger value="history">Deposit History</TabsTrigger>
        </TabsList>

        <TabsContent value="new" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowDownCircle className="h-5 w-5" />
                Create Deposit Request
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleDeposit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="methodId">Deposit Method</Label>
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

                  <div className="space-y-2 md:col-span-2">
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
                {selectedMethod && (
                  <div className="md:col-span-2 rounded-lg border border-gray-800 bg-background/40 p-4 space-y-3">
                    <div>
                      <p className="text-sm font-medium text-white">
                        {selectedMethod.name} instructions
                      </p>
                    </div>
                    <div className="text-xs text-gray-400">
                      <span className="font-semibold text-white">Type:</span>{" "}
                      {selectedMethod.type?.replace(/_/g, " ") || "N/A"}
                    </div>
                    {selectedMethod.details && Object.keys(selectedMethod.details).length > 0 ? (
                      <div className="grid gap-2 sm:grid-cols-2">
                        {Object.entries(selectedMethod.details).map(([key, value]) => (
                          <div key={key} className="rounded border border-gray-800 p-2">
                            <p className="text-[11px] uppercase tracking-wide text-gray-500">
                              {formatDetailKey(key)}
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

                <div className="space-y-2">
                  <Label>Proof of Payment (Required)</Label>
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                      isDragActive
                        ? "border-primary bg-primary/10"
                        : "border-gray-800 hover:border-primary/50"
                    }`}
                  >
                    <input {...getInputProps()} />
                    <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    {formData.proof ? (
                      <p className="text-sm">{formData.proof.name}</p>
                    ) : (
                      <div>
                        <p className="text-sm text-gray-400">
                          {isDragActive
                            ? "Drop the file here"
                            : "Drag & drop a file here, or click to select"}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          PNG, JPG, PDF up to 10MB
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting || !formData.methodId || !formData.amount || !formData.proof}>
                  {isSubmitting ? "Submitting..." : "Submit Deposit Request"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card className="overflow-hidden max-w-full">
            <CardHeader>
              <CardTitle>Deposit History</CardTitle>
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
                  {deposits.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No deposits found
                      </TableCell>
                    </TableRow>
                  ) : (
                    deposits.map((deposit) => (
                      <TableRow key={deposit._id}>
                        <TableCell>{deposit.methodId || 'N/A'}</TableCell>
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

