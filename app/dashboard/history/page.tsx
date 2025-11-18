"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { userApi } from "@/lib/api/endpoints";
import { Trade, Deposit, Withdrawal, Staking, RealEstateInvestment } from "@/lib/types";
import { toast } from "react-toastify";
import { History } from "lucide-react";

export default function HistoryPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [stakings, setStakings] = useState<Staking[]>([]);
  const [investments, setInvestments] = useState<RealEstateInvestment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [tradesData, depositsData, withdrawalsData, stakingsData, investmentsData] =
        await Promise.all([
          userApi.getTrades(),
          userApi.getDeposits(),
          userApi.getWithdrawals(),
          userApi.getStakings(),
          userApi.getRealEstateInvestments(),
        ]);
      // Ensure all data is always an array
      setTrades(Array.isArray(tradesData) ? tradesData : []);
      setDeposits(Array.isArray(depositsData) ? depositsData : []);
      setWithdrawals(Array.isArray(withdrawalsData) ? withdrawalsData : []);
      setStakings(Array.isArray(stakingsData) ? stakingsData : []);
      setInvestments(Array.isArray(investmentsData) ? investmentsData : []);
    } catch (error) {
      toast.error("Failed to load history");
      // Ensure all arrays are initialized even on error
      setTrades([]);
      setDeposits([]);
      setWithdrawals([]);
      setStakings([]);
      setInvestments([]);
    } finally {
      setIsLoading(false);
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
        <h1 className="text-2xl font-semibold flex items-center gap-2 text-white">
          <History className="h-8 w-8" />
          Transaction History
        </h1>
        <p className="text-gray-400 mt-2">
          View all your transactions in one place
        </p>
      </div>

      <Tabs defaultValue="trades" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trades">Trades</TabsTrigger>
          <TabsTrigger value="deposits">Deposits</TabsTrigger>
          <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
          <TabsTrigger value="stakings">Stakings</TabsTrigger>
          <TabsTrigger value="investments">Real Estate</TabsTrigger>
        </TabsList>

        <TabsContent value="trades">
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
                    <TableHead>Direction</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trades.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-gray-400">
                        No trades found
                      </TableCell>
                    </TableRow>
                  ) : (
                    trades.map((trade) => (
                      <TableRow key={trade._id}>
                        <TableCell>{trade.tradeType}</TableCell>
                        <TableCell>{trade.pair}</TableCell>
                        <TableCell>${trade.amount.toLocaleString()}</TableCell>
                        <TableCell>{trade.direction.toUpperCase()}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              trade.status === "open"
                                ? "bg-primary/20 text-primary"
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

        <TabsContent value="deposits">
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
                      <TableCell colSpan={5} className="text-center text-gray-400">
                        No deposits found
                      </TableCell>
                    </TableRow>
                  ) : (
                    deposits.map((deposit) => (
                      <TableRow key={deposit._id}>
                        <TableCell>{deposit.methodId}</TableCell>
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

        <TabsContent value="withdrawals">
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
                        <TableCell>{withdrawal.methodId}</TableCell>
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

        <TabsContent value="stakings">
          <Card className="overflow-hidden max-w-full">
            <CardHeader>
              <CardTitle>Staking History</CardTitle>
            </CardHeader>
            <CardContent className="max-w-full" style={{ minWidth: 0 }}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pool</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stakings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-gray-400">
                        No stakings found
                      </TableCell>
                    </TableRow>
                  ) : (
                    stakings.map((staking) => (
                      <TableRow key={staking._id}>
                        <TableCell>{staking.poolName || "N/A"}</TableCell>
                        <TableCell>${staking.amount.toLocaleString()}</TableCell>
                        <TableCell>{staking.durationDays} days</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              staking.status === "active"
                                ? "bg-primary/20 text-primary"
                                : "bg-background-dark text-gray-400"
                            }`}
                          >
                            {staking.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          {staking.createdAt
                            ? new Date(staking.createdAt).toLocaleDateString()
                            : "N/A"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="investments">
          <Card className="overflow-hidden max-w-full">
            <CardHeader>
              <CardTitle>Real Estate Investment History</CardTitle>
            </CardHeader>
            <CardContent className="max-w-full" style={{ minWidth: 0 }}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {investments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-gray-400">
                        No investments found
                      </TableCell>
                    </TableRow>
                  ) : (
                    investments.map((investment) => (
                      <TableRow key={investment._id}>
                        <TableCell>{investment.realEstateTitle || "N/A"}</TableCell>
                        <TableCell>${investment.amount.toLocaleString()}</TableCell>
                        <TableCell>{investment.durationMonths} months</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              investment.status === "active"
                                ? "bg-primary/20 text-primary"
                                : "bg-background-dark text-gray-400"
                            }`}
                          >
                            {investment.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          {investment.createdAt
                            ? new Date(investment.createdAt).toLocaleDateString()
                            : "N/A"}
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

