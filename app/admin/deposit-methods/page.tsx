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
import { DepositMethod, CreateDepositMethodRequest } from "@/lib/types";
import { toast } from "react-toastify";
import { ArrowDownCircle, Plus, Edit } from "lucide-react";

export default function AdminDepositMethodsPage() {
  const [methods, setMethods] = useState<DepositMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<DepositMethod | null>(null);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [formData, setFormData] = useState<CreateDepositMethodRequest>({
    method: "",
  });

  useEffect(() => {
    loadMethods();
  }, []);

  const loadMethods = async () => {
    setIsLoading(true);
    try {
      const response = await adminApi.getDepositMethods();
      // Handle different response structures
      let data = response;
      if (response && typeof response === 'object' && 'data' in response && Array.isArray(response.data)) {
        data = response.data;
      } else if (response && typeof response === 'object' && 'methods' in response && Array.isArray(response.methods)) {
        data = response.methods;
      }
      
      const validMethods = Array.isArray(data)
        ? data.filter((method): method is DepositMethod => method != null && typeof method === 'object' && ('_id' in method || 'id' in method))
          .map((method: any) => {
            if ('id' in method && !('_id' in method)) {
              const { id, ...rest } = method;
              return { ...rest, _id: id } as DepositMethod;
            }
            return method as DepositMethod;
          })
        : [];
      setMethods(validMethods);
    } catch (error: any) {
      console.error("Error loading methods:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to load deposit methods");
      setMethods([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    setIsSubmitting(true);
    try {
      await adminApi.createDepositMethod(formData);
      toast.success("Deposit method created successfully");
      setIsCreateMode(false);
      resetForm();
      loadMethods();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create deposit method");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedMethod?._id) return;
    setIsSubmitting(true);
    try {
      await adminApi.updateDepositMethod(selectedMethod._id, formData);
      toast.success("Deposit method updated successfully");
      setSelectedMethod(null);
      resetForm();
      loadMethods();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update deposit method");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      method: "",
    });
  };

  const handleEdit = (method: DepositMethod) => {
    setSelectedMethod(method);
    setIsCreateMode(false);
    setFormData({
      method: method?.method || "",
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
          <h1 className="text-2xl font-semibold text-white">Deposit Methods</h1>
          <p className="text-gray-400 mt-2">
            Manage deposit methods
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
              <DialogTitle>{isCreateMode ? "Create Deposit Method" : "Edit Deposit Method"}</DialogTitle>
              <DialogDescription>
                {isCreateMode ? "Add a new deposit method" : "Update deposit method"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="method">Method Name</Label>
                <Input
                  id="method"
                  value={formData.method}
                  onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                  placeholder="e.g., Bank Transfer, Crypto, PayPal"
                />
              </div>
              <Button
                onClick={isCreateMode ? handleCreate : handleUpdate}
                disabled={isSubmitting}
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
          <CardTitle>All Deposit Methods</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Method</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {methods.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center text-gray-400">
                    No deposit methods found
                  </TableCell>
                </TableRow>
              ) : (
                methods.map((method) => (
                  <TableRow key={method?._id || 'unknown'}>
                    <TableCell className="font-medium">{method?.method || 'N/A'}</TableCell>
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

