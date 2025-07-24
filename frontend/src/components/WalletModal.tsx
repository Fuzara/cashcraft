"use client";

import { useState, useEffect, useMemo } from "react";
import { Wallet, SubWallet } from "../app/dashboard/page";
import { deepClone, formatCurrencyPair, calculateSubWalletAmounts, updateWalletName } from "../utils/mockWallets";
import { useToast, ToastMessage } from "./Toast";

// --- Types ---
type WalletModalProps = {
  wallet: Wallet | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedWallet: Wallet) => void;
  showToast: (message: string, type: "success" | "error") => void;
};

// --- Helper Components ---
const PercentageBar = ({ percentage }: { percentage: number }) => (
  <div className="w-full bg-gray-200 rounded-full h-2.5">
    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
  </div>
);

const ValidationMessage = ({ totalPercentage }: { totalPercentage: number }) => {
  if (totalPercentage === 100) {
    return <p className="text-sm text-green-600">✅ Allocations total 100%.</p>;
  }
  return (
    <p className="text-sm text-red-600 font-semibold">
      Allocations must total 100% (Current: {totalPercentage}%)
    </p>
  );
};

export default function WalletModal({ wallet, isOpen, onClose, onUpdate, showToast }: WalletModalProps) {
  const [editedWallet, setEditedWallet] = useState<Wallet | null>(null);
  const [lastValidWallet, setLastValidWallet] = useState<Wallet | null>(null);

  useEffect(() => {
    // When the modal opens, clone the wallet data into local state for editing
    if (wallet) {
      const clonedWallet = deepClone(wallet);
      setEditedWallet(clonedWallet);
      setLastValidWallet(clonedWallet);
    }
  }, [wallet]);

  const handleSubWalletChange = (subWalletId: bigint, field: 'name' | 'percentage', value: string | number) => {
    if (!editedWallet) return;

    const updatedSubWallets = editedWallet.subWallets.map(sw => {
      if (sw.id === subWalletId) {
        const newValue = field === 'percentage' ? Number(value) : value;
        return { ...sw, [field]: newValue };
      }
      return sw;
    });

    // Recalculate balances
    const walletWithNewPercentages = { ...editedWallet, subWallets: updatedSubWallets };
    const finalWallet = calculateSubWalletAmounts(walletWithNewPercentages);
    setEditedWallet(finalWallet);
  };

  const handleAddSubWallet = () => {
    if (!editedWallet) return;
    const newSubWallet: SubWallet = {
      id: BigInt(Date.now()), // Temporary unique ID
      name: "New Sub-Wallet",
      percentage: 0,
      balance: 0n,
    };
    setEditedWallet({
      ...editedWallet,
      subWallets: [...editedWallet.subWallets, newSubWallet],
    });
  };
  
  const handleRemoveSubWallet = (subWalletId: bigint) => {
    if (!editedWallet) return;
    setEditedWallet({
        ...editedWallet,
        subWallets: editedWallet.subWallets.filter(sw => sw.id !== subWalletId)
    });
  };

  const totalPercentage = useMemo(() => {
    if (!editedWallet) return 0;
    return editedWallet.subWallets.reduce((sum, sw) => sum + sw.percentage, 0);
  }, [editedWallet]);

  const handleSaveChanges = () => {
    if (editedWallet && totalPercentage === 100) {
      updateWalletName(editedWallet.id, editedWallet.name);
      onUpdate(editedWallet);
      showToast("Wallet updated successfully!", "success");
      onClose();
    } else {
      showToast("Validation failed. Please ensure percentages total 100%.", "error");
    }
  };

  const handleCancel = () => {
    // Revert changes by restoring the last valid state
    if(lastValidWallet) {
      setEditedWallet(deepClone(lastValidWallet));
    }
    onClose();
  };

  if (!isOpen || !editedWallet) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <header className="p-6 border-b border-gray-200">
          <input
            type="text"
            value={editedWallet.name}
            onChange={(e) => {
              if (!editedWallet) return;
              setEditedWallet({ ...editedWallet, name: e.target.value });
            }}
            className="text-2xl font-bold text-gray-800 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg p-1 -m-1 w-full"
          />
          <p className="text-gray-500 mt-1">Manage your sub-wallet allocation.</p>
        </header>

        <main className="p-6 overflow-y-auto space-y-6">
          {editedWallet.subWallets.map((sw, index) => (
            <div key={index} className="grid grid-cols-12 gap-4 items-center">
              <input
                type="text"
                value={sw.name}
                onChange={(e) => handleSubWalletChange(sw.id, 'name', e.target.value)}
                className="col-span-4 p-2 border rounded-lg"
              />
              <div className="col-span-5 flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sw.percentage}
                  onChange={(e) => handleSubWalletChange(sw.id, 'percentage', e.target.value)}
                  className="w-full"
                />
                <input
                  type="number"
                  value={sw.percentage}
                  onChange={(e) => handleSubWalletChange(sw.id, 'percentage', e.target.value)}
                  className="w-20 p-2 border rounded-lg"
                />
              </div>
              <p className="col-span-2 text-right font-mono text-sm">
                {formatCurrencyPair(sw.balance)}
              </p>
              <button onClick={() => handleRemoveSubWallet(sw.id)} className="col-span-1 text-red-500 hover:text-red-700 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <div className="col-span-12">
                <PercentageBar percentage={sw.percentage} />
              </div>
            </div>
          ))}
           <button onClick={handleAddSubWallet} className="text-blue-600 hover:underline">
            + Add Sub-Wallet
          </button>
        </main>

        <footer className="p-6 border-t border-gray-200 mt-auto bg-gray-50 rounded-b-2xl">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Total Allocation</h3>
                <ValidationMessage totalPercentage={totalPercentage} />
            </div>
            <div className="flex justify-end gap-4">
                <button onClick={handleCancel} className="px-6 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300">Cancel</button>
                <button
                    onClick={handleSaveChanges}
                    className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    disabled={totalPercentage !== 100}
                >
                    Save Changes
                </button>
            </div>
        </footer>
      </div>
    </div>
  );
}