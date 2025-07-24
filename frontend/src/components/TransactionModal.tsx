"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Transaction, TransactionType, Wallet } from "../app/dashboard/page";

type TransactionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Omit<Transaction, 'id' | 'date'>, walletId: bigint) => void;
  wallets: Wallet[];
  transactionToEdit?: Transaction | null;
};

export default function TransactionModal({ isOpen, onClose, onSave, wallets, transactionToEdit }: TransactionModalProps) {
  const [amount, setAmount] = useState(0);
  const [type, setType] = useState<TransactionType>("expense");
  const [category, setCategory] = useState("Other");
  const [description, setDescription] = useState("");
  const [walletId, setWalletId] = useState<bigint | undefined>(wallets[0]?.id);

  useEffect(() => {
    if (transactionToEdit) {
      setAmount(transactionToEdit.amount);
      setType(transactionToEdit.type);
      setCategory(transactionToEdit.category);
      setDescription(transactionToEdit.description);
      // Note: walletId cannot be edited for an existing transaction
    } else {
      // Reset form for new transaction
      setAmount(0);
      setType("expense");
      setCategory("Other");
      setDescription("");
      setWalletId(wallets[0]?.id);
    }
  }, [transactionToEdit, isOpen, wallets]);

  const handleSave = () => {
    if (!description || amount <= 0 || !walletId) {
      // Add validation feedback if needed
      return;
    }
    onSave({ amount, type, category, description }, walletId);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
        >
          <header className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">
              {transactionToEdit ? "Edit Transaction" : "Add Transaction"}
            </h2>
          </header>
          <main className="p-6 space-y-4">
            <input type="text" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} className="p-2 border rounded w-full" />
            <input type="number" placeholder="Amount" value={amount === 0 ? '' : amount} onChange={e => setAmount(Number(e.target.value))} className="p-2 border rounded w-full" />
            <select value={type} onChange={e => setType(e.target.value as TransactionType)} className="p-2 border rounded w-full">
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
            <select value={category} onChange={e => setCategory(e.target.value)} className="p-2 border rounded w-full">
              <option>Food</option>
              <option>Bills</option>
              <option>Transport</option>
              <option>Shopping</option>
              <option>Other</option>
            </select>
            <select value={walletId?.toString()} onChange={e => setWalletId(BigInt(e.target.value))} className="p-2 border rounded w-full" disabled={!!transactionToEdit}>
              {wallets.map(w => (
                <option key={w.id.toString()} value={w.id.toString()}>{w.name}</option>
              ))}
            </select>
          </main>
          <footer className="p-6 flex justify-end gap-4 bg-gray-50 rounded-b-2xl">
            <button onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300">Cancel</button>
            <button onClick={handleSave} className="px-4 py-2 text-white bg-primary rounded-lg hover:bg-secondary">Save</button>
          </footer>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}