"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { adminApi } from "@/lib/api/endpoints";
import { SubscriptionPlan, CreateSubscriptionPlanRequest } from "@/lib/types";
import { toast } from "react-toastify";
import { CreditCard, Plus, Edit } from "lucide-react";

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
  });

  useEffect(() => {
    loadPlans();
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
    });
  };

  const handleEdit = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setIsCreateMode(false);
    setFormData({
      name: plan?.name || "",
      minAmount: plan?.minAmount || 0,
      maxAmount: plan?.maxAmount || 0,
    });
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
                    value={formData.minAmount}
                    onChange={(e) => setFormData({ ...formData, minAmount: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxAmount">Maximum Amount</Label>
                  <Input
                    id="maxAmount"
                    type="number"
                    value={formData.maxAmount}
                    onChange={(e) => setFormData({ ...formData, maxAmount: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <Button
                onClick={isCreateMode ? handleCreate : handleUpdate}
                disabled={isSubmitting}
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
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-gray-400">
                    No subscription plans found
                  </TableCell>
                </TableRow>
              ) : (
                plans.map((plan) => (
                  <TableRow key={plan?._id || 'unknown'}>
                    <TableCell className="font-medium">{plan?.name || 'N/A'}</TableCell>
                    <TableCell>${(plan?.minAmount ?? 0).toLocaleString()}</TableCell>
                    <TableCell>${(plan?.maxAmount ?? 0).toLocaleString()}</TableCell>
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
    </motion.div>
  );
}

