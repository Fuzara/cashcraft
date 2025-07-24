"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/transactions", label: "Transactions" },
  { href: "/settings", label: "Settings" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-secondary text-white shadow-lg z-50">
      <div className="flex justify-around max-w-screen-md mx-auto">
        {navItems.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`flex-1 text-center py-4 text-sm font-medium transition-colors ${
              pathname === href
                ? "text-primary bg-gray-700"
                : "hover:bg-gray-700"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}