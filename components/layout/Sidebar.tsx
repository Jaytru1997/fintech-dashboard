"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  { href: "/dashboard/balances", label: "Balances", icon: Wallet },
  { href: "/dashboard/subscriptions", label: "Subscriptions", icon: CreditCard },
  { href: "/dashboard/signal", label: "Signal", icon: TrendingUp },
  { href: "/dashboard/mining", label: "Mining", icon: Activity },
  { href: "/dashboard/trading", label: "Trading", icon: TrendingUp },
  { href: "/dashboard/real-estate", label: "Real Estate", icon: Building2 },
  { href: "/dashboard/deposits", label: "Deposits", icon: ArrowDownCircle },
  { href: "/dashboard/withdrawals", label: "Withdrawals", icon: ArrowUpCircle },
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
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-background-dark border-r border-gray-800 flex flex-col">
      <div className="flex h-16 items-center border-b border-gray-800 px-6">
        <h1 className="text-xl font-bold text-white">Fintech Dashboard</h1>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
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
      <div className="border-t border-gray-800 p-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}

