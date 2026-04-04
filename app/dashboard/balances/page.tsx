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

  const defaultCurrency = user?.currency || "USD";
  const balanceCards = [
    {
      title: "Main Balance",
      amount: balances?.main?.amount || 0,
      currency: balances?.main?.currency || defaultCurrency,
      icon: Wallet,
      color: "text-blue",
    },
    {
      title: "Mining Balance",
      amount: balances?.mining?.amount || 0,
      currency: balances?.mining?.currency || defaultCurrency,
      icon: Activity,
      color: "text-primary",
    },
    {
      title: "Trade Balance",
      amount: balances?.trade?.amount || 0,
      currency: balances?.trade?.currency || defaultCurrency,
      icon: TrendingUp,
      color: "text-purple",
    },
    {
      title: "Real Estate",
      amount: balances?.realEstate?.amount || 0,
      currency: balances?.realEstate?.currency || defaultCurrency,
      icon: Building2,
      color: "text-primary-dark",
    },
    {
      title: "Referral",
      amount: balances?.referral?.amount || 0,
      currency: balances?.referral?.currency || defaultCurrency,
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
          <h1 className="text-2xl font-semibold text-white">Balances</h1>
          <p className="text-gray-400 mt-2">
            View and manage your account balances
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-300">Default Currency:</span>
          <Select
            value={balances?.main?.currency || user?.currency || defaultCurrency}
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
                  <div className="text-xl font-bold">
                    {card.amount.toLocaleString()} {card.currency}
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

