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
    price: 0,
    duration: 0,
    features: [],
  });
  const [featureInput, setFeatureInput] = useState("");

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
      price: 0,
      duration: 0,
      features: [],
    });
    setFeatureInput("");
  };

  const handleEdit = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setIsCreateMode(false);
    setFormData({
      name: plan?.name || "",
      price: plan?.price || 0,
      duration: plan?.duration || 0,
      features: plan?.features || [],
    });
    setFeatureInput("");
  };

  const addFeature = () => {
    if (featureInput.trim()) {
      setFormData({
        ...formData,
        features: [...formData.features, featureInput.trim()],
      });
      setFeatureInput("");
    }
  };

  const removeFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index),
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
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (days)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="features">Features</Label>
                <div className="flex gap-2">
                  <Input
                    id="features"
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                    placeholder="Add a feature and press Enter"
                  />
                  <Button type="button" onClick={addFeature} variant="outline">Add</Button>
                </div>
                {formData.features.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.features.map((feature, idx) => (
                      <span key={idx} className="px-2 py-1 bg-primary/20 text-primary rounded text-sm flex items-center gap-1">
                        {feature}
                        <button
                          type="button"
                          onClick={() => removeFeature(idx)}
                          className="text-primary hover:text-error"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <Button
                onClick={isCreateMode ? handleCreate : handleUpdate}
                disabled={isSubmitting || !formData.name || !formData.price || !formData.duration}
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
                <TableHead>Price</TableHead>
                <TableHead>Duration (days)</TableHead>
                <TableHead>Features</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-400">
                    No subscription plans found
                  </TableCell>
                </TableRow>
              ) : (
                plans.map((plan) => (
                  <TableRow key={plan?._id || 'unknown'}>
                    <TableCell className="font-medium">{plan?.name || 'N/A'}</TableCell>
                    <TableCell>${(plan?.price ?? 0).toLocaleString()}</TableCell>
                    <TableCell>{plan?.duration ?? 0}</TableCell>
                    <TableCell>
                      {plan?.features && plan.features.length > 0 
                        ? plan.features.slice(0, 2).join(', ') + (plan.features.length > 2 ? ` +${plan.features.length - 2} more` : '')
                        : 'N/A'}
                    </TableCell>
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

