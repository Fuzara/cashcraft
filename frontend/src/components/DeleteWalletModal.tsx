"use client";

import { useState, useEffect } from "react";
import { Wallet } from "../app/dashboard/page";
import { motion, AnimatePresence } from "framer-motion";

type DeleteWalletModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: (
    transferTarget: "reserve" | { walletId: bigint } | null
  ) => void;
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
  const [transferTarget, setTransferTarget] = useState<
    "reserve" | string | null
  >(null);

  const availableWallets = wallets.filter(
    (w) => w.id !== walletToDelete?.id
  );

  useEffect(() => {
    if (availableWallets.length > 0) {
      setTransferTarget(availableWallets[0].id.toString());
    } else {
      setTransferTarget("reserve");
    }
  }, [isOpen, walletToDelete]);

  const handleConfirm = () => {
    if (wallets.length <= 1) {
      alert("You cannot delete your last wallet.");
      return;
    }

    if (transferTarget === "reserve") {
      onConfirmDelete("reserve");
    } else if (transferTarget) {
      onConfirmDelete({ walletId: BigInt(transferTarget) });
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Delete Wallet
            </h2>
            <p className="text-gray-600 mb-6">
              You are about to delete the wallet "
              <strong>{walletToDelete?.name}</strong>".
            </p>

            {wallets.length > 1 ? (
              <>
                <p className="font-semibold mb-2">
                  Where should the funds go?
                </p>
                <select
                  value={transferTarget ?? ""}
                  onChange={(e) => setTransferTarget(e.target.value)}
                  className="w-full p-3 border rounded-lg mb-6"
                >
                  <option value="reserve">Move to Reserve</option>
                  {availableWallets.map((wallet) => (
                    <option key={wallet.id.toString()} value={wallet.id.toString()}>
                      {wallet.name}
                    </option>
                  ))}
                </select>
                <div className="flex justify-end gap-4">
                  <button
                    onClick={onClose}
                    className="px-6 py-2 rounded-lg text-gray-700 bg-gray-200 hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirm}
                    className="px-6 py-2 rounded-lg text-white bg-error hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center">
                <p className="text-error font-semibold mb-4">
                  This is your last wallet and it cannot be deleted.
                </p>
                <button
                  onClick={onClose}
                  className="px-6 py-2 rounded-lg text-white bg-primary hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}