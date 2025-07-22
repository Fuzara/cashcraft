// /app/dashboard/wallets/page.tsx

"use client";

import { useState } from "react";

interface Wallet {
  id: string;
  name: string;
  balance: number;
}

export default function WalletsPage() {
  const [wallets, setWallets] = useState<Wallet[]>([
    { id: "1", name: "Rent", balance: 12000 },
    { id: "2", name: "Savings", balance: 5000 },
  ]);

  const [newWallet, setNewWallet] = useState("");
  const [showForm, setShowForm] = useState(false);

  const addWallet = () => {
    if (!newWallet.trim()) return;
    const wallet: Wallet = {
      id: crypto.randomUUID(),
      name: newWallet,
      balance: 0,
    };
    setWallets((prev) => [...prev, wallet]);
    setNewWallet("");
    setShowForm(false);
  };

  return (
    <div>
      <h1>My Wallets</h1>

      <button onClick={() => setShowForm(!showForm)} style={{ marginBottom: "1rem" }}>
        {showForm ? "Cancel" : "Add Wallet"}
      </button>

      {showForm && (
        <div style={{ marginBottom: "1rem" }}>
          <input
            type="text"
            placeholder="Wallet Name"
            value={newWallet}
            onChange={(e) => setNewWallet(e.target.value)}
            style={{ marginRight: "0.5rem" }}
          />
          <button onClick={addWallet}>Create</button>
        </div>
      )}

      <ul>
        {wallets.map((wallet) => (
          <li key={wallet.id} style={{ marginBottom: "1rem" }}>
            <div
              style={{
                padding: "1rem",
                borderRadius: "8px",
                background: "#f4f4f4",
                boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
              }}
            >
              <strong>{wallet.name}</strong>: KES {wallet.balance.toLocaleString()}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}