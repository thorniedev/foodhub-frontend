// components/dashboard/notifications/NotificationSummaryCards.tsx
"use client";

import { categoryStyles } from "@/lib/notifications/category-styles";
import type { NotificationSummaryCard } from "@/types/notifications";

interface Props {
  cards: NotificationSummaryCard[];
  activeCategory?: string;
  onSelect?: (key: NotificationSummaryCard["key"]) => void;
}

export default function NotificationSummaryCards({
  cards,
  activeCategory,
  onSelect,
}: Props) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {cards.map((card) => {
        const style = categoryStyles[card.category];
        const Icon = style.icon;
        const isActive = activeCategory === card.key;

        return (
          <button
            key={card.key}
            type="button"
            onClick={() => onSelect?.(card.key)}
            className={`flex min-h-28 flex-col items-start gap-3 rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900 ${
              isActive
                ? "border-emerald-400 ring-1 ring-emerald-400 dark:border-emerald-500 dark:ring-emerald-500"
                : "border-slate-100 dark:border-slate-800"
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
                  className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-base font-semibold text-white ${style.dot}`}
                >
                  {card.count}
                </span>
              )}
            </div>
            <span className="text-sm font-medium leading-5 text-slate-700 break-words dark:text-slate-200">
              {card.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
