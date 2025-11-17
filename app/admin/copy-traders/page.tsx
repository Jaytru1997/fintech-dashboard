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
import { CopyTrader, CreateCopyTraderRequest } from "@/lib/types";
import { toast } from "react-toastify";
import { Copy, Plus, Edit } from "lucide-react";

export default function AdminCopyTradersPage() {
  const [traders, setTraders] = useState<CopyTrader[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTrader, setSelectedTrader] = useState<CopyTrader | null>(null);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [formData, setFormData] = useState<CreateCopyTraderRequest>({
    name: "",
    description: "",
    winRate: 0,
    totalTrades: 0,
    image: "",
  });

  useEffect(() => {
    loadTraders();
  }, []);

  const loadTraders = async () => {
    setIsLoading(true);
    try {
      const response = await adminApi.getCopyTraders();
      // Handle different response structures
      let data = response;
      if (response && typeof response === 'object' && 'data' in response && Array.isArray(response.data)) {
        data = response.data;
      } else if (response && typeof response === 'object' && 'traders' in response && Array.isArray(response.traders)) {
        data = response.traders;
      }
      
      const validTraders = Array.isArray(data)
        ? data.filter((trader): trader is CopyTrader => trader != null && typeof trader === 'object' && ('_id' in trader || 'id' in trader))
          .map((trader: any) => {
            if ('id' in trader && !('_id' in trader)) {
              const { id, ...rest } = trader;
              return { ...rest, _id: id } as CopyTrader;
            }
            return trader as CopyTrader;
          })
        : [];
      setTraders(validTraders);
    } catch (error: any) {
      console.error("Error loading traders:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to load copy traders");
      setTraders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    setIsSubmitting(true);
    try {
      await adminApi.createCopyTrader(formData);
      toast.success("Copy trader created successfully");
      setIsCreateMode(false);
      resetForm();
      loadTraders();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create copy trader");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedTrader?._id) return;
    setIsSubmitting(true);
    try {
      await adminApi.updateCopyTrader(selectedTrader._id, formData);
      toast.success("Copy trader updated successfully");
      setSelectedTrader(null);
      resetForm();
      loadTraders();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update copy trader");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      winRate: 0,
      totalTrades: 0,
      image: "",
    });
  };

  const handleEdit = (trader: CopyTrader) => {
    setSelectedTrader(trader);
    setIsCreateMode(false);
    setFormData({
      name: trader?.name || "",
      description: trader?.description || "",
      winRate: trader?.winRate || 0,
      totalTrades: trader?.totalTrades || 0,
      image: trader?.image || "",
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
          <h1 className="text-2xl font-semibold text-white">Copy Traders</h1>
          <p className="text-gray-400 mt-2">
            Manage copy trading traders
          </p>
        </div>
        <Dialog open={isCreateMode || selectedTrader !== null} onOpenChange={(open) => {
          if (!open) {
            setIsCreateMode(false);
            setSelectedTrader(null);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setIsCreateMode(true);
              setSelectedTrader(null);
              resetForm();
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Create Trader
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isCreateMode ? "Create Copy Trader" : "Edit Copy Trader"}</DialogTitle>
              <DialogDescription>
                {isCreateMode ? "Add a new copy trader" : "Update copy trader details"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Trader Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Trader name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  className="w-full rounded-md border border-gray-800 bg-background px-3 py-2 min-h-[100px]"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Trader description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="winRate">Win Rate (%)</Label>
                  <Input
                    id="winRate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.winRate}
                    onChange={(e) => setFormData({ ...formData, winRate: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalTrades">Total Trades</Label>
                  <Input
                    id="totalTrades"
                    type="number"
                    min="0"
                    value={formData.totalTrades}
                    onChange={(e) => setFormData({ ...formData, totalTrades: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">Image URL (Optional)</Label>
                <Input
                  id="image"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <Button
                onClick={isCreateMode ? handleCreate : handleUpdate}
                disabled={isSubmitting || !formData.name || !formData.description}
                className="w-full"
              >
                {isSubmitting ? "Processing..." : isCreateMode ? "Create Trader" : "Update Trader"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Copy Traders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Win Rate</TableHead>
                <TableHead>Total Trades</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {traders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-400">
                    No copy traders found
                  </TableCell>
                </TableRow>
              ) : (
                traders.map((trader) => (
                  <TableRow key={trader?._id || 'unknown'}>
                    <TableCell className="font-medium">{trader?.name || 'N/A'}</TableCell>
                    <TableCell className="max-w-xs truncate">{trader?.description || 'N/A'}</TableCell>
                    <TableCell className={trader?.winRate && trader.winRate > 0 ? "text-green-500" : "text-gray-400"}>
                      {(trader?.winRate ?? 0)}%
                    </TableCell>
                    <TableCell>{(trader?.totalTrades ?? 0).toLocaleString()}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(trader)}
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

