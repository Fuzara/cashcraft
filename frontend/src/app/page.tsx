"use client";

import { AuthClient } from "@dfinity/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();
  const login = async () => {
    const authClient = await AuthClient.create();
    await authClient.login({
      identityProvider: "https://identity.ic0.app",
      onSuccess: () => {
        router.push("/dashboard");
      },
    });
  };

  useEffect(() => {
    const checkAuth = async () => {
      const authClient = await AuthClient.create();
      if (await authClient.isAuthenticated()) {
        router.push("/dashboard");
      }
    };
    checkAuth();
  }, [router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Welcome to CashCraft</h1>
      <p className="text-lg mb-8">Your personal finance manager on the Internet Computer.</p>
      <button
        onClick={login}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
      >
        Login with Internet Identity
      </button>
    </main>
  );
}
