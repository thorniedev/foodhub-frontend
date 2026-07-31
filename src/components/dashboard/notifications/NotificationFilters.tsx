// components/dashboard/notifications/NotificationFilters.tsx
"use client";

import type { NotificationFilterTab } from "@/types/notifications";

interface Props {
  tabs: NotificationFilterTab[];
  activeTab: NotificationFilterTab["key"];
  onChangeTab: (key: NotificationFilterTab["key"]) => void;
  unreadOnly: boolean;
  onToggleUnreadOnly: () => void;
}

export default function NotificationFilters({
  tabs,
  activeTab,
  onChangeTab,
  unreadOnly,
  onToggleUnreadOnly,
}: Props) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white p-2 shadow-sm">
      <div className="flex flex-wrap items-center gap-1">
        {tabs.map((tab) => {
          const isActive = tab.key === activeTab;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onChangeTab(tab.key)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                isActive
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              }`}
            >
              {tab.dotColor && (
                <span className={`h-1.5 w-1.5 rounded-full ${tab.dotColor}`} />
              )}
              {tab.label}
              {typeof tab.count === "number" && (
                <span className="text-base text-slate-400">{tab.count}</span>
              )}
            </button>
          );
        })}
      </div>

      <label className="flex cursor-pointer items-center gap-2 px-2 text-sm text-slate-500">
        <span>មិនទាន់អានប៉ុណ្ណោះ</span>
        <span className="relative inline-flex h-5 w-9 items-center">
          <input
            type="checkbox"
            checked={unreadOnly}
            onChange={onToggleUnreadOnly}
            className="peer sr-only"
          />
          <span className="absolute inset-0 rounded-full bg-slate-200 transition peer-checked:bg-emerald-500" />
          <span className="absolute left-0.5 h-4 w-4 rounded-full bg-white shadow transition peer-checked:translate-x-4" />
        </span>
      </label>
    </div>
  );
}
