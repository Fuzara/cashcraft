// /src/app/login/page.tsx
"use client";

import { useAuth } from "@/lib/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { login, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, loading, router]);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Login to CashCraft</h1>
      <p>Use Internet Identity to securely access your dashboard.</p>
      <button onClick={login} disabled={loading}>
        {loading ? "Checking..." : "Login with Internet Identity"}
      </button>
    </div>
  );
}
