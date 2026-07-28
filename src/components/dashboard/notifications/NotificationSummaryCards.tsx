// components/dashboard/notifications/NotificationSummaryCards.tsx
"use client";

import { categoryStyles } from "@/lib/notifications/category-styles";
import type { NotificationSummaryCard } from "@/types/notifications";

interface Props {
  cards: NotificationSummaryCard[];
  activeCategory?: string;
  onSelect?: (category: NotificationSummaryCard["category"]) => void;
}

export default function NotificationSummaryCards({
  cards,
  activeCategory,
  onSelect,
}: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {cards.map((card) => {
        const style = categoryStyles[card.category];
        const Icon = style.icon;
        const isActive = activeCategory === card.category;

        return (
          <button
            key={card.category}
            type="button"
            onClick={() => onSelect?.(card.category)}
            className={`flex flex-col items-start gap-3 rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:shadow-md ${
              isActive
                ? "border-emerald-400 ring-1 ring-emerald-400"
                : "border-slate-100"
            }`}
          >
            <div className="flex w-full items-center justify-between">
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-xl ${style.iconBg}`}
              >
                <Icon
                  className={`h-4.5 w-4.5 ${style.iconColor}`}
                  strokeWidth={2}
                />
              </span>
              {card.count > 0 && (
                <span
                  className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold text-white ${style.dot}`}
                >
                  {card.count}
                </span>
              )}
            </div>
            <span className="text-sm font-medium text-slate-700">
              {card.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
