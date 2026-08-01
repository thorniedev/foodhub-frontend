"use client";

import { IoFilterOutline, IoListOutline, IoMapOutline } from "react-icons/io5";

import type { LocationViewMode } from "@/types/location";

interface MobileLocationToolbarProps {
  view: LocationViewMode;
  onViewChange: (view: LocationViewMode) => void;
  onOpenFilters: () => void;
}

export default function MobileLocationToolbar({
  view,
  onViewChange,
  onOpenFilters,
}: MobileLocationToolbarProps) {
  return (
    <div className="mb-5 flex items-center gap-3 2xl:hidden">
      <div className="grid min-w-0 flex-1 grid-cols-2 rounded-full bg-gray-100 p-1">
        <button
          type="button"
          onClick={() => onViewChange("list")}
          className={`flex min-h-11 items-center justify-center gap-2 rounded-full px-3 text-[16px] font-semibold transition ${
            view === "list"
              ? "bg-primary-800 text-white shadow-sm"
              : "text-gray-600"
          }`}
        >
          <IoListOutline className="text-[20px]" />
          បញ្ជី
        </button>

        <button
          type="button"
          onClick={() => onViewChange("map")}
          className={`flex min-h-11 items-center justify-center gap-2 rounded-full px-3 text-[16px] font-semibold transition ${
            view === "map"
              ? "bg-primary-800 text-white shadow-sm"
              : "text-gray-600"
          }`}
        >
          <IoMapOutline className="text-[20px]" />
          ផែនទី
        </button>
      </div>

      <button
        type="button"
        onClick={onOpenFilters}
        aria-label="Open location filters"
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-primary-800 shadow-sm transition hover:border-primary-300"
      >
        <IoFilterOutline className="text-[22px]" />
      </button>
    </div>
  );
}
