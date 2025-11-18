"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuthStore } from "@/stores/auth";
import { userApi } from "@/lib/api/endpoints";
import { SignalPrice } from "@/lib/types";
import { toast } from "react-toastify";
import { TrendingUp } from "lucide-react";
import { SignalStrengthBar } from "@/components/ui/SignalStrengthBar";

export default function SignalPage() {
  const { user, updateUser } = useAuthStore();
  const [signalPrices, setSignalPrices] = useState<SignalPrice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPrice, setSelectedPrice] = useState<SignalPrice | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadSignalPrices();
  }, []);

  const loadSignalPrices = async () => {
    try {
      const data = await userApi.getSignalPrices();
      // Ensure data is always an array
      setSignalPrices(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Failed to load signal prices");
      // Ensure signalPrices is always an array even on error
      setSignalPrices([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!selectedPrice) return;
    setIsSubmitting(true);
    try {
      await userApi.purchaseSignal({
        signalPriceId: selectedPrice._id,
        amount: selectedPrice.amount,
      });
      toast.success("Signal strength purchased successfully!");
      if (user) {
        const nextStrength = Math.min(
          100,
          (user.signalStrength || 0) + selectedPrice.signalValue
        );
        updateUser({ signalStrength: nextStrength });
      }
      setSelectedPrice(null);
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
        <h1 className="text-2xl font-semibold text-white">Signal Strength</h1>
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
              <span className="text-xl font-bold text-white">{user?.signalStrength || 0}%</span>
            </div>
            <SignalStrengthBar value={user?.signalStrength || 0} />
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-lg font-semibold mb-4 text-white">Purchase Signal Strength</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {signalPrices.map((price) => (
            <Card key={price._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>${price.amount.toLocaleString()}</CardTitle>
                <CardDescription>
                  Signal Boost: +{price.signalValue}%
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
                      Pay ${price.amount.toLocaleString()} to gain +{price.signalValue}% signal strength.
                    </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Button
                        onClick={handlePurchase}
                      disabled={isSubmitting}
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

