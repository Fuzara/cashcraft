// /src/app/dashboard/layout.tsx
"use client";

import BottomNav from "../../components/BottomNav";
import Navbar from "../../components/Navbar";
import { useActor } from "../../hooks/useActor";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, logout } = useActor("wallets_backend");

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar isAuthenticated={isAuthenticated} logout={logout} />
      <main className="pb-20">{children}</main>
      <BottomNav />
    </div>
  );
}
