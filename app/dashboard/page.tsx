"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth";
import { useUserStore } from "@/stores/user";
import { userApi } from "@/lib/api/endpoints";
import { Wallet, TrendingUp, Activity, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "react-toastify";
import { SignalStrengthBar } from "@/components/ui/SignalStrengthBar";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { balances, setBalances } = useUserStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // If balances are already available from login, use them and skip API call
    if (balances) {
      setIsLoading(false);
      return;
    }

    // Also check if balances are in user object from auth store
    if (user?.balances) {
      setBalances(user.balances);
      setIsLoading(false);
      return;
    }

    // Only fetch if balances are not available
    try {
      const balancesData = await userApi.getBalances();
      setBalances(balancesData);
    } catch (error) {
      toast.error("Failed to load dashboard data");
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
        <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-2">
          Welcome back, {user?.firstName}!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Main Balance</CardTitle>
            <Wallet className="h-4 w-4 text-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-white">
              {balances?.main?.amount?.toLocaleString() || "0.00"} {balances?.main?.currency || "USD"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Mining Balance</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-white">
              {balances?.mining?.amount?.toLocaleString() || "0.00"} {balances?.mining?.currency || "USD"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Trade Balance</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-white">
              {balances?.trade?.amount?.toLocaleString() || "0.00"} {balances?.trade?.currency || "USD"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Signal Strength</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-2xl font-bold text-white">{user?.signalStrength || 0}%</div>
            <SignalStrengthBar value={user?.signalStrength || 0} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/dashboard/deposits">
              <Button className="w-full bg-blue hover:bg-blue-bright text-white">
                <ArrowDownCircle className="mr-2 h-4 w-4" />
                Deposit
              </Button>
            </Link>
            <Link href="/dashboard/withdrawals">
              <Button className="w-full bg-primary hover:bg-primary-dark text-white">
                <ArrowUpCircle className="mr-2 h-4 w-4" />
                Withdraw
              </Button>
            </Link>
            <Link href="/dashboard/trading">
              <Button className="w-full bg-purple hover:bg-purple/80 text-white">
                <TrendingUp className="mr-2 h-4 w-4" />
                Trade
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-white">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-400">
              No recent activity
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-white">Account Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-300">KYC Status:</span>
              <span className={`text-sm font-medium ${
                user?.kycStatus === "approved" ? "text-primary" : "text-gray-400"
              }`}>
                {user?.kycStatus || "Pending"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-300">2FA:</span>
              <span className={`text-sm font-medium ${
                user?.twoFactorEnabled ? "text-primary" : "text-gray-400"
              }`}>
                {user?.twoFactorEnabled ? "Enabled" : "Disabled"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

