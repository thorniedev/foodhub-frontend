"use client";

import { motion, AnimatePresence } from "framer-motion";
import { IoLinkOutline, IoPeopleOutline, IoPersonOutline } from "react-icons/io5";

import type { RecommendationMode } from "@/types/location";

const OPTIONS: Array<{
  value: RecommendationMode;
  label: string;
  Icon: typeof IoPersonOutline;
}> = [
  { value: "me", label: "សម្រាប់ខ្ញុំ", Icon: IoPersonOutline },
  { value: "single", label: "សម្រាប់មិត្តភក្តិ", Icon: IoPeopleOutline },
  { value: "group", label: "សម្រាប់ភ្ញៀវ", Icon: IoLinkOutline },
];

interface RecommendationModeTabsProps {
  mode: RecommendationMode;
  onChange: (mode: RecommendationMode) => void;
}

export default function RecommendationModeTabs({
  mode,
  onChange,
}: RecommendationModeTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Recommendation mode"
      className="relative flex w-full sm:w-fit items-center rounded-full bg-gray-100 dark:bg-slate-800 p-1 ring-1 ring-black/5 dark:ring-white/10 shrink-0"
    >
      {OPTIONS.map(({ value, label, Icon }) => {
        const selected = mode === value;

        return (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(value)}
            className={`relative z-10 flex flex-1 sm:flex-initial items-center justify-center rounded-full px-4 py-2 text-[15px] font-semibold transition-colors duration-300 ${
              selected
                ? "text-white"
                : "text-gray-500 hover:text-gray-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            {selected && (
              <motion.span
                layoutId="location-mode-active-pill"
                className="absolute inset-0 z-[-1] rounded-full bg-primary-800 dark:bg-emerald-500 shadow-sm"
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 30,
                }}
              />
            )}

            <Icon className="shrink-0 text-[18px]" />
            <AnimatePresence initial={false} mode="wait">
              {selected && (
                <motion.div
                  key="label"
                  initial={{ width: 0, opacity: 0, marginLeft: 0 }}
                  animate={{ width: "auto", opacity: 1, marginLeft: 8 }}
                  exit={{ width: 0, opacity: 0, marginLeft: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="overflow-hidden whitespace-nowrap"
                >
                  <span className="mb-[1px] block">{label}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        );
      })}
    </div>
  );
}
