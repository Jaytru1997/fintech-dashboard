"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { adminApi } from "@/lib/api/endpoints";
import { WithdrawalMethod, CreateWithdrawalMethodRequest } from "@/lib/types";
import { toast } from "react-toastify";
import { ArrowUpCircle, Plus, Edit, X } from "lucide-react";

export default function AdminWithdrawalMethodsPage() {
  const [methods, setMethods] = useState<WithdrawalMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<WithdrawalMethod | null>(null);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [formData, setFormData] = useState<CreateWithdrawalMethodRequest>({
    name: "",
    type: "bank",
    details: {},
    isActive: true,
  });

  const typeOptions = [
    { value: "bank", label: "Bank Transfer" },
    { value: "crypto", label: "Crypto Wallet" },
    { value: "mobile_money", label: "Mobile Money" },
    { value: "custom", label: "Custom" },
  ];

  const detailTemplates: Record<
    "bank" | "crypto" | "mobile_money",
    { key: string; label: string; placeholder?: string }[]
  > = {
    bank: [
      { key: "bankName", label: "Bank Name", placeholder: "Example Bank" },
      { key: "accountName", label: "Account Name", placeholder: "John Doe" },
      { key: "accountNumber", label: "Account Number", placeholder: "0123456789" },
      { key: "routingNumber", label: "Routing / Swift", placeholder: "ABCDEF12" },
    ],
    crypto: [
      { key: "network", label: "Network", placeholder: "USDT-TRC20" },
      { key: "asset", label: "Asset", placeholder: "USDT" },
      { key: "address", label: "Wallet Address", placeholder: "0x..." },
    ],
    mobile_money: [
      { key: "provider", label: "Provider", placeholder: "M-Pesa" },
      { key: "phoneNumber", label: "Phone Number", placeholder: "+254700000000" },
      { key: "accountName", label: "Account Name", placeholder: "John Doe" },
    ],
  };

  const templateKeys = Object.keys(detailTemplates) as Array<
    keyof typeof detailTemplates
  >;

  const detailFields = useMemo(() => {
    if (templateKeys.includes(formData.type as any)) {
      return detailTemplates[formData.type as keyof typeof detailTemplates];
    }
    return null;
  }, [formData.type]);

  const isCustomType = detailFields === null;

  const sanitizeDetails = (details?: Record<string, string>) => {
    if (!details) return undefined;
    const entries = Object.entries(details).filter(
      ([key, value]) => key.trim().length && value.trim().length
    );
    return entries.length ? Object.fromEntries(entries) : undefined;
  };

  const handleDetailChange = (key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      details: { ...(prev.details || {}), [key]: value },
    }));
  };

  const handleCustomKeyChange = (oldKey: string, newKey: string) => {
    setFormData((prev) => {
      const details = { ...(prev.details || {}) };
      const detailValue = details[oldKey];
      delete details[oldKey];
      const nextKey = newKey.trim() || oldKey;
      details[nextKey] = detailValue;
      return { ...prev, details };
    });
  };

  const handleCustomValueChange = (key: string, value: string) => {
    handleDetailChange(key, value);
  };

  const handleAddCustomDetail = () => {
    setFormData((prev) => {
      const details = { ...(prev.details || {}) };
      let index = Object.keys(details).length + 1;
      let newKey = `field_${index}`;
      while (details[newKey]) {
        index += 1;
        newKey = `field_${index}`;
      }
      details[newKey] = "";
      return { ...prev, details };
    });
  };

  const handleRemoveCustomDetail = (key: string) => {
    setFormData((prev) => {
      const details = { ...(prev.details || {}) };
      delete details[key];
      return { ...prev, details };
    });
  };

  useEffect(() => {
    loadMethods();
  }, []);

  const loadMethods = async () => {
    setIsLoading(true);
    try {
      const response = await adminApi.getWithdrawalMethods();
      // Handle different response structures
      let data = response;
      if (response && typeof response === 'object' && 'data' in response && Array.isArray(response.data)) {
        data = response.data;
      } else if (response && typeof response === 'object' && 'methods' in response && Array.isArray(response.methods)) {
        data = response.methods;
      }
      
      const validMethods = Array.isArray(data)
        ? data.filter((method): method is WithdrawalMethod => method != null && typeof method === 'object' && ('_id' in method || 'id' in method))
          .map((method: any) => {
            if ('id' in method && !('_id' in method)) {
              const { id, ...rest } = method;
              return { ...rest, _id: id } as WithdrawalMethod;
            }
            return method as WithdrawalMethod;
          })
        : [];
      setMethods(validMethods);
    } catch (error: any) {
      console.error("Error loading methods:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to load withdrawal methods");
      setMethods([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    setIsSubmitting(true);
    try {
      await adminApi.createWithdrawalMethod({
        ...formData,
        details: sanitizeDetails(formData.details),
      });
      toast.success("Withdrawal method created successfully");
      setIsCreateMode(false);
      resetForm();
      loadMethods();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create withdrawal method");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedMethod?._id) return;
    setIsSubmitting(true);
    try {
      await adminApi.updateWithdrawalMethod(selectedMethod._id, {
        ...formData,
        details: sanitizeDetails(formData.details),
      });
      toast.success("Withdrawal method updated successfully");
      setSelectedMethod(null);
      resetForm();
      loadMethods();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update withdrawal method");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      type: "bank",
      details: {},
      isActive: true,
    });
  };

  const handleEdit = (method: WithdrawalMethod) => {
    setSelectedMethod(method);
    setIsCreateMode(false);
    setFormData({
      name: method?.name || "",
      type: method?.type || "custom",
      details: method?.details || {},
      isActive: method?.isActive ?? true,
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
          <h1 className="text-2xl font-semibold text-white">Withdrawal Methods</h1>
          <p className="text-gray-400 mt-2">
            Manage withdrawal methods
          </p>
        </div>
        <Dialog open={isCreateMode || selectedMethod !== null} onOpenChange={(open) => {
          if (!open) {
            setIsCreateMode(false);
            setSelectedMethod(null);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setIsCreateMode(true);
              setSelectedMethod(null);
              resetForm();
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Create Method
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isCreateMode ? "Create Withdrawal Method" : "Edit Withdrawal Method"}</DialogTitle>
              <DialogDescription>
                {isCreateMode ? "Add a new withdrawal method" : "Update withdrawal method"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Method Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Bank Transfer, Crypto, PayPal"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Method Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData((prev) => {
                      const template = detailTemplates[value as keyof typeof detailTemplates];
                      let nextDetails: Record<string, string> = {};
                      if (template) {
                        nextDetails = template.reduce((acc, field) => {
                          acc[field.key] = prev.details?.[field.key] || "";
                          return acc;
                        }, {} as Record<string, string>);
                      } else {
                        nextDetails = prev.details || {};
                      }
                      return { ...prev, type: value, details: nextDetails };
                    })
                  }
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select method type" />
                  </SelectTrigger>
                  <SelectContent>
                    {typeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Details</Label>
                  {isCustomType && (
                    <Button type="button" variant="outline" size="sm" onClick={handleAddCustomDetail}>
                      Add Field
                    </Button>
                  )}
                </div>
                {detailFields ? (
                  <div className="grid grid-cols-1 gap-3">
                    {detailFields.map((field) => (
                      <div key={field.key} className="space-y-1">
                        <Label htmlFor={`detail-${field.key}`}>{field.label}</Label>
                        <Input
                          id={`detail-${field.key}`}
                          placeholder={field.placeholder}
                          value={formData.details?.[field.key] || ""}
                          onChange={(e) => handleDetailChange(field.key, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(formData.details || {}).length === 0 && (
                      <p className="text-sm text-gray-500">Add custom fields for this method type.</p>
                    )}
                    {Object.entries(formData.details || {}).map(([key, value], index) => (
                      <div key={`${key}-${index}`} className="grid grid-cols-5 gap-2 items-center">
                        <Input
                          placeholder="Field name"
                          value={key}
                          onChange={(e) => handleCustomKeyChange(key, e.target.value)}
                          className="col-span-2"
                        />
                        <Input
                          placeholder="Field value"
                          value={value}
                          onChange={(e) => handleCustomValueChange(key, e.target.value)}
                          className="col-span-2"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => handleRemoveCustomDetail(key)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive ?? true}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded border-gray-800"
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
              <Button
                onClick={isCreateMode ? handleCreate : handleUpdate}
                disabled={isSubmitting || !formData.name}
                className="w-full"
              >
                {isSubmitting ? "Processing..." : isCreateMode ? "Create Method" : "Update Method"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Withdrawal Methods</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {methods.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-400">
                    No withdrawal methods found
                  </TableCell>
                </TableRow>
              ) : (
                methods.map((method) => (
                  <TableRow key={method?._id || 'unknown'}>
                    <TableCell className="font-medium">{method?.name || 'N/A'}</TableCell>
                    <TableCell className="capitalize">{method?.type?.replace(/_/g, " ") || "N/A"}</TableCell>
                    <TableCell>
                      {method?.details && Object.keys(method.details).length > 0 ? (
                        <div className="text-xs text-gray-300 space-y-1">
                          {Object.entries(method.details).map(([key, value]) => (
                            <div key={key} className="flex gap-1">
                              <span className="text-white font-medium">
                                {key.replace(/([A-Z])/g, " $1").replace(/_/g, " ")}:
                              </span>
                              <span>{value}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500">No details</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs ${method?.isActive ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'}`}>
                        {method?.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(method)}
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
