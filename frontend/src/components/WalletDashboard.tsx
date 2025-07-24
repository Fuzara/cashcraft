"use client";

import { useEffect, useState } from "react";
import { AuthClient } from "@dfinity/auth-client";
import { Actor, HttpAgent, Identity } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import type { _SERVICE } from "@/declarations/wallets_backend_backend/wallets_backend_backend.did";
import { idlFactory } from "@/declarations/wallets_backend_backend";

// Canister ID from environment variables
const canisterId = process.env.NEXT_PUBLIC_WALLETS_CANISTER_ID;

// Define the SubWallet type to match the Motoko definition
type SubWallet = {
  save: bigint;
  spend: bigint;
  invest: bigint;
};

export default function WalletDashboard() {
  const [authClient, setAuthClient] = useState<AuthClient | null>(null);
  const [actor, setActor] = useState<_SERVICE | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [principal, setPrincipal] = useState<Principal | null>(null);
  const [balances, setBalances] = useState<SubWallet | null>(null);
  const [depositAmount, setDepositAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [financialTip, setFinancialTip] = useState("");

  // Initialize AuthClient
  useEffect(() => {
    AuthClient.create().then(async (client) => {
      setAuthClient(client);
      const isAuthed = await client.isAuthenticated();
      if (isAuthed) {
        handleAuthenticated(client);
      }
    });
  }, []);

  const handleAuthenticated = (client: AuthClient) => {
    const identity = client.getIdentity();
    const p = identity.getPrincipal();
    setIsAuthenticated(true);
    setPrincipal(p);
    createActor(identity);
  };

  const createActor = (identity: Identity) => {
    const agent = new HttpAgent({ identity, host: "https://icp-api.io" });

    // Fetch root key for local development
    if (process.env.NODE_ENV === "development") {
      agent.fetchRootKey().catch(err => {
        console.warn("Unable to fetch root key. Check to ensure that your local replica is running");
        console.error(err);
      });
    }

    if (!canisterId) {
      setError("NEXT_PUBLIC_WALLETS_CANISTER_ID is not set.");
      return;
    }
    const walletActor = Actor.createActor<_SERVICE>(idlFactory, {
      agent,
      canisterId,
    });
    setActor(walletActor);
  };

  const login = async () => {
    if (!authClient) return;
    await authClient.login({
      identityProvider: "https://identity.ic0.app",
      onSuccess: () => handleAuthenticated(authClient),
    });
  };

  const logout = async () => {
    if (!authClient) return;
    await authClient.logout();
    setIsAuthenticated(false);
    setPrincipal(null);
    setActor(null);
    setBalances(null);
  };

  const fetchBalances = async () => {
    if (!actor || !principal) return;
    setIsLoading(true);
    try {
      const walletData = await actor.get_sub_wallet(principal);
      if (walletData && walletData.length > 0) {
        if (walletData[0]) {
          setBalances(walletData[0]);
        }
      } else {
        setBalances({ save: 0n, spend: 0n, invest: 0n });
      }
    } catch (e) {
      setError("Failed to fetch balances.");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor || !depositAmount) return;
    setIsLoading(true);
    setError(null);
    try {
      const amount = BigInt(depositAmount);
      await actor.deposit(amount);
      setDepositAmount("");
      await fetchBalances(); // Refresh balances after deposit
    } catch (err) {
      setError("Deposit failed. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // --- AI Financial Tip Logic ---
  const getFinancialTip = (balances: SubWallet | null): string => {
    if (!balances) return "Start by making a deposit to get your first financial tip.";
    
    if (balances.save > balances.invest * 2n) {
      return "You’re saving well! Consider investing a bit more for long-term growth.";
    }
    if (balances.invest > balances.save) {
      return "Great focus on investing! Ensure you maintain an emergency savings buffer.";
    }
    return "You have a balanced approach. Keep it up!";
  };

  // Fetch balances on actor initialization
  useEffect(() => {
    if (actor && principal) {
      fetchBalances();
    }
  }, [actor, principal]);

  // Update financial tip when balances change
  useEffect(() => {
    setFinancialTip(getFinancialTip(balances));
  }, [balances]);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-gray-900 text-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-4 text-center">Wallet Dashboard</h1>
      
      {!isAuthenticated ? (
        <div className="text-center">
          <button
            onClick={login}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            Login with Internet Identity
          </button>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-6">
            <p className="text-sm truncate">
              Principal: <span className="font-mono">{principal?.toText()}</span>
            </p>
            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>

          {/* Balances Section */}
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-2">Your Balances</h2>
            {isLoading && !balances ? (
              <p>Loading balances...</p>
            ) : (
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-gray-800 p-4 rounded-lg">
                  <p className="text-lg font-medium">Save</p>
                  <p className="text-2xl font-bold">{balances?.save.toString() ?? "0"}</p>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg">
                  <p className="text-lg font-medium">Spend</p>
                  <p className="text-2xl font-bold">{balances?.spend.toString() ?? "0"}</p>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg">
                  <p className="text-lg font-medium">Invest</p>
                  <p className="text-2xl font-bold">{balances?.invest.toString() ?? "0"}</p>
                </div>
              </div>
            )}
          </div>

          {/* AI Financial Tip Section */}
          <div className="mb-6 p-4 bg-blue-900 bg-opacity-50 rounded-lg border border-blue-700 transition-all duration-300">
            <h3 className="text-xl font-bold mb-2">AI Financial Tip</h3>
            <p className="text-blue-200">{financialTip}</p>
          </div>

          {/* Deposit Section */}
          <div>
            <h2 className="text-2xl font-semibold mb-2">Make a Deposit</h2>
            <form onSubmit={handleDeposit} className="flex flex-col sm:flex-row gap-2">
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="Enter amount"
                className="flex-grow bg-gray-800 text-white p-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
              />
              <button
                type="submit"
                disabled={isLoading || !depositAmount}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
              >
                {isLoading ? "Depositing..." : "Deposit"}
              </button>
            </form>
          </div>
          
          {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
        </div>
      )}
    </div>
  );
}