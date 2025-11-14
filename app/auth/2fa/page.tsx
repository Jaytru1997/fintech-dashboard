"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authApi } from "@/lib/api/endpoints";
import { toast } from "react-toastify";
import Image from "next/image";

const verifySchema = z.object({
  token: z.string().length(6, "Token must be 6 digits"),
});

type VerifyFormData = z.infer<typeof verifySchema>;

export default function TwoFAPage() {
  const router = useRouter();
  const [step, setStep] = useState<"setup" | "verify" | "enable">("setup");
  const [qrCode, setQrCode] = useState<string>("");
  const [secret, setSecret] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyFormData>({
    resolver: zodResolver(verifySchema),
  });

  useEffect(() => {
    setup2FA();
  }, []);

  const setup2FA = async () => {
    try {
      const response = await authApi.setup2FA();
      setQrCode(response.qrCode);
      setSecret(response.secret);
      setStep("verify");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to setup 2FA");
    }
  };

  const onVerify = async (data: VerifyFormData) => {
    setIsLoading(true);
    try {
      await authApi.verify2FA(data);
      setStep("enable");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  const onEnable = async (data: VerifyFormData) => {
    setIsLoading(true);
    try {
      await authApi.enable2FA(data);
      toast.success("2FA enabled successfully!");
      router.push("/dashboard/profile");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to enable 2FA");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-darkest p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Setup 2FA</CardTitle>
            <CardDescription>
              {step === "verify" && "Scan the QR code and enter the verification code"}
              {step === "enable" && "Enter the code again to enable 2FA"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === "verify" && (
              <div className="space-y-4">
                <div className="flex justify-center">
                  {qrCode && (
                    <Image
                      src={qrCode}
                      alt="2FA QR Code"
                      width={200}
                      height={200}
                      className="border rounded"
                    />
                  )}
                </div>
                <div className="text-center text-sm text-gray-400">
                  <p>Secret: {secret}</p>
                  <p className="mt-2">
                    Scan this QR code with your authenticator app (Google
                    Authenticator, Authy, etc.)
                  </p>
                </div>
                <form onSubmit={handleSubmit(onVerify)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="token">Verification Code</Label>
                    <Input
                      id="token"
                      placeholder="000000"
                      maxLength={6}
                      {...register("token")}
                    />
                    {errors.token && (
                      <p className="text-sm text-error">{errors.token.message}</p>
                    )}
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Verifying..." : "Verify"}
                  </Button>
                </form>
              </div>
            )}

            {step === "enable" && (
              <form onSubmit={handleSubmit(onEnable)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="token">Enter Code from Authenticator</Label>
                  <Input
                    id="token"
                    placeholder="000000"
                    maxLength={6}
                    {...register("token")}
                  />
                  {errors.token && (
                    <p className="text-sm text-error">{errors.token.message}</p>
                  )}
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Enabling..." : "Enable 2FA"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

