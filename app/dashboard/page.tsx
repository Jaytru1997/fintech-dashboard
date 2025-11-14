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

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { balances, setBalances } = useUserStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
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
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back, {user?.firstName}!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Main Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {balances?.main?.toLocaleString() || "0.00"} {user?.currency || "USD"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mining Balance</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {balances?.mining?.toLocaleString() || "0.00"} {user?.currency || "USD"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trade Balance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {balances?.trade?.toLocaleString() || "0.00"} {user?.currency || "USD"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Signal Strength</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user?.signalStrength || 0}%</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/dashboard/deposits">
              <Button className="w-full" variant="outline">
                <ArrowDownCircle className="mr-2 h-4 w-4" />
                Deposit
              </Button>
            </Link>
            <Link href="/dashboard/withdrawals">
              <Button className="w-full" variant="outline">
                <ArrowUpCircle className="mr-2 h-4 w-4" />
                Withdraw
              </Button>
            </Link>
            <Link href="/dashboard/trading">
              <Button className="w-full" variant="outline">
                <TrendingUp className="mr-2 h-4 w-4" />
                Trade
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              No recent activity
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">KYC Status:</span>
              <span className={`text-sm font-medium ${
                user?.kycStatus === "approved" ? "text-primary" : "text-muted-foreground"
              }`}>
                {user?.kycStatus || "Pending"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">2FA:</span>
              <span className={`text-sm font-medium ${
                user?.twoFactorEnabled ? "text-primary" : "text-muted-foreground"
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

