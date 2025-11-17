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
import { WithdrawalMethod, CreateWithdrawalMethodRequest } from "@/lib/types";
import { toast } from "react-toastify";
import { ArrowUpCircle, Plus, Edit } from "lucide-react";

export default function AdminWithdrawalMethodsPage() {
  const [methods, setMethods] = useState<WithdrawalMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<WithdrawalMethod | null>(null);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [formData, setFormData] = useState<CreateWithdrawalMethodRequest>({
    name: "",
    description: "",
    isActive: true,
    requiresCode: false,
  });

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
      await adminApi.createWithdrawalMethod(formData);
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
      await adminApi.updateWithdrawalMethod(selectedMethod._id, formData);
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
      description: "",
      isActive: true,
      requiresCode: false,
    });
  };

  const handleEdit = (method: WithdrawalMethod) => {
    setSelectedMethod(method);
    setIsCreateMode(false);
    setFormData({
      name: method?.name || "",
      description: method?.description || "",
      isActive: method?.isActive ?? true,
      requiresCode: method?.requiresCode ?? false,
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
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Method description"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded border-gray-800"
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="requiresCode"
                  checked={formData.requiresCode}
                  onChange={(e) => setFormData({ ...formData, requiresCode: e.target.checked })}
                  className="rounded border-gray-800"
                />
                <Label htmlFor="requiresCode">Requires Withdrawal Code</Label>
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
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Requires Code</TableHead>
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
                    <TableCell>{method?.description || 'N/A'}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs ${method?.isActive ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'}`}>
                        {method?.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs ${method?.requiresCode ? 'bg-yellow-500/20 text-yellow-500' : 'bg-gray-500/20 text-gray-500'}`}>
                        {method?.requiresCode ? 'Yes' : 'No'}
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

