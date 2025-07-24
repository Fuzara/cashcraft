"use client";

import { useState, useMemo } from "react";
import { getMockData, addTransaction, formatCurrencyPair } from "../../utils/mockWallets";
import { Wallet, Transaction } from "../dashboard/page";
import TransactionModal from "../../components/TransactionModal";
import { useToast } from "../../components/Toast";

export default function TransactionsPage() {
  const [data, setData] = useState(getMockData());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { showToast } = useToast();

  const handleSaveTransaction = (transaction: Omit<Transaction, 'id' | 'date'>, walletId: bigint) => {
    addTransaction(walletId, transaction);
    setData(getMockData()); // Refresh data
    showToast("Transaction added successfully!", "success");
  };

  const transactionsByDate = useMemo(() => {
    return data.transactions.reduce((acc, t) => {
      const date = new Date(t.date).toDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(t);
      return acc;
    }, {} as Record<string, Transaction[]>);
  }, [data.transactions]);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">All Transactions</h1>
      
      {Object.entries(transactionsByDate).map(([date, transactions]) => (
        <div key={date} className="mb-8">
          <h2 className="text-lg font-semibold text-gray-600 mb-4">{date}</h2>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <ul>
              {transactions.map((t) => (
                <li key={t.id} className="border-b py-4 flex justify-between">
                  <div>
                    <p className="font-bold">{t.description}</p>
                    <p className="text-sm text-gray-500">{t.category}</p>
                  </div>
                  <p className={`font-mono ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {t.type === 'income' ? '+' : '-'}
                    {formatCurrencyPair(BigInt(t.amount * 100))}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}

      <button 
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-24 right-8 bg-gradient-to-r from-primary to-secondary text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center text-3xl"
      >
        +
      </button>

      <TransactionModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTransaction}
        wallets={data.wallets}
      />
    </div>
  );
}