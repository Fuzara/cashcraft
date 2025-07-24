"use client";

import { useState, useEffect } from "react";
import { useActor } from "../../../hooks/useActor";
import type { Wallet } from "../../../declarations/wallets_backend_backend/service.did";

const MOCK_WALLETS: Wallet[] = [
  { id: 1n, name: "Mock Rent", balance: 12000n },
  { id: 2n, name: "Mock Savings", balance: 5000n },
];

export default function WalletsPage() {
  const { actor: walletsActor, identity, isAuthenticated } = useActor("wallets_backend");
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [newWalletName, setNewWalletName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWallets = async () => {
      if (!walletsActor || !identity) {
        console.warn("Wallets actor or identity not available. Falling back to mock data.");
        setWallets(MOCK_WALLETS);
        setIsLoading(false);
        return;
      }

      try {
        const userPrincipal = identity.getPrincipal();
        const fetchedWallets = await walletsActor.get_wallets(userPrincipal);
        setWallets(fetchedWallets);
      } catch (e) {
        console.error("Failed to fetch wallets:", e);
        setError("Failed to load wallets. Displaying mock data as a fallback.");
        setWallets(MOCK_WALLETS);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchWallets();
    }
  }, [walletsActor, isAuthenticated, identity]);

  const addWallet = async () => {
    if (!newWalletName.trim() || !walletsActor) return;

    try {
      const newWallet = await walletsActor.create_wallet(newWalletName, 0n);
      setWallets((prev) => [...prev, newWallet]);
      setNewWalletName("");
    } catch (e) {
      console.error("Failed to create wallet:", e);
      setError("Failed to create wallet. Please try again.");
    }
  };

  if (!isAuthenticated) {
    return <div>Please log in to view your wallets.</div>;
  }

  if (isLoading) {
    return <div>Loading wallets...</div>;
  }

  return (
    <div>
      <h1>My Wallets</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="New Wallet Name"
          value={newWalletName}
          onChange={(e) => setNewWalletName(e.target.value)}
          style={{ marginRight: "0.5rem" }}
        />
        <button onClick={addWallet} disabled={!walletsActor}>
          Create Wallet
        </button>
      </div>

      <ul>
        {wallets.map((wallet) => (
          <li key={String(wallet.id)} style={{ marginBottom: "1rem", background: "#f4f4f4", padding: "1rem", borderRadius: "8px" }}>
            <strong>{wallet.name}</strong>: KES {Number(wallet.balance).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
}