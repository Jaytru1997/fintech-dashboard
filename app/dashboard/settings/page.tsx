"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "@/stores/auth";
import { userApi } from "@/lib/api/endpoints";
import { toast } from "react-toastify";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import { Shield, Lock, FileText, Upload } from "lucide-react";

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  newPasswordRepeat: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.newPassword === data.newPasswordRepeat, {
  message: "Passwords don't match",
  path: ["newPasswordRepeat"],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [kycFile, setKycFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "image/*": [".png", ".jpg", ".jpeg"],
      "application/pdf": [".pdf"],
    },
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setKycFile(acceptedFiles[0]);
      }
    },
    maxFiles: 1,
  });

  const handlePasswordChange = async (data: PasswordFormData) => {
    setIsLoading(true);
    try {
      await userApi.updateSecurity({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        newPasswordRepeat: data.newPasswordRepeat,
      });
      toast.success("Password updated successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKYCSubmit = async () => {
    if (!kycFile) {
      toast.error("Please select a KYC document");
      return;
    }
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("idDocument", kycFile);
      await userApi.submitKYC(formData);
      toast.success("KYC document submitted successfully");
      setKycFile(null);
      if (user) {
        updateUser({ kycStatus: "pending" });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to submit KYC");
    } finally {
      setIsLoading(false);
    }
  };

  const handle2FAToggle = async (enabled: boolean) => {
    if (enabled && !user?.twoFactorEnabled) {
      router.push("/auth/2fa");
      return;
    }
    // Note: 2FA enable/disable is handled through the 2FA setup flow
    // This toggle just navigates to the setup page
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-semibold text-white">Settings</h1>
        <p className="text-gray-400 mt-2">
          Manage your account settings and security
        </p>
      </div>

      <Tabs defaultValue="security" className="space-y-4">
        <TabsList>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="kyc">KYC Verification</TabsTrigger>
        </TabsList>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Change Password
              </CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(handlePasswordChange)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    placeholder="Enter current password"
                    {...register("currentPassword")}
                  />
                  {errors.currentPassword && (
                    <p className="text-sm text-error">{errors.currentPassword.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Enter new password"
                    {...register("newPassword")}
                  />
                  {errors.newPassword && (
                    <p className="text-sm text-error">{errors.newPassword.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPasswordRepeat">Repeat New Password</Label>
                  <Input
                    id="newPasswordRepeat"
                    type="password"
                    placeholder="Repeat new password"
                    {...register("newPasswordRepeat")}
                  />
                  {errors.newPasswordRepeat && (
                    <p className="text-sm text-error">{errors.newPasswordRepeat.message}</p>
                  )}
                </div>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Updating..." : "Update Password"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Two-Factor Authentication
              </CardTitle>
              <CardDescription>
                Add an extra layer of security to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">2FA Status</p>
                  <p className="text-sm text-muted-foreground">
                    {user?.twoFactorEnabled
                      ? "Two-factor authentication is enabled"
                      : "Two-factor authentication is disabled"}
                  </p>
                </div>
                <Switch
                  checked={user?.twoFactorEnabled || false}
                  onCheckedChange={handle2FAToggle}
                  disabled={isLoading}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kyc" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                KYC Verification
              </CardTitle>
              <CardDescription>
                Submit your identity document for verification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>KYC Status</Label>
                <div>
                  <span
                    className={`px-3 py-1 rounded text-sm ${
                      user?.kycStatus === "approved"
                        ? "bg-green-500/20 text-green-500"
                        : user?.kycStatus === "rejected"
                        ? "bg-error/20 text-error"
                        : "bg-primary/20 text-primary"
                    }`}
                  >
                    {user?.kycStatus?.toUpperCase() || "PENDING"}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Upload ID Document</Label>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isDragActive
                      ? "border-primary bg-primary/10"
                      : "border-gray-800 hover:border-primary/50"
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  {kycFile ? (
                    <p className="text-sm">{kycFile.name}</p>
                  ) : (
                    <div>
                      <p className="text-sm text-gray-400">
                        {isDragActive
                          ? "Drop the file here"
                          : "Drag & drop a file here, or click to select"}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        PNG, JPG, PDF up to 10MB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <Button
                onClick={handleKYCSubmit}
                disabled={isLoading || !kycFile}
                className="w-full"
              >
                {isLoading ? "Submitting..." : "Submit KYC Document"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}

