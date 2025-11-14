"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuthStore } from "@/stores/auth";
import { userApi } from "@/lib/api/endpoints";
import { SignalPrice } from "@/lib/types";
import { toast } from "react-toastify";
import { TrendingUp } from "lucide-react";

export default function SignalPage() {
  const { user, updateUser } = useAuthStore();
  const [signalPrices, setSignalPrices] = useState<SignalPrice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPrice, setSelectedPrice] = useState<SignalPrice | null>(null);
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadSignalPrices();
  }, []);

  const loadSignalPrices = async () => {
    try {
      const data = await userApi.getSignalPrices();
      setSignalPrices(data);
    } catch (error) {
      toast.error("Failed to load signal prices");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!selectedPrice || !amount) return;
    setIsSubmitting(true);
    try {
      await userApi.purchaseSignal({
        signalPriceId: selectedPrice._id,
        amount: parseFloat(amount),
      });
      toast.success("Signal strength purchased successfully!");
      if (user) {
        updateUser({ signalStrength: (user.signalStrength || 0) + selectedPrice.signalValue });
      }
      setSelectedPrice(null);
      setAmount("");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Purchase failed");
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
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold text-white">Signal Strength</h1>
        <p className="text-gray-400 mt-2">
          Purchase signal strength to improve your trading performance
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Current Signal Strength
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-white">{user?.signalStrength || 0}%</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-4">
              <div
                className="bg-primary h-4 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(user?.signalStrength || 0, 100)}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-2xl font-semibold mb-4 text-white">Purchase Signal Strength</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {signalPrices.map((price) => (
            <Card key={price._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>${price.amount}</CardTitle>
                <CardDescription>
                  +{price.signalValue}% Signal Strength
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      className="w-full"
                      onClick={() => setSelectedPrice(price)}
                    >
                      Purchase
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Purchase Signal Strength</DialogTitle>
                      <DialogDescription>
                        Amount: ${price.amount} | Signal Value: +{price.signalValue}%
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="amount">Quantity</Label>
                        <Input
                          id="amount"
                          type="number"
                          min="1"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="Enter quantity"
                        />
                      </div>
                      <div className="p-4 bg-background-dark rounded-lg">
                        <p className="text-sm text-gray-400">Total Amount:</p>
                        <p className="text-2xl font-bold text-white">
                          ${amount ? (parseFloat(amount) * price.amount).toFixed(2) : "0.00"}
                        </p>
                        <p className="text-sm text-gray-400 mt-2">
                          Signal Strength Gain: +{amount ? (parseFloat(amount) * price.signalValue).toFixed(0) : "0"}%
                        </p>
                      </div>
                      <Button
                        onClick={handlePurchase}
                        disabled={isSubmitting || !amount || parseFloat(amount) <= 0}
                        className="w-full"
                      >
                        {isSubmitting ? "Processing..." : "Confirm Purchase"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {signalPrices.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-400">No signal prices available</p>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}

