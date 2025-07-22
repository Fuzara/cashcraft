"use client";

import React, { useEffect, useState } from "react";
import { createActor } from "@/lib/createActor";

// Define the Wallet interface according to the Motoko backend
interface Wallet {
  id: number;
  name: string;
  balance: bigint;
}

export default function DashboardPage() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWallets = async () => {
      try {
        setLoading(true);
        // Create an actor for the 'wallets_backend_backend' canister
        const actor = createActor("wallets_backend");
        // Fetch the wallets
        const result = await actor.get_wallets();
        setWallets(result);
      } catch (err) {
        console.error("Error fetching wallets:", err);
        setError("Failed to load wallets. Please check the console for details.");
      } finally {
        setLoading(false);
      }
    };

    fetchWallets();
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Wallet Dashboard</h1>

        {loading && (
          <div className="flex justify-center items-center p-8">
            <p className="text-lg text-gray-600">Loading wallets...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && wallets.length === 0 && (
          <div className="text-center p-8 bg-white rounded-lg shadow">
            <p className="text-gray-600">No wallets found. You can create one in the backend!</p>
          </div>
        )}

        {!loading && !error && wallets.length > 0 && (
          <ul className="space-y-4">
            {wallets.map((wallet) => (
              <li
                key={wallet.id}
                className="p-5 bg-white rounded-lg shadow-md transition hover:shadow-lg flex justify-between items-center"
              >
                <div>
                  <p className="text-xl font-semibold text-gray-800">{wallet.name}</p>
                  <p className="text-sm text-gray-500">ID: {wallet.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">
                    {wallet.balance.toString()}
                  </p>
                  <p className="text-sm text-gray-500">Balance</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
