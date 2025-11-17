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
import { SignalPrice, CreateSignalPriceRequest } from "@/lib/types";
import { toast } from "react-toastify";
import { TrendingUp, Plus, Edit } from "lucide-react";

export default function AdminSignalPricesPage() {
  const [prices, setPrices] = useState<SignalPrice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState<SignalPrice | null>(null);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [formData, setFormData] = useState<CreateSignalPriceRequest>({
    name: "",
    price: 0,
    strengthIncrease: 0,
  });

  useEffect(() => {
    loadPrices();
  }, []);

  const loadPrices = async () => {
    setIsLoading(true);
    try {
      const response = await adminApi.getSignalPrices();
      // Handle different response structures
      let data = response;
      if (response && typeof response === 'object' && 'data' in response && Array.isArray(response.data)) {
        data = response.data;
      } else if (response && typeof response === 'object' && 'prices' in response && Array.isArray(response.prices)) {
        data = response.prices;
      }
      
      const validPrices = Array.isArray(data)
        ? data.filter((price): price is SignalPrice => price != null && typeof price === 'object' && ('_id' in price || 'id' in price))
          .map((price: any) => {
            if ('id' in price && !('_id' in price)) {
              const { id, ...rest } = price;
              return { ...rest, _id: id } as SignalPrice;
            }
            return price as SignalPrice;
          })
        : [];
      setPrices(validPrices);
    } catch (error: any) {
      console.error("Error loading prices:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to load signal prices");
      setPrices([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    setIsSubmitting(true);
    try {
      await adminApi.createSignalPrice(formData);
      toast.success("Signal price created successfully");
      setIsCreateMode(false);
      resetForm();
      loadPrices();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create signal price");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedPrice?._id) return;
    setIsSubmitting(true);
    try {
      await adminApi.updateSignalPrice(selectedPrice._id, formData);
      toast.success("Signal price updated successfully");
      setSelectedPrice(null);
      resetForm();
      loadPrices();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update signal price");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      price: 0,
      strengthIncrease: 0,
    });
  };

  const handleEdit = (price: SignalPrice) => {
    setSelectedPrice(price);
    setIsCreateMode(false);
    setFormData({
      name: price?.name || "",
      price: price?.price || 0,
      strengthIncrease: price?.strengthIncrease || 0,
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
          <h1 className="text-2xl font-semibold text-white">Signal Prices</h1>
          <p className="text-gray-400 mt-2">
            Manage signal strength prices
          </p>
        </div>
        <Dialog open={isCreateMode || selectedPrice !== null} onOpenChange={(open) => {
          if (!open) {
            setIsCreateMode(false);
            setSelectedPrice(null);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setIsCreateMode(true);
              setSelectedPrice(null);
              resetForm();
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Create Price
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isCreateMode ? "Create Signal Price" : "Edit Signal Price"}</DialogTitle>
              <DialogDescription>
                {isCreateMode ? "Add a new signal price" : "Update signal price details"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Signal Boost, Premium Signal"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price ($)</Label>
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
                <Label htmlFor="strengthIncrease">Strength Increase (%)</Label>
                <Input
                  id="strengthIncrease"
                  type="number"
                  min="0"
                  value={formData.strengthIncrease}
                  onChange={(e) => setFormData({ ...formData, strengthIncrease: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <Button
                onClick={isCreateMode ? handleCreate : handleUpdate}
                disabled={isSubmitting || !formData.name || !formData.price || !formData.strengthIncrease}
                className="w-full"
              >
                {isSubmitting ? "Processing..." : isCreateMode ? "Create Price" : "Update Price"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Signal Prices</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Strength Increase</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-gray-400">
                    No signal prices found
                  </TableCell>
                </TableRow>
              ) : (
                prices.map((price) => (
                  <TableRow key={price?._id || 'unknown'}>
                    <TableCell className="font-medium">{price?.name || 'N/A'}</TableCell>
                    <TableCell>${(price?.price ?? 0).toLocaleString()}</TableCell>
                    <TableCell>+{(price?.strengthIncrease ?? 0)}%</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(price)}
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

