"use client";

import { cn } from "@/lib/utils";

export interface FilterTab {
  id: string;
  label: string;
  count: number;
}

interface ReviewFilterTabsProps {
  tabs: FilterTab[];
  activeTab: string;
  onChange: (id: string) => void;
}

export default function ReviewFilterTabs({ tabs, activeTab, onChange }: ReviewFilterTabsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => {
        const active = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-emerald-600 text-white"
                : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
            )}
          >
            {tab.label}
            <span
              className={cn(
                "flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-base font-semibold",
                active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
              )}
            >
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}