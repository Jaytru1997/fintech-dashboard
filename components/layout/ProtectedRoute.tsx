"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export function ProtectedRoute({
  children,
  adminOnly = false,
}: ProtectedRouteProps) {
  const { token, isAdmin } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      router.push("/auth/login");
      return;
    }

    if (adminOnly && !isAdmin) {
      router.push("/dashboard");
      return;
    }
  }, [token, isAdmin, router, adminOnly]);

  if (!token) {
    return null;
  }

  if (adminOnly && !isAdmin) {
    return null;
  }

  return <>{children}</>;
}

