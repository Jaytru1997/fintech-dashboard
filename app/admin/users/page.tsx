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
    balances: { main: "", mining: "", trade: "", realEstate: "", referral: "" },
    signalStrength: "",
    kycStatus: "pending" as "pending" | "approved" | "rejected",
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await adminApi.getUsers();
      setUsers(data);
    } catch (error) {
      toast.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    setIsSubmitting(true);
    try {
      const updateData: any = {};
      if (formData.signalStrength) {
        updateData.signalStrength = parseFloat(formData.signalStrength);
      }
      if (formData.kycStatus) {
        updateData.kycStatus = formData.kycStatus;
      }
      const balances: any = {};
      Object.entries(formData.balances).forEach(([key, value]) => {
        if (value) balances[key] = parseFloat(value);
      });
      if (Object.keys(balances).length > 0) {
        updateData.balances = balances;
      }
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
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold">Users</h1>
        <p className="text-muted-foreground mt-2">
          Manage all platform users
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
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
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>
                      {user.firstName} {user.lastName}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          user.kycStatus === "approved"
                            ? "bg-green-500/20 text-green-500"
                            : user.kycStatus === "rejected"
                            ? "bg-error/20 text-error"
                            : "bg-primary/20 text-primary"
                        }`}
                      >
                        {user.kycStatus}
                      </span>
                    </TableCell>
                    <TableCell>{user.signalStrength}%</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user);
                                setFormData({
                                  balances: {
                                    main: user.balances?.main?.toString() || "",
                                    mining: user.balances?.mining?.toString() || "",
                                    trade: user.balances?.trade?.toString() || "",
                                    realEstate: user.balances?.realEstate?.toString() || "",
                                    referral: user.balances?.referral?.toString() || "",
                                  },
                                  signalStrength: user.signalStrength?.toString() || "",
                                  kycStatus: user.kycStatus,
                                });
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Edit User: {user.firstName} {user.lastName}</DialogTitle>
                              <DialogDescription>
                                Update user balances, signal strength, and KYC status
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label>Balances</Label>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label htmlFor="main">Main</Label>
                                    <Input
                                      id="main"
                                      type="number"
                                      value={formData.balances.main}
                                      onChange={(e) =>
                                        setFormData({
                                          ...formData,
                                          balances: { ...formData.balances, main: e.target.value },
                                        })
                                      }
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="mining">Mining</Label>
                                    <Input
                                      id="mining"
                                      type="number"
                                      value={formData.balances.mining}
                                      onChange={(e) =>
                                        setFormData({
                                          ...formData,
                                          balances: { ...formData.balances, mining: e.target.value },
                                        })
                                      }
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="trade">Trade</Label>
                                    <Input
                                      id="trade"
                                      type="number"
                                      value={formData.balances.trade}
                                      onChange={(e) =>
                                        setFormData({
                                          ...formData,
                                          balances: { ...formData.balances, trade: e.target.value },
                                        })
                                      }
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="realEstate">Real Estate</Label>
                                    <Input
                                      id="realEstate"
                                      type="number"
                                      value={formData.balances.realEstate}
                                      onChange={(e) =>
                                        setFormData({
                                          ...formData,
                                          balances: { ...formData.balances, realEstate: e.target.value },
                                        })
                                      }
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="referral">Referral</Label>
                                    <Input
                                      id="referral"
                                      type="number"
                                      value={formData.balances.referral}
                                      onChange={(e) =>
                                        setFormData({
                                          ...formData,
                                          balances: { ...formData.balances, referral: e.target.value },
                                        })
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
                                  className="w-full rounded-md border border-gray-800 bg-background px-3 py-2"
                                >
                                  <option value="pending">Pending</option>
                                  <option value="approved">Approved</option>
                                  <option value="rejected">Rejected</option>
                                </select>
                              </div>
                              <Button onClick={handleUpdateUser} disabled={isSubmitting} className="w-full">
                                {isSubmitting ? "Updating..." : "Update User"}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                        {user.kycStatus === "pending" && (
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

