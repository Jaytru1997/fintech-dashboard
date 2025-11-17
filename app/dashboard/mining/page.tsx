"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { userApi } from "@/lib/api/endpoints";
import { MiningPool, Staking } from "@/lib/types";
import { toast } from "react-toastify";
import { Activity } from "lucide-react";

export default function MiningPage() {
  const [pools, setPools] = useState<MiningPool[]>([]);
  const [stakings, setStakings] = useState<Staking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPool, setSelectedPool] = useState<MiningPool | null>(null);
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [poolsData, stakingsData] = await Promise.all([
        userApi.getMiningPools(),
        userApi.getStakings(),
      ]);
      // Ensure all data is always an array
      setPools(Array.isArray(poolsData) ? poolsData : []);
      setStakings(Array.isArray(stakingsData) ? stakingsData : []);
    } catch (error) {
      toast.error("Failed to load mining data");
      // Ensure all arrays are initialized even on error
      setPools([]);
      setStakings([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStake = async () => {
    if (!selectedPool || !amount) return;
    setIsSubmitting(true);
    try {
      await userApi.stake({
        poolId: selectedPool._id,
        amount: parseFloat(amount),
      });
      toast.success("Staking successful!");
      setSelectedPool(null);
      setAmount("");
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Staking failed");
    } finally {
      setIsSubmitting(false);
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
      className="space-y-6 max-w-full overflow-x-hidden"
      style={{ minWidth: 0 }}
    >
      <div>
        <h1 className="text-2xl font-semibold text-white">Mining Pools</h1>
        <p className="text-gray-400 mt-2">
          Stake in mining pools to earn passive income
        </p>
      </div>

      <Tabs defaultValue="pools" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pools">Available Pools</TabsTrigger>
          <TabsTrigger value="history">Staking History</TabsTrigger>
        </TabsList>

        <TabsContent value="pools" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pools.map((pool) => (
              <Card key={pool._id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    {pool.name}
                  </CardTitle>
                  <CardDescription>
                    ROI: {pool.roi}% | Cycle: {pool.cycle}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-400">
                      Min Stake: ${pool.minStake}
                    </p>
                    <p className="text-sm text-gray-400">
                      Duration: {pool.durationDays} days
                    </p>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        className="w-full"
                        onClick={() => setSelectedPool(pool)}
                      >
                        Stake Now
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Stake in {pool.name}</DialogTitle>
                        <DialogDescription>
                          ROI: {pool.roi}% | Min Stake: ${pool.minStake}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="amount">Amount</Label>
                          <Input
                            id="amount"
                            type="number"
                            min={pool.minStake}
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Enter amount"
                          />
                        </div>
                        <div className="p-4 bg-background-dark rounded-lg">
                          <p className="text-sm text-gray-400">Pool Details:</p>
                          <p className="text-sm text-white">ROI: {pool.roi}%</p>
                          <p className="text-sm text-white">Cycle: {pool.cycle}</p>
                          <p className="text-sm text-white">Duration: {pool.durationDays} days</p>
                          <p className="text-sm text-gray-400 mt-2">Expected Return:</p>
                          <p className="text-2xl font-bold text-white">
                            ${amount
                              ? (parseFloat(amount) * (1 + pool.roi / 100)).toFixed(2)
                              : "0.00"}
                          </p>
                        </div>
                        <Button
                          onClick={handleStake}
                          disabled={isSubmitting || !amount || parseFloat(amount) < pool.minStake}
                          className="w-full"
                        >
                          {isSubmitting ? "Processing..." : "Confirm Stake"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ))}
          </div>

          {pools.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-400">No mining pools available</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card className="overflow-hidden max-w-full">
            <CardHeader>
              <CardTitle>Staking History</CardTitle>
            </CardHeader>
            <CardContent className="max-w-full" style={{ minWidth: 0 }}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pool</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stakings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-gray-400">
                        No staking history
                      </TableCell>
                    </TableRow>
                  ) : (
                    stakings.map((staking) => (
                      <TableRow key={staking._id}>
                        <TableCell>{staking.poolId || "N/A"}</TableCell>
                        <TableCell>${staking.amount.toLocaleString()}</TableCell>
                        <TableCell>
                          {staking.startDate && staking.endDate
                            ? `${Math.ceil((new Date(staking.endDate).getTime() - new Date(staking.startDate).getTime()) / (1000 * 60 * 60 * 24))} days`
                            : "N/A"}
                        </TableCell>
                        <TableCell>
                          <span className="px-2 py-1 rounded text-xs bg-primary/20 text-primary">
                            Active
                          </span>
                        </TableCell>
                        <TableCell>
                          {staking.startDate ? new Date(staking.startDate).toLocaleDateString() : "N/A"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}

