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
import { AdminUser } from "@/lib/types";
import { toast } from "react-toastify";
import { User, Check, X, Edit } from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    mainBalance: "",
    miningBalance: "",
    tradeBalance: "",
    realEstateBalance: "",
    referralBalance: "",
    signalStrength: "",
    minTradingAmount: "",
    kycStatus: "pending" as "pending" | "approved" | "rejected",
    isAdmin: false,
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const response = await adminApi.getUsers();
      // API client extracts data field, so response should be array directly
      const validUsers = Array.isArray(response) ? response : [];
      setUsers(validUsers);
    } catch (error: any) {
      console.error("Error loading users:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to load users");
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    setIsSubmitting(true);
    try {
      const updateData: any = {};
      const maybeNumber = (value: string) => {
        const parsed = parseFloat(value);
        return Number.isNaN(parsed) ? undefined : parsed;
      };

      const mainBalance = maybeNumber(formData.mainBalance);
      if (mainBalance !== undefined) {
        updateData.mainBalance = mainBalance;
      }
      const miningBalance = maybeNumber(formData.miningBalance);
      if (miningBalance !== undefined) {
        updateData.miningBalance = miningBalance;
      }
      const tradeBalance = maybeNumber(formData.tradeBalance);
      if (tradeBalance !== undefined) {
        updateData.tradeBalance = tradeBalance;
      }
      const realEstateBalance = maybeNumber(formData.realEstateBalance);
      if (realEstateBalance !== undefined) {
        updateData.realEstateBalance = realEstateBalance;
      }
      const referralBalance = maybeNumber(formData.referralBalance);
      if (referralBalance !== undefined) {
        updateData.referralBalance = referralBalance;
      }
      if (formData.signalStrength) {
        const signalStrength = maybeNumber(formData.signalStrength);
        if (signalStrength !== undefined) {
          updateData.signalStrength = signalStrength;
        }
      }
      if (formData.minTradingAmount) {
        const minTradingAmount = maybeNumber(formData.minTradingAmount);
        if (minTradingAmount !== undefined) {
          updateData.minTradingAmount = minTradingAmount;
        }
      }
      if (formData.kycStatus) {
        updateData.kycStatus = formData.kycStatus;
      }
      updateData.isAdmin = formData.isAdmin;

      await adminApi.updateUser(selectedUser._id, updateData);
      toast.success("User updated successfully");
      setSelectedUser(null);
      loadUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApproveKYC = async (userId: string) => {
    try {
      await adminApi.approveKYC(userId);
      toast.success("KYC approved");
      loadUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to approve KYC");
    }
  };

  const handleRejectKYC = async (userId: string) => {
    try {
      await adminApi.rejectKYC(userId);
      toast.success("KYC rejected");
      loadUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to reject KYC");
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
        <h1 className="text-2xl font-semibold text-white">Users</h1>
        <p className="text-gray-400 mt-2">
          Manage all platform users
        </p>
      </div>

      <Card className="overflow-hidden max-w-full">
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent className="max-w-full" style={{ minWidth: 0 }}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>KYC Status</TableHead>
                <TableHead>Signal Strength</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                      <TableCell colSpan={5} className="text-center text-gray-400">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user?._id || 'unknown'}>
                    <TableCell>
                      {user?.firstName || 'N/A'} {user?.lastName || ''}
                    </TableCell>
                    <TableCell>{user?.email || 'N/A'}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          user?.kycStatus === "approved"
                            ? "bg-green-500/20 text-green-500"
                            : user?.kycStatus === "rejected"
                            ? "bg-error/20 text-error"
                            : "bg-primary/20 text-primary"
                        }`}
                      >
                        {user?.kycStatus || 'pending'}
                      </span>
                    </TableCell>
                    <TableCell>{user?.signalStrength ?? 0}%</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (!user?._id) return;
                                setSelectedUser(user);
                                setFormData({
                                mainBalance: user?.balances?.main?.amount?.toString() || "",
                                miningBalance: user?.balances?.mining?.amount?.toString() || "",
                                tradeBalance: user?.balances?.trade?.amount?.toString() || "",
                                realEstateBalance: user?.balances?.realEstate?.amount?.toString() || "",
                                referralBalance: user?.balances?.referral?.amount?.toString() || "",
                                signalStrength: (user?.signalStrength ?? 0).toString(),
                                minTradingAmount: user?.minTradingAmount?.toString() || "",
                                kycStatus: user?.kycStatus || "pending",
                                isAdmin: user?.isAdmin ?? false,
                                });
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Edit User: {user?.firstName || 'Unknown'} {user?.lastName || ''}</DialogTitle>
                              <DialogDescription>
                                Update user balances, signal strength, and KYC status
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label>Balances</Label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <Label htmlFor="mainBalance">Main Balance</Label>
                                    <Input
                                      id="mainBalance"
                                      type="number"
                                      step="0.01"
                                      value={formData.mainBalance}
                                      onChange={(e) =>
                                        setFormData({ ...formData, mainBalance: e.target.value })
                                      }
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="miningBalance">Mining Balance</Label>
                                    <Input
                                      id="miningBalance"
                                      type="number"
                                      step="0.01"
                                      value={formData.miningBalance}
                                      onChange={(e) =>
                                        setFormData({ ...formData, miningBalance: e.target.value })
                                      }
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="tradeBalance">Trade Balance</Label>
                                    <Input
                                      id="tradeBalance"
                                      type="number"
                                      step="0.01"
                                      value={formData.tradeBalance}
                                      onChange={(e) =>
                                        setFormData({ ...formData, tradeBalance: e.target.value })
                                      }
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="realEstateBalance">Real Estate Balance</Label>
                                    <Input
                                      id="realEstateBalance"
                                      type="number"
                                      step="0.01"
                                      value={formData.realEstateBalance}
                                      onChange={(e) =>
                                        setFormData({ ...formData, realEstateBalance: e.target.value })
                                      }
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="referralBalance">Referral Balance</Label>
                                    <Input
                                      id="referralBalance"
                                      type="number"
                                      step="0.01"
                                      value={formData.referralBalance}
                                      onChange={(e) =>
                                        setFormData({ ...formData, referralBalance: e.target.value })
                                      }
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="signalStrength">Signal Strength</Label>
                                <Input
                                  id="signalStrength"
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={formData.signalStrength}
                                  onChange={(e) =>
                                    setFormData({ ...formData, signalStrength: e.target.value })
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="minTradingAmount">Minimum Trading Amount</Label>
                                <Input
                                  id="minTradingAmount"
                                  type="number"
                                  min="0"
                                  value={formData.minTradingAmount}
                                  onChange={(e) =>
                                    setFormData({ ...formData, minTradingAmount: e.target.value })
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="kycStatus">KYC Status</Label>
                                <select
                                  id="kycStatus"
                                  value={formData.kycStatus}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      kycStatus: e.target.value as "pending" | "approved" | "rejected",
                                    })
                                  }
                                  className="w-full rounded-md border border-gray-700 text-white px-3 py-2"
                                  style={{ backgroundColor: "#0f0e2a" }}
                                >
                                  <option value="pending" className="bg-[#1e1b4b] text-white">Pending</option>
                                  <option value="approved" className="bg-[#1e1b4b] text-white">Approved</option>
                                  <option value="rejected" className="bg-[#1e1b4b] text-white">Rejected</option>
                                </select>
                              </div>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id="isAdmin"
                                  checked={formData.isAdmin}
                                  onChange={(e) =>
                                    setFormData({ ...formData, isAdmin: e.target.checked })
                                  }
                                  className="rounded border-gray-800"
                                />
                                <Label htmlFor="isAdmin">Is Admin</Label>
                              </div>
                              <Button onClick={handleUpdateUser} disabled={isSubmitting} className="w-full">
                                {isSubmitting ? "Updating..." : "Update User"}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                        {user?.kycStatus === "pending" && user?._id && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleApproveKYC(user._id)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRejectKYC(user._id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
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

