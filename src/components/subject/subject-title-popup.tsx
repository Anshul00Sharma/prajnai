"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface SubjectTitlePopupProps {
  onSave: (title: string) => void;
  onClose: () => void;
  isUpdating?: boolean;
}

export function SubjectTitlePopup({ onSave, onClose, isUpdating = false }: SubjectTitlePopupProps) {
  const [title, setTitle] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onSave(title.trim());
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", duration: 0.3 }}
          className="bg-theme-light/90 backdrop-blur-sm rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl"
        >
          <h2 className="text-2xl font-bold text-theme-primary mb-4">
            Enter Subject Title
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter title..."
                className="w-full px-4 py-2 rounded-lg border border-theme-primary/20 focus:border-theme-primary focus:outline-none focus:ring-2 focus:ring-theme-primary/20 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                autoFocus
                disabled={isUpdating}
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-theme-primary hover:bg-theme-primary/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isUpdating}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-theme-primary text-theme-light hover:bg-theme-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                disabled={!title.trim() || isUpdating}
              >
                {isUpdating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-theme-light border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  'Save'
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
