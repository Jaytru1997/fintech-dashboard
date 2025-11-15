"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores/auth";
import { useUserStore } from "@/stores/user";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User, Settings, LogOut, Menu, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MobileMenu } from "./MobileMenu";
import { userApi } from "@/lib/api/endpoints";
import { toast } from "react-toastify";

export function Navbar() {
  const { user, clearAuth, updateUser, isAdmin, token } = useAuthStore();
  const { setBalances } = useUserStore();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleLogout = () => {
    clearAuth();
    router.push("/auth/login");
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
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update data");
    } finally {
      setIsRefreshing(false);
    }
  };

  const initials = user
    ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase()
    : "U";

  return (
    <>
      <nav className="sticky top-0 z-30 h-16 bg-background-darkest shadow-md">
        <div className="flex h-full items-center justify-between px-6">
          <div className="flex items-center">
            <h2 className="text-base font-medium text-white">Dashboard</h2>
          </div>  
          <div className="flex items-center gap-4">
            {/* Update Button - For both users and admins */}
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing}
              variant="outline"
              size="sm"
              className="hidden sm:flex items-center gap-2 text-white border-gray-700 hover:bg-gray-800"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              <span className="hidden md:inline">Update</span>
            </Button>
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden flex h-10 w-10 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-gray-800 transition-colors">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.profilePicture} alt={user?.firstName} />
                  <AvatarFallback className="bg-primary text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-white hidden md:block">
                  {user?.firstName} {user?.lastName}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-error">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          </div>
        </div>
      </nav>
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
    </>
  );
}

