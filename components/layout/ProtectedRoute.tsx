"use client";

import { useEffect, useState } from "react";
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
  const { token, isAdmin, _hasHydrated } = useAuthStore();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  // Wait for hydration before checking auth
  useEffect(() => {
    if (_hasHydrated) {
      setIsChecking(false);
    }
  }, [_hasHydrated]);

  useEffect(() => {
    // Only check auth after hydration is complete
    if (!_hasHydrated) {
      return;
    }

    if (!token) {
      router.push("/auth/login");
      return;
    }

    if (adminOnly && !isAdmin) {
      router.push("/dashboard");
      return;
    }
  }, [token, isAdmin, router, adminOnly, _hasHydrated]);

  // Show loading state while checking hydration
  if (!_hasHydrated || isChecking) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!token) {
    return null;
  }

  if (adminOnly && !isAdmin) {
    return null;
  }

  return <>{children}</>;
}

