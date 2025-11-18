"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { X, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Wallet,
  CreditCard,
  TrendingUp,
  Activity,
  Building2,
  ArrowDownCircle,
  ArrowUpCircle,
  Copy,
  User,
  Settings,
  LogOut,
  BarChart2,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth";
import { useUserStore } from "@/stores/user";
import { userApi } from "@/lib/api/endpoints";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";

const userNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/deposits", label: "Deposit", icon: ArrowDownCircle },
  { href: "/dashboard/withdrawals", label: "Withdrawal", icon: ArrowUpCircle },
  { href: "/dashboard/balances", label: "Balances", icon: Wallet },
  { href: "/dashboard/subscriptions", label: "Subscriptions", icon: CreditCard },
  { href: "/dashboard/signal", label: "Signal", icon: TrendingUp },
  { href: "/dashboard/mining", label: "Mining", icon: Activity },
  { href: "/dashboard/trading", label: "Trading", icon: TrendingUp },
  { href: "/dashboard/assets", label: "Assets", icon: BarChart2 },
  { href: "/dashboard/markets", label: "Markets", icon: BarChart2 },
  { href: "/dashboard/real-estate", label: "Real Estate", icon: Building2 },
  { href: "/dashboard/copy-trading", label: "Copy Trading", icon: Copy },
  { href: "/dashboard/profile", label: "Profile", icon: User },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

const adminNavItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: User },
  { href: "/admin/real-estate", label: "Real Estate", icon: Building2 },
  { href: "/admin/mining-pools", label: "Mining Pools", icon: Activity },
  { href: "/admin/copy-traders", label: "Copy Traders", icon: Copy },
  { href: "/admin/subscriptions", label: "Subscriptions", icon: CreditCard },
  { href: "/admin/signal-prices", label: "Signal Prices", icon: TrendingUp },
  { href: "/admin/deposit-methods", label: "Deposit Methods", icon: ArrowDownCircle },
  { href: "/admin/withdrawal-methods", label: "Withdrawal Methods", icon: ArrowUpCircle },
  { href: "/admin/deposits", label: "Deposits", icon: ArrowDownCircle },
  { href: "/admin/withdrawals", label: "Withdrawals", icon: ArrowUpCircle },
  { href: "/admin/trades", label: "Trades", icon: TrendingUp },
];

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAdmin, clearAuth, updateUser, token } = useAuthStore();
  const { setBalances } = useUserStore();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navItems = isAdmin ? adminNavItems : userNavItems;

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleLogout = () => {
    clearAuth();
    router.push("/auth/login");
    onClose();
  };

  const handleRefresh = async () => {
    if (!token) return;
    
    setIsRefreshing(true);
    try {
      if (isAdmin) {
        // Admin refresh: fetch admin profile
        const profileData = await userApi.getProfile();
        if (profileData) {
          updateUser(profileData);
        }
        toast.success("Admin data updated successfully!");
      } else {
        // User refresh: fetch user profile and balances in parallel
        const [profileData, balancesData] = await Promise.all([
          userApi.getProfile(),
          userApi.getBalances(),
        ]);

        // Update auth store with fresh user data
        if (profileData) {
          updateUser(profileData);
          
          // If profile includes balances, also update user store
          if (profileData.balances) {
            setBalances(profileData.balances);
          }
        }

        // Update user store with fresh balances (from dedicated endpoint)
        if (balancesData) {
          setBalances(balancesData);
        }

        toast.success("Data updated successfully!");
      }
      onClose(); // Close menu after successful update
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update data");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLinkClick = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background-darkest/95 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Menu Content */}
      <div className="relative h-full w-full overflow-y-auto bg-background-darkest">
        {/* Header */}
        <div className="sticky top-0 z-10 flex h-16 items-center justify-between bg-background-darkest px-6 shadow-sm">
          <div className="flex items-center gap-3">
            <Image
              src="/assets/fintech.svg"
              alt="Fintech Logo"
              width={32}
              height={32}
              className="flex-shrink-0"
            />
            <span className="text-lg font-bold text-white">Menu</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Update Button - For both users and admins */}
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 text-white border-gray-700 hover:bg-gray-800"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Update</span>
            </Button>
            <button
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
              aria-label="Close menu"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Menu Grid */}
        <div className="p-6">
          <div className="grid grid-cols-3 gap-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              // For base routes (/dashboard, /admin), only match exactly
              // For other routes, match exactly or if pathname starts with the href + "/"
              const isBaseRoute = item.href === "/dashboard" || item.href === "/admin";
              const isActive = isBaseRoute 
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleLinkClick}
                  className={cn(
                    "group flex flex-col items-center justify-center gap-2 rounded-xl p-4 transition-all",
                    isActive
                      ? "bg-primary text-white shadow-lg shadow-primary/20"
                      : "border-1 border-primary/50 text-gray-300 hover:bg-gray-800 hover:text-white"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-lg transition-colors",
                      isActive
                        ? "bg-white/20"
                        : "bg-background-darkest group-hover:bg-gray-700"
                    )}
                  >
                    <Icon className={cn(
                      "h-6 w-6 transition-colors",
                      isActive 
                        ? "text-white" 
                        : "text-gray-400 group-hover:text-white"
                    )} />
                  </div>
                  <span className="text-xs font-medium text-center leading-tight">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Logout Button */}
          <div className="mt-6 pt-6">
            <button
              onClick={handleLogout}
              className="flex w-full flex-col items-center justify-center gap-2 rounded-xl bg-error/10 p-4 text-error hover:bg-error/20 transition-colors"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-error/20">
                <LogOut className="h-6 w-6" />
              </div>
              <span className="text-xs font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

