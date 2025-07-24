"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Wallet } from "../app/dashboard/page";

type DeleteWalletModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: (targetWalletId: bigint | "reserve") => void;
  wallets: Wallet[];
  walletToDelete: Wallet | null;
};

export default function DeleteWalletModal({
  isOpen,
  onClose,
  onConfirmDelete,
  wallets,
  walletToDelete,
}: DeleteWalletModalProps) {
  if (!isOpen || !walletToDelete) return null;

  const availableWallets = wallets.filter((w) => w.id !== walletToDelete.id);

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
            <h2 className="text-xl font-bold text-gray-800">Delete Wallet</h2>
            <p className="text-sm text-gray-500">
              You are about to delete "{walletToDelete.name}".
            </p>
          </header>
          <main className="p-6 space-y-4">
            <p>Where should the funds go?</p>
            <button
              onClick={() => onConfirmDelete("reserve")}
              className="w-full px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Move to Reserve Balance
            </button>
            {availableWallets.length > 0 && (
              <>
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-2 text-sm text-gray-500">OR</span>
                  </div>
                </div>
                <select
                  onChange={(e) => onConfirmDelete(BigInt(e.target.value))}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="">Transfer to another wallet...</option>
                  {availableWallets.map((w) => (
                    <option key={w.id.toString()} value={w.id.toString()}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </>
            )}
          </main>
          <footer className="p-6 bg-gray-50 rounded-b-2xl">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </footer>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}