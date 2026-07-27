// components/dashboard/notifications/NotificationGroup.tsx
"use client";

import NotificationCard from "./NotificationCard";
import { groupLabels } from "@/lib/notifications/category-styles";
import type { AppNotification } from "@/types/notifications";

interface Props {
  group: "today" | "yesterday" | "earlier";
  notifications: AppNotification[];
}

export default function NotificationGroup({ group, notifications }: Props) {
  if (notifications.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          {groupLabels[group]}
        </h2>
        <span className="text-xs text-slate-400">{notifications.length}</span>
      </div>

      <div className="space-y-3">
        {notifications.map((n) => (
          <NotificationCard key={n.id} notification={n} />
        ))}
      </div>
    </section>
  );
}
