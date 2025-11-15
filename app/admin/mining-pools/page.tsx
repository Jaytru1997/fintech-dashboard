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
import { MiningPool, CreateMiningPoolRequest } from "@/lib/types";
import { toast } from "react-toastify";
import { Activity, Plus, Edit } from "lucide-react";

export default function AdminMiningPoolsPage() {
  const [pools, setPools] = useState<MiningPool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPool, setSelectedPool] = useState<MiningPool | null>(null);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [formData, setFormData] = useState<CreateMiningPoolRequest>({
    name: "",
    roi: 0,
    cycle: "",
    minStake: 0,
    durationDays: 0,
  });

  useEffect(() => {
    loadPools();
  }, []);

  const loadPools = async () => {
    setIsLoading(true);
    try {
      const response = await adminApi.getMiningPools();
      // Handle different response structures
      let data = response;
      if (response && typeof response === 'object' && 'data' in response && Array.isArray(response.data)) {
        data = response.data;
      } else if (response && typeof response === 'object' && 'pools' in response && Array.isArray(response.pools)) {
        data = response.pools;
      }
      
      const validPools = Array.isArray(data)
        ? data.filter((pool): pool is MiningPool => pool != null && typeof pool === 'object' && ('_id' in pool || 'id' in pool))
          .map((pool: any) => {
            if ('id' in pool && !('_id' in pool)) {
              const { id, ...rest } = pool;
              return { ...rest, _id: id } as MiningPool;
            }
            return pool as MiningPool;
          })
        : [];
      setPools(validPools);
    } catch (error: any) {
      console.error("Error loading pools:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to load mining pools");
      setPools([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    setIsSubmitting(true);
    try {
      await adminApi.createMiningPool(formData);
      toast.success("Mining pool created successfully");
      setIsCreateMode(false);
      resetForm();
      loadPools();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create mining pool");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedPool?._id) return;
    setIsSubmitting(true);
    try {
      await adminApi.updateMiningPool(selectedPool._id, formData);
      toast.success("Mining pool updated successfully");
      setSelectedPool(null);
      resetForm();
      loadPools();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update mining pool");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      roi: 0,
      cycle: "",
      minStake: 0,
      durationDays: 0,
    });
  };

  const handleEdit = (pool: MiningPool) => {
    setSelectedPool(pool);
    setIsCreateMode(false);
    setFormData({
      name: pool?.name || "",
      roi: pool?.roi || 0,
      cycle: pool?.cycle || "",
      minStake: pool?.minStake || 0,
      durationDays: pool?.durationDays || 0,
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
          <h1 className="text-2xl font-semibold text-white">Mining Pools</h1>
          <p className="text-gray-400 mt-2">
            Manage mining pools for staking
          </p>
        </div>
        <Dialog open={isCreateMode || selectedPool !== null} onOpenChange={(open) => {
          if (!open) {
            setIsCreateMode(false);
            setSelectedPool(null);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setIsCreateMode(true);
              setSelectedPool(null);
              resetForm();
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Create Pool
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isCreateMode ? "Create Mining Pool" : "Edit Mining Pool"}</DialogTitle>
              <DialogDescription>
                {isCreateMode ? "Add a new mining pool" : "Update mining pool details"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Pool Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Pool name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="roi">ROI (%)</Label>
                  <Input
                    id="roi"
                    type="number"
                    value={formData.roi}
                    onChange={(e) => setFormData({ ...formData, roi: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cycle">Cycle</Label>
                  <Input
                    id="cycle"
                    value={formData.cycle}
                    onChange={(e) => setFormData({ ...formData, cycle: e.target.value })}
                    placeholder="daily, weekly, monthly"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minStake">Minimum Stake</Label>
                  <Input
                    id="minStake"
                    type="number"
                    value={formData.minStake}
                    onChange={(e) => setFormData({ ...formData, minStake: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="durationDays">Duration (Days)</Label>
                  <Input
                    id="durationDays"
                    type="number"
                    value={formData.durationDays}
                    onChange={(e) => setFormData({ ...formData, durationDays: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <Button
                onClick={isCreateMode ? handleCreate : handleUpdate}
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? "Processing..." : isCreateMode ? "Create Pool" : "Update Pool"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Mining Pools</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>ROI</TableHead>
                <TableHead>Cycle</TableHead>
                <TableHead>Min Stake</TableHead>
                <TableHead>Duration (Days)</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pools.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-400">
                    No mining pools found
                  </TableCell>
                </TableRow>
              ) : (
                pools.map((pool) => (
                  <TableRow key={pool?._id || 'unknown'}>
                    <TableCell className="font-medium">{pool?.name || 'N/A'}</TableCell>
                    <TableCell>{(pool?.roi ?? 0)}%</TableCell>
                    <TableCell>{pool?.cycle || 'N/A'}</TableCell>
                    <TableCell>${(pool?.minStake ?? 0).toLocaleString()}</TableCell>
                    <TableCell>{pool?.durationDays ?? 0}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(pool)}
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

