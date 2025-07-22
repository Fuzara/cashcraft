"use client";
import { useEffect, useState } from "react";
import { createActor } from "@/lib/createActor";
import { Principal } from "@dfinity/principal";

type Wallet = { id: number; name: string; balance: bigint };

export default function Dashboard() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWallets = async () => {
      try {
        const actor = createActor("wallets_backend");
        const principal = Principal.anonymous();
        const result = await actor.get_wallets(principal);
        if (Array.isArray(result)) {
          setWallets(result);
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
  }, []);

  if (loading) return <p>Loading wallets...</p>;
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
