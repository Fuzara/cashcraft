"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type ToastType = "success" | "error";

export type ToastMessage = {
  id: number;
  message: string;
  type: ToastType;
};

type ToastProps = {
  toast: ToastMessage | null;
  onClose: () => void;
};

const Toast = ({ toast, onClose }: ToastProps) => {
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000); // Auto-dismiss after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  const bgColor = toast?.type === "success" ? "bg-green-600" : "bg-red-600";

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.3 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
          className={`fixed bottom-5 right-5 p-4 rounded-lg text-white shadow-lg ${bgColor} z-50`}
        >
          <div className="flex items-center justify-between">
            <p>{toast.message}</p>
            <button onClick={onClose} className="ml-4 text-xl font-bold">
              &times;
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;

// Hook to manage toast state
export const useToast = () => {
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = (message: string, type: ToastType) => {
    setToast({ id: Date.now(), message, type });
  };

  const hideToast = () => {
    setToast(null);
  };

  return { toast, showToast, hideToast };
};