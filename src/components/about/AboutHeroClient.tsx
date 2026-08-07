"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

import FoodHubHero01 from "@/components/about/FoodHubHero01";

export default function AboutHeroClient() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <FoodHubHero01 />

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 px-4 backdrop-blur-md"
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="FoodHub AI Assistant"
              initial={{
                opacity: 0,
                scale: 0.9,
                y: 30,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.94,
                y: 20,
              }}
              transition={{
                type: "spring",
                stiffness: 280,
                damping: 26,
              }}
              onClick={(event) => event.stopPropagation()}
              className="relative max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-[32px] border border-white/40 bg-white shadow-2xl dark:border-white/10 dark:bg-slate-950"
            >
              <button
                type="button"
                aria-label="Close AI assistant"
                onClick={() => setIsOpen(false)}
                className="absolute right-4 top-4 z-20 flex size-11 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-slate-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
              >
                <X className="size-5" />
              </button>

              <div className="p-6 sm:p-8">
                <p className="text-2xl font-semibold text-primary-800 dark:text-[#22a447]">
                  FoodHub AI Assistant
                </p>

                <p className="mt-3 text-[16px] leading-7 text-slate-600 dark:text-slate-300">
                  សួរសំណួរ ឬឱ្យ AI ជួយស្វែងរកមុខម្ហូបដែលសមនឹងចំណូលចិត្ត របបអាហារ
                  អាឡែស៊ី និងទីតាំងរបស់អ្នក។
                </p>

                {/* Put your AI assistant, SwipeCard or SpinFood component here */}
                <div className="mt-6 flex min-h-[400px] items-center justify-center rounded-3xl bg-slate-50 text-[16px] text-slate-500 dark:bg-white/5 dark:text-slate-300">
                  AI assistant content
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
