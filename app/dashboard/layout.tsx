"use client";

import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-background-darkest">
        <Sidebar />
        <div className="flex-1 flex flex-col lg:ml-64">
          <Navbar />
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 bg-background-darkest max-w-full">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

