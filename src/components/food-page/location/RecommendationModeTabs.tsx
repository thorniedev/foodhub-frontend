"use client";

import { motion } from "framer-motion";
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
      className="relative flex w-full sm:w-auto items-center rounded-full bg-gray-100/90 dark:bg-slate-800/90 p-1 shadow-inner"
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
            className={`relative z-10 flex min-h-12 flex-1 sm:flex-initial items-center justify-center gap-2 whitespace-nowrap rounded-full px-4 py-2.5 text-lg font-bold transition-colors duration-200 ${
              selected
                ? "text-white"
                : "text-gray-600 hover:text-primary-900 dark:text-slate-300 dark:hover:text-white"
            }`}
          >
            {selected && (
              <motion.span
                layoutId="location-mode-active-pill"
                className="absolute inset-0 z-[-1] rounded-full bg-primary-800 dark:bg-emerald-600 shadow-md"
                transition={{
                  type: "spring",
                  stiffness: 420,
                  damping: 32,
                }}
              />
            )}

            <Icon className="shrink-0 text-[22px]" />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
