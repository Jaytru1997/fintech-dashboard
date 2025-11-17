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
    balances: { 
      main: { amount: "", currency: "USD" }, 
      mining: { amount: "", currency: "USD" }, 
      trade: { amount: "", currency: "USD" }, 
      realEstate: { amount: "", currency: "USD" }, 
      referral: { amount: "", currency: "USD" } 
    },
    signalStrength: "",
    kycStatus: "pending" as "pending" | "approved" | "rejected",
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
      if (formData.signalStrength) {
        updateData.signalStrength = parseFloat(formData.signalStrength);
      }
      if (formData.kycStatus) {
        updateData.kycStatus = formData.kycStatus;
      }
      const balances: any = {};
      Object.entries(formData.balances).forEach(([key, value]) => {
        if (value.amount) {
          balances[key] = {
            amount: parseFloat(value.amount),
            currency: value.currency || "USD"
          };
        }
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
        <h1 className="text-2xl font-semibold text-white">Users</h1>
        <p className="text-gray-400 mt-2">
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
                                  balances: {
                                    main: { 
                                      amount: user?.balances?.main?.amount?.toString() || "", 
                                      currency: user?.balances?.main?.currency || "USD" 
                                    },
                                    mining: { 
                                      amount: user?.balances?.mining?.amount?.toString() || "", 
                                      currency: user?.balances?.mining?.currency || "USD" 
                                    },
                                    trade: { 
                                      amount: user?.balances?.trade?.amount?.toString() || "", 
                                      currency: user?.balances?.trade?.currency || "USD" 
                                    },
                                    realEstate: { 
                                      amount: user?.balances?.realEstate?.amount?.toString() || "", 
                                      currency: user?.balances?.realEstate?.currency || "USD" 
                                    },
                                    referral: { 
                                      amount: user?.balances?.referral?.amount?.toString() || "", 
                                      currency: user?.balances?.referral?.currency || "USD" 
                                    },
                                  },
                                  signalStrength: (user?.signalStrength ?? 0).toString(),
                                  kycStatus: user?.kycStatus || "pending",
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
                                <div className="space-y-4">
                                  <div className="grid grid-cols-3 gap-4">
                                    <div>
                                      <Label htmlFor="main-amount">Main Amount</Label>
                                      <Input
                                        id="main-amount"
                                        type="number"
                                        step="0.01"
                                        value={formData.balances.main.amount}
                                        onChange={(e) =>
                                          setFormData({
                                            ...formData,
                                            balances: { 
                                              ...formData.balances, 
                                              main: { ...formData.balances.main, amount: e.target.value }
                                            },
                                          })
                                        }
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="main-currency">Main Currency</Label>
                                      <Input
                                        id="main-currency"
                                        type="text"
                                        value={formData.balances.main.currency}
                                        onChange={(e) =>
                                          setFormData({
                                            ...formData,
                                            balances: { 
                                              ...formData.balances, 
                                              main: { ...formData.balances.main, currency: e.target.value }
                                            },
                                          })
                                        }
                                      />
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-3 gap-4">
                                    <div>
                                      <Label htmlFor="mining-amount">Mining Amount</Label>
                                      <Input
                                        id="mining-amount"
                                        type="number"
                                        step="0.01"
                                        value={formData.balances.mining.amount}
                                        onChange={(e) =>
                                          setFormData({
                                            ...formData,
                                            balances: { 
                                              ...formData.balances, 
                                              mining: { ...formData.balances.mining, amount: e.target.value }
                                            },
                                          })
                                        }
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="mining-currency">Mining Currency</Label>
                                      <Input
                                        id="mining-currency"
                                        type="text"
                                        value={formData.balances.mining.currency}
                                        onChange={(e) =>
                                          setFormData({
                                            ...formData,
                                            balances: { 
                                              ...formData.balances, 
                                              mining: { ...formData.balances.mining, currency: e.target.value }
                                            },
                                          })
                                        }
                                      />
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-3 gap-4">
                                    <div>
                                      <Label htmlFor="trade-amount">Trade Amount</Label>
                                      <Input
                                        id="trade-amount"
                                        type="number"
                                        step="0.01"
                                        value={formData.balances.trade.amount}
                                        onChange={(e) =>
                                          setFormData({
                                            ...formData,
                                            balances: { 
                                              ...formData.balances, 
                                              trade: { ...formData.balances.trade, amount: e.target.value }
                                            },
                                          })
                                        }
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="trade-currency">Trade Currency</Label>
                                      <Input
                                        id="trade-currency"
                                        type="text"
                                        value={formData.balances.trade.currency}
                                        onChange={(e) =>
                                          setFormData({
                                            ...formData,
                                            balances: { 
                                              ...formData.balances, 
                                              trade: { ...formData.balances.trade, currency: e.target.value }
                                            },
                                          })
                                        }
                                      />
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-3 gap-4">
                                    <div>
                                      <Label htmlFor="realEstate-amount">Real Estate Amount</Label>
                                      <Input
                                        id="realEstate-amount"
                                        type="number"
                                        step="0.01"
                                        value={formData.balances.realEstate.amount}
                                        onChange={(e) =>
                                          setFormData({
                                            ...formData,
                                            balances: { 
                                              ...formData.balances, 
                                              realEstate: { ...formData.balances.realEstate, amount: e.target.value }
                                            },
                                          })
                                        }
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="realEstate-currency">Real Estate Currency</Label>
                                      <Input
                                        id="realEstate-currency"
                                        type="text"
                                        value={formData.balances.realEstate.currency}
                                        onChange={(e) =>
                                          setFormData({
                                            ...formData,
                                            balances: { 
                                              ...formData.balances, 
                                              realEstate: { ...formData.balances.realEstate, currency: e.target.value }
                                            },
                                          })
                                        }
                                      />
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-3 gap-4">
                                    <div>
                                      <Label htmlFor="referral-amount">Referral Amount</Label>
                                      <Input
                                        id="referral-amount"
                                        type="number"
                                        step="0.01"
                                        value={formData.balances.referral.amount}
                                        onChange={(e) =>
                                          setFormData({
                                            ...formData,
                                            balances: { 
                                              ...formData.balances, 
                                              referral: { ...formData.balances.referral, amount: e.target.value }
                                            },
                                          })
                                        }
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="referral-currency">Referral Currency</Label>
                                      <Input
                                        id="referral-currency"
                                        type="text"
                                        value={formData.balances.referral.currency}
                                        onChange={(e) =>
                                          setFormData({
                                            ...formData,
                                            balances: { 
                                              ...formData.balances, 
                                              referral: { ...formData.balances.referral, currency: e.target.value }
                                            },
                                          })
                                        }
                                      />
                                    </div>
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

