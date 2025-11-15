"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { adminApi } from "@/lib/api/endpoints";
import { toast } from "react-toastify";
import { Users, ArrowDownCircle, ArrowUpCircle, TrendingUp } from "lucide-react";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    users: 0,
    deposits: 0,
    withdrawals: 0,
    trades: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const [users, deposits, withdrawals, trades] = await Promise.all([
        adminApi.getUsers().catch(() => []),
        adminApi.getDeposits().catch(() => []),
        adminApi.getWithdrawals().catch(() => []),
        adminApi.getTrades().catch(() => []),
      ]);
      // Ensure all data is arrays before accessing length and filter out null/undefined
      setStats({
        users: Array.isArray(users) ? users.filter(u => u != null).length : 0,
        deposits: Array.isArray(deposits) ? deposits.filter(d => d != null).length : 0,
        withdrawals: Array.isArray(withdrawals) ? withdrawals.filter(w => w != null).length : 0,
        trades: Array.isArray(trades) ? trades.filter(t => t != null).length : 0,
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load dashboard stats");
      // Reset stats to 0 on error
      setStats({
        users: 0,
        deposits: 0,
        withdrawals: 0,
        trades: 0,
      });
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
        <h1 className="text-2xl font-semibold text-white">Admin Dashboard</h1>
        <p className="text-gray-400 mt-2">
          Overview of platform statistics and activities
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Users</CardTitle>
            <Users className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-white">{stats.users}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Deposits</CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-white">{stats.deposits}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Withdrawals</CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-white">{stats.withdrawals}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Trades</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-white">{stats.trades}</div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

