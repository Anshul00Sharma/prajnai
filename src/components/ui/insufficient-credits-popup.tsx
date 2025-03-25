"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaExclamationTriangle } from "react-icons/fa";

interface InsufficientCreditsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  requiredCredits: number;
  currentCredits: number | null;
  resourceType?: string; 
}

export function InsufficientCreditsPopup({
  isOpen,
  onClose,
  requiredCredits,
  currentCredits,
  resourceType = "note", 
}: InsufficientCreditsPopupProps) {
  useEffect(() => {
    if (isOpen) {
      // Auto-close after 5 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 300,
            }}
          >
            <div className="bg-red-600 p-6">
              <div className="flex justify-center">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                >
                  <FaExclamationTriangle className="text-white text-4xl" />
                </motion.div>
              </div>
            </div>
            
            <div className="p-6 text-center">
              <motion.h2
                className="text-2xl font-bold text-red-600 mb-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                Insufficient Credits
              </motion.h2>
              
              <motion.div
                className="space-y-3 text-gray-700"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.4 }}
              >
                <p>
                  You need at least <span className="font-bold">{requiredCredits} credits</span> to create a {resourceType}.
                </p>
                <p>
                  Your current balance: <span className="font-bold text-red-500">{currentCredits ?? 0} credits</span>
                </p>
                <div className="mt-4 text-sm text-gray-500">
                  Please add more credits to continue.
                </div>
              </motion.div>
              
              <motion.div
                className="mt-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.4 }}
              >
                <button
                  onClick={onClose}
                  className="w-full py-3 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-md"
                >
                  Close
                </button>
              </motion.div>
            </div>
            
            <motion.div
              className="h-1 bg-gray-200 w-full"
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 5, ease: "linear" }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
