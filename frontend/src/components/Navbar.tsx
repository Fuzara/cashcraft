"use client";

import { AuthClient } from "@dfinity/auth-client";
import { useRouter } from "next/navigation";

type NavbarProps = {
  isAuthenticated: boolean;
  logout: () => void;
};

export default function Navbar({ isAuthenticated, logout }: NavbarProps) {
  const router = useRouter();

  return (
    <nav className="bg-white text-gray-800 p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-2xl font-bold text-blue-600">CashCraft</div>
        {isAuthenticated && (
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}