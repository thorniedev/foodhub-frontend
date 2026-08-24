// components/dashboard/notifications/NotificationGroup.tsx
"use client";

import NotificationCard from "./NotificationCard";
import { groupLabels } from "@/lib/notifications/category-styles";
import type { AppNotification } from "@/types/notifications";

interface Props {
  group: "today" | "yesterday" | "earlier";
  notifications: AppNotification[];
  openingNotificationId?: string | null;
  dismissingNotificationId?: string | null;
  onOpen: (notification: AppNotification) => void;
  onDismiss: (notification: AppNotification) => void;
}

export default function NotificationGroup({
  group,
  notifications,
  openingNotificationId,
  dismissingNotificationId,
  onOpen,
  onDismiss,
}: Props) {
  if (notifications.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <p className="text-2xl font-semibold uppercase tracking-wide text-[#F97316]">
          {groupLabels[group]}
        </p>
        <span className="text-base text-slate-400">{notifications.length}</span>
      </div>

      <div className="space-y-3">
        {notifications.map((n) => (
          <NotificationCard
            key={n.id}
            notification={n}
            isOpening={openingNotificationId === n.id}
            isDismissing={dismissingNotificationId === n.id}
            onOpen={onOpen}
            onDismiss={onDismiss}
          />
        ))}
      </div>
    </section>
  );
}
