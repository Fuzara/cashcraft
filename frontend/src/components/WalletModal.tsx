"use client";

import { useState, useEffect, useMemo } from "react";
import { Wallet, SubWallet, Transaction, TransactionType } from "../app/dashboard/page";
import {
  deepClone,
  formatCurrencyPair,
  calculateSubWalletAmounts,
  addTransaction,
  getMockData,
  saveMockData
} from "../utils/mockWallets";
import { useToast } from "./Toast";
import TransactionList from "./TransactionList";

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

// --- Main Component ---
type WalletModalProps = {
  wallet: Wallet | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedWallet: Wallet) => void;
  showToast: (message: string, type: "success" | "error") => void;
};

export default function WalletModal({ wallet, isOpen, onClose, onUpdate, showToast }: WalletModalProps) {
  const [editedWallet, setEditedWallet] = useState<Wallet | null>(null);
  const [lastValidWallet, setLastValidWallet] = useState<Wallet | null>(null);
  const [activeTab, setActiveTab] = useState<"allocation" | "transactions">("allocation");
  const [newTransaction, setNewTransaction] = useState({ description: "", amount: 0, category: "Other", type: "expense" as TransactionType });

  useEffect(() => {
    if (wallet) {
      const clonedWallet = deepClone(wallet);
      setEditedWallet(clonedWallet);
      setLastValidWallet(clonedWallet);
      setActiveTab("allocation"); // Reset to default tab when wallet changes
      // Reset the transaction form and set the default category
      setNewTransaction({
        description: "",
        amount: 0,
        category: clonedWallet.subWallets.length > 0 ? clonedWallet.subWallets[0].name : "Other",
        type: "expense",
      });
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

    const walletWithNewPercentages = { ...editedWallet, subWallets: updatedSubWallets };
    const finalWallet = calculateSubWalletAmounts(walletWithNewPercentages);
    setEditedWallet(finalWallet);
  };

  const handleAddSubWallet = () => {
    if (!editedWallet) return;
    const newSubWallet: SubWallet = {
      id: BigInt(Date.now()),
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

  const handleSaveTransaction = () => {
    if (!editedWallet || !newTransaction.description || newTransaction.amount <= 0) {
      showToast("Invalid transaction data.", "error");
      return;
    }

    const transaction: Omit<Transaction, 'id' | 'date' | 'walletName'> = {
      ...newTransaction,
    };

    addTransaction(editedWallet.id, transaction);
    
    const updatedData = getMockData();
    const updatedWallet = updatedData.wallets.find(w => w.id === editedWallet.id);
    
    if(updatedWallet) {
        setEditedWallet(updatedWallet);
        onUpdate(updatedWallet);
    }

    showToast("Transaction added successfully!", "success");
    setNewTransaction({
      description: "",
      amount: 0,
      category: editedWallet.subWallets.length > 0 ? editedWallet.subWallets[0].name : "Other",
      type: "expense",
    });
  };

  const handleSaveChanges = () => {
    if (editedWallet && totalPercentage === 100) {
      const data = getMockData();
      const index = data.wallets.findIndex(w => w.id === editedWallet.id);
      if (index > -1) {
          data.wallets[index] = editedWallet;
          saveMockData(data);
      }
      onUpdate(editedWallet);
      showToast("Wallet updated successfully!", "success");
      onClose();
    } else {
      showToast("Validation failed. Please ensure percentages total 100%.", "error");
    }
  };

  const handleCancel = () => {
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
          <p className="text-gray-500 mt-1">Manage your wallet allocations and transactions.</p>
        </header>

        <div className="border-b border-gray-200">
          <nav className="-mb-px flex gap-6 px-6">
            <button onClick={() => setActiveTab("allocation")} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'allocation' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Allocation</button>
            <button onClick={() => setActiveTab("transactions")} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'transactions' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Transactions</button>
          </nav>
        </div>

        <main className="p-6 overflow-y-auto space-y-6">
          {activeTab === "allocation" && (
            <>
              {editedWallet.subWallets.map((sw, index) => {
                const spentAmount = editedWallet.transactions
                  .filter(t => t.category === sw.name && t.type === 'expense')
                  .reduce((acc, t) => acc + t.amount, 0);
                const budgetAmount = (Number(editedWallet.balance) / 1_00000000) * (sw.percentage / 100);
                const progress = budgetAmount > 0 ? (spentAmount / budgetAmount) * 100 : 0;

                return (
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
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                      </div>
                      <ul className="mt-2">
                        {editedWallet.transactions.filter(t => t.category === sw.name).map(t => (
                            <li key={t.id} className="text-xs text-gray-500 flex justify-between">
                                <span>{t.description}</span>
                                <span className={t.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                                  {t.type === 'income' ? '+' : '-'}
                                  {formatCurrencyPair(BigInt(t.amount * 100))}
                                </span>
                            </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )
              })}
              <button onClick={handleAddSubWallet} className="text-blue-600 hover:underline">
                + Add Sub-Wallet
              </button>
            </>
          )}
          {activeTab === "transactions" && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Add Transaction</h3>
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="Description" className="p-2 border rounded col-span-2" value={newTransaction.description} onChange={e => setNewTransaction({...newTransaction, description: e.target.value})} />
                <input type="number" placeholder="Amount" className="p-2 border rounded" value={newTransaction.amount === 0 ? '' : newTransaction.amount} onChange={e => setNewTransaction({...newTransaction, amount: Number(e.target.value)})} />
                <select className="p-2 border rounded" value={newTransaction.type} onChange={e => setNewTransaction({...newTransaction, type: e.target.value as TransactionType})}>
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
                <select className="p-2 border rounded col-span-2" value={newTransaction.category} onChange={e => setNewTransaction({...newTransaction, category: e.target.value})}>
                  {editedWallet.subWallets.map(sw => (
                    <option key={sw.id.toString()} value={sw.name}>{sw.name}</option>
                  ))}
                  <option value="Other">Other</option>
                </select>
              </div>
              <button onClick={handleSaveTransaction} className="mt-4 w-full px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700">Add Transaction</button>
              <h3 className="text-lg font-semibold mt-8 mb-4">Transaction History</h3>
              <TransactionList transactions={editedWallet.transactions} />
            </div>
          )}
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