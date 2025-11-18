"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { userApi } from "@/lib/api/endpoints";
import { SubscriptionPlan, UserSubscription, UpdateSubscriptionStatusRequest } from "@/lib/types";
import { toast } from "react-toastify";
import { CreditCard } from "lucide-react";

export default function SubscriptionsPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [isLoadingSubscriptions, setIsLoadingSubscriptions] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [subscriptionAmount, setSubscriptionAmount] = useState("");
  const [amountError, setAmountError] = useState("");
  const [statusDrafts, setStatusDrafts] = useState<Record<string, UpdateSubscriptionStatusRequest["status"]>>({});
  const [statusUpdateId, setStatusUpdateId] = useState<string | null>(null);

  useEffect(() => {
    loadPlans();
    loadSubscriptions();
  }, []);

  const loadPlans = async () => {
    try {
      const data = await userApi.getAvailableSubscriptionPlans();
      // Ensure data is always an array
      setPlans(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Failed to load subscription plans");
      // Ensure plans is always an array even on error
      setPlans([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSubscriptions = async () => {
    setIsLoadingSubscriptions(true);
    try {
      const data = await userApi.getSubscriptions();
      setSubscriptions(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Failed to load current subscriptions");
      setSubscriptions([]);
    } finally {
      setIsLoadingSubscriptions(false);
    }
  };

  const openSubscriptionDialog = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setSubscriptionAmount(plan.minAmount ? plan.minAmount.toString() : "");
    setAmountError("");
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedPlan(null);
    setSubscriptionAmount("");
    setAmountError("");
  };

  const handleAmountChange = (value: string) => {
    setSubscriptionAmount(value);
    if (!selectedPlan) return;
    const parsed = parseFloat(value);
    if (Number.isNaN(parsed)) {
      setAmountError("Enter a valid amount");
      return;
    }
    if (parsed < selectedPlan.minAmount || parsed > selectedPlan.maxAmount) {
      setAmountError(
        `Amount must be between $${selectedPlan.minAmount.toLocaleString()} and $${selectedPlan.maxAmount.toLocaleString()}`
      );
      return;
    }
    setAmountError("");
  };

  const handleSubscribe = async () => {
    if (!selectedPlan) return;
    const parsedAmount = parseFloat(subscriptionAmount);
    if (Number.isNaN(parsedAmount)) {
      setAmountError("Enter a valid amount");
      return;
    }
    if (parsedAmount < selectedPlan.minAmount || parsedAmount > selectedPlan.maxAmount) {
      setAmountError(
        `Amount must be between $${selectedPlan.minAmount.toLocaleString()} and $${selectedPlan.maxAmount.toLocaleString()}`
      );
      return;
    }
    setIsSubmitting(true);
    try {
      await userApi.subscribe({
        planId: selectedPlan._id,
        amount: parsedAmount,
      });
      toast.success("Subscription successful!");
      closeDialog();
      loadPlans();
      loadSubscriptions();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Subscription failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (value?: number) => {
    if (typeof value !== "number") return "—";
    return value.toLocaleString(undefined, { style: "currency", currency: "USD" });
  };

  const formatDate = (value?: string) => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  };

  const resolvePlanName = (subscription: UserSubscription) => {
    if (subscription.planName) return subscription.planName;
    if (subscription.plan && "name" in subscription.plan) return subscription.plan.name;
    if (
      subscription.planId &&
      typeof subscription.planId === "object" &&
      "name" in subscription.planId
    ) {
      return (subscription.planId as SubscriptionPlan).name;
    }
    if (typeof subscription.planId === "string") return subscription.planId;
    return "Subscription";
  };

  const resolveRoi = (subscription: UserSubscription) => {
    return subscription.roi ?? subscription.plan?.roi ?? (typeof subscription.planId === "object" ? subscription.planId.roi : undefined);
  };

  const resolveDuration = (subscription: UserSubscription) => {
    return subscription.durationDays ?? subscription.plan?.durationDays ?? (typeof subscription.planId === "object" ? subscription.planId.durationDays : undefined);
  };

  const getStatusClasses = (status?: string) => {
    const normalized = status?.toLowerCase();
    switch (normalized) {
      case "completed":
        return "bg-emerald-500/15 text-emerald-400";
      case "pending":
        return "bg-yellow-500/15 text-yellow-400";
      case "canceled":
      case "cancelled":
        return "bg-red-500/15 text-red-400";
      default:
        return "bg-primary/15 text-primary";
    }
  };

  const USER_STATUS_OPTIONS: UpdateSubscriptionStatusRequest["status"][] = [
    "pending",
    "completed",
    "canceled",
  ];

  const handleStatusDraftChange = (
    subscriptionId: string,
    value: UpdateSubscriptionStatusRequest["status"]
  ) => {
    setStatusDrafts((prev) => ({ ...prev, [subscriptionId]: value }));
  };

  const handleApplyStatus = async (subscriptionId?: string) => {
    if (!subscriptionId) return;
    const nextStatus = statusDrafts[subscriptionId];
    if (!nextStatus) {
      toast.error("Select a status to apply");
      return;
    }

    setStatusUpdateId(subscriptionId);
    try {
      await userApi.updateSubscriptionStatus(subscriptionId, { status: nextStatus });
      toast.success("Subscription status updated");
      setStatusDrafts((prev) => {
        const { [subscriptionId]: _, ...rest } = prev;
        return rest;
      });
      loadSubscriptions();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update status");
    } finally {
      setStatusUpdateId(null);
    }
  };

  const normalizedStatus = (status?: string) => status?.toLowerCase();

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
        <h1 className="text-2xl font-semibold text-white">Subscription Plans</h1>
        <p className="text-gray-400 mt-2">
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
              <CardDescription className="space-y-1">
                <p>Min: ${plan.minAmount} | Max: ${plan.maxAmount}</p>
                <p>ROI: {plan.roi}% • Duration: {plan.durationDays} days</p>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => openSubscriptionDialog(plan)}>
                Subscribe
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Current Subscriptions</h2>
          <p className="text-gray-400 mt-1">
            Review active plans, invested amounts, and expected timelines
          </p>
        </div>
        {isLoadingSubscriptions ? (
          <Card>
            <CardContent className="py-12">
              <div className="flex flex-col items-center justify-center gap-3 text-gray-400">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                <span>Loading subscriptions...</span>
              </div>
            </CardContent>
          </Card>
        ) : subscriptions.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-gray-400">
              You have no active subscriptions yet.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {subscriptions.map((subscription) => {
              const planName = resolvePlanName(subscription);
              const roi = resolveRoi(subscription);
              const duration = resolveDuration(subscription);
              const statusLabel = (subscription.status || "active").toUpperCase();
              const startedOn = subscription.startDate || subscription.createdAt;
              const subscriptionId = subscription._id;
              const currentStatusNormalized = normalizedStatus(subscription.status);
              const pendingStatus = subscriptionId ? statusDrafts[subscriptionId] : undefined;
              const isStatusDirty =
                !!pendingStatus && pendingStatus.toLowerCase() !== currentStatusNormalized;

              return (
                <Card key={subscription._id} className="border border-white/5 bg-black/20">
                  <CardHeader className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="text-base">{planName}</CardTitle>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusClasses(subscription.status)}`}>
                        {statusLabel}
                      </span>
                    </div>
                    <CardDescription>
                      Started {formatDate(startedOn)}
                      {subscription.endDate && ` • Ends ${formatDate(subscription.endDate)}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-gray-300">
                    <div className="flex items-center justify-between">
                      <span>Amount Invested</span>
                      <span className="font-semibold text-white">{formatCurrency(subscription.amount ?? subscription.plan?.minAmount)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>ROI</span>
                      <span className="font-semibold text-white">{roi !== undefined ? `${roi}%` : "—"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Duration</span>
                      <span className="font-semibold text-white">
                        {duration ? `${duration} days` : "—"}
                      </span>
                    </div>
                    {subscriptionId && (
                      <div className="pt-3 border-t border-white/5 space-y-2">
                        <Label className="text-xs uppercase tracking-wide text-gray-400">
                          Update Status
                        </Label>
                        <div className="flex flex-col gap-2 sm:flex-row">
                          <Select
                            value={
                              pendingStatus ??
                              (USER_STATUS_OPTIONS.includes(
                                currentStatusNormalized as UpdateSubscriptionStatusRequest["status"]
                              )
                                ? (currentStatusNormalized as UpdateSubscriptionStatusRequest["status"])
                                : undefined)
                            }
                            onValueChange={(value) =>
                              handleStatusDraftChange(
                                subscriptionId,
                                value as UpdateSubscriptionStatusRequest["status"]
                              )
                            }
                            disabled={statusUpdateId === subscriptionId}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Choose status" />
                            </SelectTrigger>
                            <SelectContent>
                              {USER_STATUS_OPTIONS.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option.charAt(0).toUpperCase() + option.slice(1)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            variant="outline"
                            className="w-full sm:w-auto"
                            disabled={!isStatusDirty || statusUpdateId === subscriptionId}
                            onClick={() => handleApplyStatus(subscriptionId)}
                          >
                            {statusUpdateId === subscriptionId ? "Updating..." : "Apply"}
                          </Button>
                        </div>
                        {currentStatusNormalized === "cancelled" && (
                          <p className="text-xs text-gray-500">
                            Status synced from backend. You can set it to pending or completed again if needed.
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen && !!selectedPlan} onOpenChange={(open) => (!open ? closeDialog() : setIsDialogOpen(true))}>
        <DialogContent>
          {selectedPlan && (
            <>
              <DialogHeader>
                <DialogTitle>Subscribe to {selectedPlan.name}</DialogTitle>
                <DialogDescription>
                  Invest between ${selectedPlan.minAmount.toLocaleString()} and $
                  {selectedPlan.maxAmount.toLocaleString()}. ROI {selectedPlan.roi}% over {selectedPlan.durationDays} days.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subscription-amount">Amount</Label>
                  <Input
                    id="subscription-amount"
                    type="number"
                    min={selectedPlan.minAmount}
                    max={selectedPlan.maxAmount}
                    step="0.01"
                    value={subscriptionAmount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    placeholder={`Between ${selectedPlan.minAmount} - ${selectedPlan.maxAmount}`}
                  />
                  {amountError && <p className="text-sm text-red-500">{amountError}</p>}
                </div>
                <Button
                  onClick={handleSubscribe}
                  disabled={
                    isSubmitting ||
                    !!amountError ||
                    !subscriptionAmount ||
                    Number.isNaN(parseFloat(subscriptionAmount))
                  }
                  className="w-full"
                >
                  {isSubmitting ? "Subscribing..." : "Confirm Subscription"}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {plans.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-400">No subscription plans available</p>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}

