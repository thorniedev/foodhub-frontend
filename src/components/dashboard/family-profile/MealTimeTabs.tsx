"use client";

import { cn } from "@/lib/utils";
import type { MealTime } from "@/types/family-profile";

interface MealTimeTabsProps {
  active: MealTime;
  onChange: (value: MealTime) => void;
}

const options: { id: MealTime; label: string }[] = [
  { id: "breakfast", label: "អាហារពេលព្រឹក" },
  { id: "lunch", label: "អាហារពេលថ្ងៃត្រង់" },
  { id: "dinner", label: "អាហារពេលល្ងាច" },
];

export default function MealTimeTabs({ active, onChange }: MealTimeTabsProps) {
  return (
    <div className="inline-flex rounded-full border border-slate-200 bg-white p-1">
      {options.map((opt) => {
        const isActive = opt.id === active;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            aria-pressed={isActive}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500",
              isActive
                ? "bg-emerald-100 text-emerald-700"
                : "text-slate-500 hover:text-slate-700",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}