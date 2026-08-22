"use client";

import { IoPeopleOutline, IoPersonOutline } from "react-icons/io5";

import type { RecommendationMode } from "@/types/location";

interface RecommendationModeTabsProps {
  mode: RecommendationMode;
  onChange: (mode: RecommendationMode) => void;
}

export default function RecommendationModeTabs({
  mode,
  onChange,
}: RecommendationModeTabsProps) {
  return (
    <div className="grid w-full grid-cols-2 rounded-full bg-gray-100 p-1 sm:w-auto">
      <button
        type="button"
        onClick={() => onChange("single")}
        className={`flex min-h-11 items-center justify-center gap-2 rounded-full px-4 text-[16px] font-semibold transition ${
          mode === "single"
            ? "bg-primary-800 text-white shadow-sm"
            : "text-gray-600 hover:text-primary-800 dark:text-primary-dark"
        }`}
      >
        <IoPersonOutline className="text-[20px]" />
        Friend
      </button>

      <button
        type="button"
        onClick={() => onChange("group")}
        className={`flex min-h-11 items-center justify-center gap-2 rounded-full px-4 text-[16px] font-semibold transition ${
          mode === "group"
            ? "bg-primary-800 text-white shadow-sm"
            : "text-gray-600 hover:text-primary-800 dark:text-primary-dark"
        }`}
      >
        <IoPeopleOutline className="text-[20px]" />
        Guest Link
      </button>
    </div>
  );
}
