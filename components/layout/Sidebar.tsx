"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
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
} from "lucide-react";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "next/navigation";

const userNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/deposits", label: "Deposit", icon: ArrowDownCircle },
  { href: "/dashboard/withdrawals", label: "Withdrawal", icon: ArrowUpCircle },
  { href: "/dashboard/balances", label: "Balances", icon: Wallet },
  { href: "/dashboard/subscriptions", label: "Subscriptions", icon: CreditCard },
  { href: "/dashboard/signal", label: "Signal", icon: TrendingUp },
  { href: "/dashboard/mining", label: "Mining", icon: Activity },
  { href: "/dashboard/trading", label: "Trading", icon: TrendingUp },
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

export function Sidebar() {
  const pathname = usePathname();
  const { isAdmin, clearAuth } = useAuthStore();
  const router = useRouter();

  const navItems = isAdmin ? adminNavItems : userNavItems;

  const handleLogout = () => {
    clearAuth();
    router.push("/auth/login");
  };

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 z-40 h-screen w-64 bg-background-dark shadow-lg flex-col">
      <div className="flex h-16 items-center gap-3 px-6 shadow-sm">
        <Image
          src="/assets/fintech.svg"
          alt="Fintech Logo"
          width={32}
          height={32}
          className="flex-shrink-0"
        />
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
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
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-colors",
                isActive
                  ? "bg-primary text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 shadow-sm">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}

