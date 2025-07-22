"use client";
import { useEffect, useState } from "react";
import { createActor } from "@/lib/createActor";

import { Wallet as BackendWallet } from "@declarations/wallets/wallets_backend_backend.did";

type Wallet = { id: number; name: string; balance: bigint };

import { useAuth } from "@/contexts/AuthProvider";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (isAuthenticated) {
      const fetchWallets = async () => {
        try {
          const actor = createActor("wallets_backend");
          const result = (await actor.getWallets()) as BackendWallet[];
          if (Array.isArray(result)) {
            const transformedWallets: Wallet[] = result.map((w) => ({
              ...w,
              id: Number(w.id),
            }));
            setWallets(transformedWallets);
          } else {
            throw new Error("Invalid response format");
          }
        } catch (err) {
          setError("Failed to fetch wallets");
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchWallets();
    }
  }, [isAuthenticated, authLoading, router]);

  if (authLoading || loading) return <p>Loading wallets...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (wallets.length === 0) return <p>No wallets found.</p>;

  return (
    <div>
      <h1 className="text-xl font-bold">Your Wallets</h1>
      <ul>
        {wallets.map((w) => (
          <li key={w.id}>{w.name}: {w.balance.toString()}</li>
        ))}
      </ul>
    </div>
  );
}
