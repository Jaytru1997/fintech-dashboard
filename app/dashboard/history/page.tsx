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
      setTrades(tradesData);
      setDeposits(depositsData);
      setWithdrawals(withdrawalsData);
      setStakings(stakingsData);
      setInvestments(investmentsData);
    } catch (error) {
      toast.error("Failed to load history");
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
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <History className="h-8 w-8" />
          Transaction History
        </h1>
        <p className="text-muted-foreground mt-2">
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
                    <TableHead>Direction</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trades.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
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
                              trade.status === "active"
                                ? "bg-primary/20 text-primary"
                                : "bg-muted text-muted-foreground"
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
          <Card>
            <CardHeader>
              <CardTitle>Deposit History</CardTitle>
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
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="withdrawals">
          <Card>
            <CardHeader>
              <CardTitle>Withdrawal History</CardTitle>
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {withdrawals.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No withdrawals found
                      </TableCell>
                    </TableRow>
                  ) : (
                    withdrawals.map((withdrawal) => (
                      <TableRow key={withdrawal._id}>
                        <TableCell>{withdrawal.method}</TableCell>
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
          <Card>
            <CardHeader>
              <CardTitle>Staking History</CardTitle>
            </CardHeader>
            <CardContent>
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
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
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
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {staking.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          {new Date(staking.createdAt).toLocaleDateString()}
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
          <Card>
            <CardHeader>
              <CardTitle>Real Estate Investment History</CardTitle>
            </CardHeader>
            <CardContent>
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
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
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
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {investment.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          {new Date(investment.createdAt).toLocaleDateString()}
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

