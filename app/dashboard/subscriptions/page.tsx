"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { userApi } from "@/lib/api/endpoints";
import { SubscriptionPlan } from "@/lib/types";
import { toast } from "react-toastify";
import { CreditCard } from "lucide-react";

export default function SubscriptionsPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const data = await userApi.getSubscriptionPlans();
      setPlans(data);
    } catch (error) {
      toast.error("Failed to load subscription plans");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!selectedPlan || !amount) return;
    setIsSubmitting(true);
    try {
      await userApi.subscribe({
        planId: selectedPlan._id,
        amount: parseFloat(amount),
      });
      toast.success("Subscription successful!");
      setSelectedPlan(null);
      setAmount("");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Subscription failed");
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
        <h1 className="text-3xl font-bold">Subscription Plans</h1>
        <p className="text-muted-foreground mt-2">
          Choose a subscription plan that fits your needs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan._id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                {plan.name}
              </CardTitle>
              <CardDescription>
                Min: {plan.minAmount} - Max: {plan.maxAmount}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    className="w-full"
                    onClick={() => setSelectedPlan(plan)}
                  >
                    Subscribe
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Subscribe to {plan.name}</DialogTitle>
                    <DialogDescription>
                      Enter the amount you want to subscribe (between {plan.minAmount} and {plan.maxAmount})
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount</Label>
                      <Input
                        id="amount"
                        type="number"
                        min={plan.minAmount}
                        max={plan.maxAmount}
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Enter amount"
                      />
                    </div>
                    <Button
                      onClick={handleSubscribe}
                      disabled={isSubmitting || !amount}
                      className="w-full"
                    >
                      {isSubmitting ? "Subscribing..." : "Confirm Subscription"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ))}
      </div>

      {plans.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No subscription plans available</p>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}

