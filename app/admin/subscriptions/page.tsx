"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { adminApi } from "@/lib/api/endpoints";
import { SubscriptionPlan, CreateSubscriptionPlanRequest, UserSubscription, UpdateSubscriptionStatusRequest } from "@/lib/types";
import { toast } from "react-toastify";
import { Plus, Edit } from "lucide-react";

export default function AdminSubscriptionsPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [formData, setFormData] = useState<CreateSubscriptionPlanRequest>({
    name: "",
    minAmount: 0,
    maxAmount: 0,
    roi: 0,
    durationDays: 1,
  });
  const [userSubscriptions, setUserSubscriptions] = useState<UserSubscription[]>([]);
  const [isLoadingSubscriptions, setIsLoadingSubscriptions] = useState(true);
  const [statusDrafts, setStatusDrafts] = useState<Record<string, UpdateSubscriptionStatusRequest["status"]>>({});
  const [statusUpdateId, setStatusUpdateId] = useState<string | null>(null);

  useEffect(() => {
    loadPlans();
    loadUserSubscriptions();
  }, []);

  const loadPlans = async () => {
    setIsLoading(true);
    try {
      const response = await adminApi.getSubscriptionPlans();
      // Handle different response structures
      let data = response;
      if (response && typeof response === 'object' && 'data' in response && Array.isArray(response.data)) {
        data = response.data;
      } else if (response && typeof response === 'object' && 'plans' in response && Array.isArray(response.plans)) {
        data = response.plans;
      }
      
      const validPlans = Array.isArray(data)
        ? data.filter((plan): plan is SubscriptionPlan => plan != null && typeof plan === 'object' && ('_id' in plan || 'id' in plan))
          .map((plan: any) => {
            if ('id' in plan && !('_id' in plan)) {
              const { id, ...rest } = plan;
              return { ...rest, _id: id } as SubscriptionPlan;
            }
            return plan as SubscriptionPlan;
          })
        : [];
      setPlans(validPlans);
    } catch (error: any) {
      console.error("Error loading plans:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to load subscription plans");
      setPlans([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserSubscriptions = async () => {
    setIsLoadingSubscriptions(true);
    try {
      const data = await adminApi.getUserSubscriptions();
      setUserSubscriptions(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error("Error loading user subscriptions:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to load user subscriptions");
      setUserSubscriptions([]);
    } finally {
      setIsLoadingSubscriptions(false);
    }
  };

  const handleCreate = async () => {
    setIsSubmitting(true);
    try {
      await adminApi.createSubscriptionPlan(formData);
      toast.success("Subscription plan created successfully");
      setIsCreateMode(false);
      resetForm();
      loadPlans();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create subscription plan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedPlan?._id) return;
    setIsSubmitting(true);
    try {
      await adminApi.updateSubscriptionPlan(selectedPlan._id, formData);
      toast.success("Subscription plan updated successfully");
      setSelectedPlan(null);
      resetForm();
      loadPlans();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update subscription plan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      minAmount: 0,
      maxAmount: 0,
      roi: 0,
      durationDays: 1,
    });
  };

  const handleEdit = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setIsCreateMode(false);
    setFormData({
      name: plan?.name || "",
      minAmount: plan?.minAmount || 0,
      maxAmount: plan?.maxAmount || 0,
      roi: plan?.roi || 0,
      durationDays: plan?.durationDays || 1,
    });
  };

  const STATUS_OPTIONS: UpdateSubscriptionStatusRequest["status"][] = [
    "pending",
    "active",
    "completed",
    "canceled",
    "cancelled",
  ];

  const normalizedStatus = (status?: string) => status?.toLowerCase();

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

    const subscription = userSubscriptions.find((sub) => sub._id === subscriptionId);
    if (!subscription) {
      toast.error("Subscription not found");
      return;
    }

    const userId = resolveUserId(subscription);
    if (!userId) {
      toast.error("User ID not found for this subscription");
      return;
    }

    setStatusUpdateId(subscriptionId);
    try {
      await adminApi.updateSubscriptionStatus(userId, subscriptionId, { status: nextStatus });
      toast.success("Subscription status updated");
      setStatusDrafts((prev) => {
        const { [subscriptionId]: _, ...rest } = prev;
        return rest;
      });
      loadUserSubscriptions();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update status");
    } finally {
      setStatusUpdateId(null);
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

  const resolveUserFromSubscription = (subscription: UserSubscription) => {
    if (subscription.user && typeof subscription.user === "object") return subscription.user;
    if (subscription.userId && typeof subscription.userId === "object") {
      return subscription.userId;
    }
    return undefined;
  };

  const resolveUserName = (subscription: UserSubscription) => {
    if (subscription.userName) return subscription.userName;
    const user = resolveUserFromSubscription(subscription);
    if (user) {
      const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
      return fullName || user.email || user._id || "User";
    }
    if (typeof subscription.userId === "string") return subscription.userId;
    return "User";
  };

  const resolveUserEmail = (subscription: UserSubscription) => {
    const user = resolveUserFromSubscription(subscription);
    if (user?.email) return user.email;
    if (subscription.userEmail) return subscription.userEmail;
    return "—";
  };

  const resolveUserId = (subscription: UserSubscription): string | null => {
    if (typeof subscription.userId === "string") return subscription.userId;
    const user = resolveUserFromSubscription(subscription);
    if (user?._id) return user._id;
    return null;
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
      case "active":
        return "bg-blue-500/15 text-blue-400";
      default:
        return "bg-primary/15 text-primary";
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-white">Subscription Plans</h1>
          <p className="text-gray-400 mt-2">
            Manage subscription plans
          </p>
        </div>
        <Dialog open={isCreateMode || selectedPlan !== null} onOpenChange={(open) => {
          if (!open) {
            setIsCreateMode(false);
            setSelectedPlan(null);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setIsCreateMode(true);
              setSelectedPlan(null);
              resetForm();
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Create Plan
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isCreateMode ? "Create Subscription Plan" : "Edit Subscription Plan"}</DialogTitle>
              <DialogDescription>
                {isCreateMode ? "Add a new subscription plan" : "Update subscription plan details"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Plan Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Plan name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minAmount">Minimum Amount</Label>
                  <Input
                    id="minAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.minAmount}
                    onChange={(e) =>
                      setFormData({ ...formData, minAmount: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxAmount">Maximum Amount</Label>
                  <Input
                    id="maxAmount"
                    type="number"
                    min={formData.minAmount || 0}
                    step="0.01"
                    value={formData.maxAmount}
                    onChange={(e) =>
                      setFormData({ ...formData, maxAmount: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="roi">ROI (%)</Label>
                  <Input
                    id="roi"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.roi}
                    onChange={(e) =>
                      setFormData({ ...formData, roi: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="durationDays">Duration (days)</Label>
                  <Input
                    id="durationDays"
                    type="number"
                    min="1"
                    step="1"
                    value={formData.durationDays}
                    onChange={(e) =>
                      setFormData({ ...formData, durationDays: Math.max(1, parseInt(e.target.value, 10) || 1) })
                    }
                  />
                </div>
              </div>
              <Button
                onClick={isCreateMode ? handleCreate : handleUpdate}
                disabled={
                  isSubmitting ||
                  !formData.name ||
                  formData.minAmount < 0 ||
                  formData.maxAmount <= 0 ||
                  formData.minAmount >= formData.maxAmount ||
                  formData.roi < 0 ||
                  formData.durationDays < 1
                }
                className="w-full"
              >
                {isSubmitting ? "Processing..." : isCreateMode ? "Create Plan" : "Update Plan"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Subscription Plans</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Min Amount</TableHead>
                <TableHead>Max Amount</TableHead>
                <TableHead>ROI (%)</TableHead>
                <TableHead>Duration (days)</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-400">
                    No subscription plans found
                  </TableCell>
                </TableRow>
              ) : (
                plans.map((plan) => (
                  <TableRow key={plan?._id || 'unknown'}>
                    <TableCell className="font-medium">{plan?.name || 'N/A'}</TableCell>
                    <TableCell>${(plan?.minAmount ?? 0).toLocaleString()}</TableCell>
                    <TableCell>${(plan?.maxAmount ?? 0).toLocaleString()}</TableCell>
                      <TableCell>{plan?.roi ?? 0}%</TableCell>
                      <TableCell>{plan?.durationDays ?? 0}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(plan)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>User Subscriptions</CardTitle>
          <p className="text-sm text-gray-400">
            Review every active plan and control subscription statuses from a single place.
          </p>
        </CardHeader>
        <CardContent>
          {isLoadingSubscriptions ? (
            <div className="py-12 text-center text-gray-400">
              Loading user subscriptions...
            </div>
          ) : userSubscriptions.length === 0 ? (
            <div className="py-10 text-center text-gray-400">
              No user subscriptions found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>ROI / Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[220px]">Update Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userSubscriptions.map((subscription) => {
                  const subscriptionId = subscription._id;
                  const currentStatusNormalized = normalizedStatus(subscription.status);
                  const pendingStatus = subscriptionId ? statusDrafts[subscriptionId] : undefined;
                  const selectValue =
                    pendingStatus ??
                    (currentStatusNormalized &&
                    STATUS_OPTIONS.includes(
                      currentStatusNormalized as UpdateSubscriptionStatusRequest["status"]
                    )
                      ? (currentStatusNormalized as UpdateSubscriptionStatusRequest["status"])
                      : undefined);
                  const isStatusDirty =
                    !!pendingStatus && pendingStatus.toLowerCase() !== currentStatusNormalized;

                  return (
                    <TableRow key={subscription._id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{resolveUserName(subscription)}</span>
                          {typeof subscription.userId === "string" && (
                            <span className="text-xs text-gray-500">
                              ID: {subscription.userId}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{resolveUserEmail(subscription)}</TableCell>
                      <TableCell>{resolvePlanName(subscription)}</TableCell>
                      <TableCell>{formatCurrency(subscription.amount)}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 text-sm">
                          <span>{subscription.roi ?? subscription.plan?.roi ?? "—"}%</span>
                          <span className="text-xs text-gray-500">
                            {(subscription.durationDays ??
                              subscription.plan?.durationDays ??
                              "—") + " days"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium inline-flex ${getStatusClasses(
                            subscription.status
                          )}`}
                        >
                          {(subscription.status || "active").toUpperCase()}
                        </span>
                        <div className="text-xs text-gray-500 mt-1">
                          Started {formatDate(subscription.startDate || subscription.createdAt)}
                          {subscription.endDate && ` • Ends ${formatDate(subscription.endDate)}`}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-2 sm:flex-row">
                          <Select
                            value={selectValue}
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
                              {STATUS_OPTIONS.map((option) => (
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
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

