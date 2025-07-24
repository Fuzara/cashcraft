"use client";

import { Transaction } from "../app/dashboard/page";
import { formatCurrencyPair } from "../utils/mockWallets";

export default function TransactionList({
  transactions,
}: {
  transactions: Transaction[];
}) {
  if (transactions.length === 0) {
    return <p className="text-gray-500">No transactions yet.</p>;
  }

  return (
    <div className="space-y-4">
      {transactions.map((tx) => (
        <div
          key={tx.id}
          className="flex justify-between items-center bg-gray-50 p-3 rounded-lg"
        >
          <div>
            <p className="font-semibold">{tx.description}</p>
            <p className="text-sm text-gray-500">{tx.category}</p>
          </div>
          <div
            className={`font-semibold ${
              tx.type === "income" ? "text-success" : "text-error"
            }`}
          >
            {tx.type === "income" ? "+" : "-"}
            {formatCurrencyPair(BigInt(tx.amount * 100000000))}
          </div>
        </div>
      ))}
    </div>
  );
}