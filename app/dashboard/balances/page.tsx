"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth";
import { useUserStore } from "@/stores/user";
import { userApi } from "@/lib/api/endpoints";
import { Wallet, Activity, TrendingUp, Building2, Users } from "lucide-react";
import { toast } from "react-toastify";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const currencies = ["USD", "EUR", "GBP", "BTC", "ETH"];

export default function BalancesPage() {
  const { user, updateUser } = useAuthStore();
  const { balances, setBalances } = useUserStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    loadBalances();
  }, []);

  const loadBalances = async () => {
    try {
      const balancesData = await userApi.getBalances();
      setBalances(balancesData);
    } catch (error) {
      toast.error("Failed to load balances");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCurrencyChange = async (currency: string) => {
    setIsUpdating(true);
    try {
      await userApi.updateCurrency({ currency });
      updateUser({ currency });
      toast.success("Currency updated successfully");
    } catch (error) {
      toast.error("Failed to update currency");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const balanceCards = [
    {
      title: "Main Balance",
      value: balances?.main || 0,
      icon: Wallet,
      color: "text-blue",
    },
    {
      title: "Mining Balance",
      value: balances?.mining || 0,
      icon: Activity,
      color: "text-primary",
    },
    {
      title: "Trade Balance",
      value: balances?.trade || 0,
      icon: TrendingUp,
      color: "text-purple",
    },
    {
      title: "Real Estate",
      value: balances?.realEstate || 0,
      icon: Building2,
      color: "text-primary-dark",
    },
    {
      title: "Referral",
      value: balances?.referral || 0,
      icon: Users,
      color: "text-blue-sky",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Balances</h1>
          <p className="text-muted-foreground mt-2">
            View and manage your account balances
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm">Currency:</span>
          <Select
            value={user?.currency || "USD"}
            onValueChange={handleCurrencyChange}
            disabled={isUpdating}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {currencies.map((currency) => (
                <SelectItem key={currency} value={currency}>
                  {currency}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {balanceCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {card.title}
                  </CardTitle>
                  <Icon className={`h-5 w-5 ${card.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {card.value.toLocaleString()} {user?.currency || "USD"}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

