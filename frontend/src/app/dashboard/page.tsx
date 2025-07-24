"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Principal } from "@dfinity/principal";
import { useActor } from "../../hooks/useActor";
import WalletCard from "../../components/WalletCard";
import WalletModal from "../../components/WalletModal";
import { ActorSubclass } from "@dfinity/agent";
import { _SERVICE as WalletsService } from "../../declarations/wallets_backend_backend/service.did";
import {
  getMockData,
  saveMockData,
  formatCurrencyPair,
  resetMockData,
  getMainWalletTotal,
} from "../../utils/mockWallets";
import Toast, { useToast } from "../../components/Toast";
import DeleteWalletModal from "../../components/DeleteWalletModal";
import AnalyticsPanel from "../../components/AnalyticsPanel";

// --- Data Structures ---
export type SubWallet = {
  id: bigint;
  name: string;
  percentage: number;
  balance: bigint;
};

export type TransactionType = "income" | "expense";

export type Transaction = {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  type: TransactionType;
  walletName?: string;
};

export type Wallet = {
  id: bigint;
  owner: Principal;
  name: string;
  balance: bigint;
  subWallets: SubWallet[];
  transactions: Transaction[];
};

// --- Components ---

const MainWalletSummary = ({
  wallets,
  reserveBalance,
}: {
  wallets: Wallet[];
  reserveBalance: bigint;
}) => {
  const totalBalance = getMainWalletTotal(wallets);

  return (
    <div className="bg-gradient-to-r from-primary to-secondary text-white p-6 rounded-2xl shadow-lg mb-8">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-lg font-semibold text-indigo-200 mb-2">
            Total Balance
          </h2>
          <p className="text-4xl font-bold tracking-tight">
            {formatCurrencyPair(totalBalance)}
          </p>
          <p className="text-indigo-200 mt-2">{wallets.length} Wallets</p>
        </div>
        {reserveBalance > 0n && (
          <div className="text-right">
            <h2 className="text-lg font-semibold text-indigo-200 mb-2">
              Reserve
            </h2>
            <p className="text-2xl font-bold tracking-tight">
              {formatCurrencyPair(reserveBalance)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const HeaderSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-8 bg-gray-300 rounded w-1/4 mb-2"></div>
    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
  </div>
);
const WalletCardSkeleton = () => (
  <div className="bg-white p-6 rounded-xl shadow-md animate-pulse">
    <div className="h-6 bg-gray-300 rounded w-3/4 mb-4"></div>
    <div className="h-10 bg-gray-300 rounded w-1/2 mb-6"></div>
    <div className="h-4 bg-gray-300 rounded w-full"></div>
  </div>
);
const CreateWalletFormSkeleton = () => (
  <div className="bg-white p-6 rounded-xl shadow-md animate-pulse">
    <div className="h-8 bg-gray-300 rounded w-1/3 mb-4"></div>
    <div className="flex gap-4">
      <div className="h-12 bg-gray-300 rounded-lg w-full"></div>
      <div className="h-12 bg-gray-300 rounded-lg w-32"></div>
    </div>
  </div>
);

export default function Dashboard() {
  const {
    actor,
    login,
    logout,
    isAuthenticated,
    identity,
    isInitializing,
    isMock,
  } = useActor("wallets_backend");
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(false);
  const [reserveBalance, setReserveBalance] = useState(0n);
  const [error, setError] = useState<string | null>(null);
  const [walletName, setWalletName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  const [walletToDelete, setWalletToDelete] = useState<Wallet | null>(null);
  const { toast, showToast, hideToast } = useToast();

  const handleOpenModal = (wallet: Wallet) => setSelectedWallet(wallet);
  const handleCloseModal = () => setSelectedWallet(null);

  const handleOpenDeleteModal = (wallet: Wallet) => setWalletToDelete(wallet);
  const handleCloseDeleteModal = () => setWalletToDelete(null);

  const handleDeleteWallet = (
    transferTarget: "reserve" | { walletId: bigint } | null
  ) => {
    if (!walletToDelete) return;

    if (wallets.length <= 1) {
      showToast("Cannot delete the last wallet.", "error");
      return;
    }

    const data = getMockData();
    const walletIndex = data.wallets.findIndex(w => w.id === walletToDelete.id);
    if (walletIndex === -1) return;

    const deletedWallet = data.wallets[walletIndex];

    if (transferTarget === "reserve") {
      data.reserveBalance = (data.reserveBalance || 0n) + deletedWallet.balance;
    } else if (transferTarget) {
      const targetWallet = data.wallets.find(w => w.id === transferTarget.walletId);
      if (targetWallet) {
        targetWallet.balance += deletedWallet.balance;
      }
    }

    data.wallets.splice(walletIndex, 1);
    saveMockData(data);
    setWallets(data.wallets);
    showToast("Wallet deleted successfully!", "success");
    handleCloseDeleteModal();
  };

  const handleUpdateWallet = (updatedWallet: Wallet) => {
    setWallets((currentWallets) =>
      currentWallets.map((w) => (w.id === updatedWallet.id ? updatedWallet : w))
    );
    if (isMock) {
        const data = getMockData();
        const index = data.wallets.findIndex(w => w.id === updatedWallet.id);
        if (index > -1) {
            data.wallets[index] = updatedWallet;
            saveMockData(data);
        }
    }
  };

  const fetchWallets = useCallback(async () => {
    if (!actor || !isAuthenticated || isInitializing) {
      if (isMock) {
        const mockData = getMockData();
        setWallets(mockData.wallets);
        setReserveBalance(mockData.reserveBalance);
      }
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (!identity) return;
      const principal = identity.getPrincipal();
      const userWallets = await (
        actor as ActorSubclass<WalletsService>
      ).get_wallets(principal);

      const walletsWithSubWallets = userWallets.map((w) => ({
        ...w,
        owner: principal,
        subWallets: [],
        transactions: [],
      }));
      setWallets(walletsWithSubWallets);
    } catch (err) {
      console.error("Failed to fetch wallets:", err);
      setError("Could not fetch wallets. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [actor, isAuthenticated, isInitializing, identity, isMock]);

  useEffect(() => {
    if (!isInitializing) {
      fetchWallets();
    }
  }, [isInitializing, fetchWallets]);

  const createWallet = async () => {
    if (!actor || !walletName.trim()) return;
    setIsCreating(true);
    try {
      const newWalletData = await (
        actor as ActorSubclass<WalletsService>
      ).create_wallet(walletName.trim(), BigInt(0));
      const newWallet: Wallet = {
        ...newWalletData,
        owner: identity!.getPrincipal(),
        subWallets: [],
        transactions: [],
      };
      setWallets((prev) => [...prev, newWallet]);
      setWalletName("");
    } catch (err) {
      console.error("Failed to create wallet:", err);
      alert("Error: Could not create wallet. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  if (isInitializing) {
    return (
      <div className="container mx-auto p-8">
        <HeaderSkeleton />
        <div className="mt-8">
          <CreateWalletFormSkeleton />
        </div>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <WalletCardSkeleton />
          <WalletCardSkeleton />
          <WalletCardSkeleton />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-8 text-center">
        <h1 className="text-4xl font-bold mb-4 text-gray-800">
          Welcome to CashCraft
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Your secure, decentralized wallet solution.
        </p>
        <button
          onClick={login}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
        >
          Login with Internet Identity
        </button>
      </div>
    );
  }

  const renderContent = () => {
    if (loading)
      return (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <WalletCardSkeleton />
          <WalletCardSkeleton />
          <WalletCardSkeleton />
        </div>
      );
    if (error)
      return (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative text-center"
          role="alert"
        >
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline ml-2">{error}</span>
          <button
            onClick={fetchWallets}
            className="ml-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      );
    if (wallets.length === 0 && !isMock)
      return (
        <div className="text-center bg-white p-10 rounded-xl shadow-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            No Wallets Yet!
          </h2>
          <p className="text-gray-500 mb-6">
            Get started by creating your first wallet.
          </p>
        </div>
      );

    return (
      <>
        <h2 className="text-2xl font-bold mb-4">Your Wallets</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {wallets.map((wallet) => (
            <WalletCard
              key={Number(wallet.id)}
              wallet={wallet}
              onClick={() => handleOpenModal(wallet)}
              onDelete={() => handleOpenDeleteModal(wallet)}
              isActive={selectedWallet?.id === wallet.id}
            />
          ))}
        </div>
      </>
    );
  };

  return (
    <div className="container mx-auto p-8">
      <Toast toast={toast} onClose={hideToast} />
      <div className="flex justify-between items-center mb-8">
          <div>
              <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
              <p className="text-gray-500">Welcome back to your CashCraft dashboard.</p>
          </div>
          {isMock && (
              <button
                  onClick={() => {
                      resetMockData();
                      showToast("Demo reset successful", "success");
                      setTimeout(() => window.location.reload(), 1500);
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-all"
              >
                  🔄 Reset Demo Data
              </button>
          )}
      </div>

      {isMock && (
        <div
          className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-8 rounded-r-lg"
          role="alert"
        >
          <p className="font-bold">Mock Mode Active</p>
          <p>
            You are interacting with mock data. No real backend calls are
            being made.
          </p>
        </div>
      )}

      <MainWalletSummary wallets={wallets} reserveBalance={reserveBalance} />

      <div className="mb-8 bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold mb-4">Create a new wallet</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={walletName}
            onChange={(e) => setWalletName(e.target.value)}
            placeholder="My New Wallet"
            className="p-3 border rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
            disabled={isCreating}
          />
          <button
            onClick={createWallet}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300"
            disabled={isCreating || loading}
          >
            {isCreating ? "Creating..." : "Create Wallet"}
          </button>
        </div>
      </div>

      {renderContent()}

      <AnalyticsPanel wallets={wallets} transactions={wallets.flatMap(w => w.transactions)} />
      <WalletModal
        wallet={selectedWallet}
        isOpen={!!selectedWallet}
        onClose={handleCloseModal}
        onUpdate={handleUpdateWallet}
        showToast={showToast}
      />
      <DeleteWalletModal
        isOpen={!!walletToDelete}
        onClose={handleCloseDeleteModal}
        onConfirmDelete={handleDeleteWallet}
        wallets={wallets}
        walletToDelete={walletToDelete}
      />
    </div>
  );
}
