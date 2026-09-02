"use client";

import { AnimatePresence, motion } from "framer-motion";
import { LogIn, X } from "lucide-react";
import Link from "next/link";

type AuthRequiredModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function AuthRequiredModal({
  open,
  onClose,
}: AuthRequiredModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-sm sm:px-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
            className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Content */}
            <div className="flex flex-col items-center px-6 pb-6 pt-10 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent-100 text-accent-600 dark:bg-accent-500/20 dark:text-accent-400">
                <LogIn className="h-8 w-8" />
              </div>

              <h3 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">
                ទាមទារការចូលគណនី
              </h3>
              <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">
                សូមចូលគណនីជាមុនសិន ដើម្បីអាចបន្ថែមមុខម្ហូបទៅក្នុងបញ្ជីចំណូលចិត្តរបស់អ្នក។ តើអ្នកចង់ចូលគណនីឥឡូវនេះទេ?
              </p>

              <div className="flex w-full flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 active:scale-95 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  មិនទាន់ពេលនេះទេ
                </button>
                <Link
                  href="/api/auth/login"
                  className="flex-1 rounded-xl bg-primary-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-900 active:scale-95 dark:bg-primary-700 dark:hover:bg-primary-600"
                >
                  ចូលគណនី
                </Link>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
