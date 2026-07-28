// app/dashboard/notifications/page.tsx
"use client";

import { useMemo, useState } from "react";
import NotificationsHeader from "@/components/dashboard/notifications/NotificationsHeader";
import NotificationSummaryCards from "@/components/dashboard/notifications/NotificationSummaryCards";
import NotificationFilters from "@/components/dashboard/notifications/NotificationFilters";
import NotificationGroup from "@/components/dashboard/notifications/NotificationGroup";
import NotificationsEmptyState from "@/components/dashboard/notifications/NotificationsEmptyState";
import {
  notifications as initialNotifications,
  summaryCards,
  filterTabs,
} from "@/lib/notifications/mock-data";
import type {
  AppNotification,
  NotificationFilterTab,
} from "@/types/notifications";

const GROUP_ORDER: AppNotification["group"][] = [
  "today",
  "yesterday",
  "earlier",
];

export default function NotificationsPage() {
  const [items, setItems] = useState<AppNotification[]>(initialNotifications);
  const [activeTab, setActiveTab] =
    useState<NotificationFilterTab["key"]>("all");
  const [unreadOnly, setUnreadOnly] = useState(false);

  const unreadCount = useMemo(
    () => items.filter((n) => n.isUnread).length,
    [items],
  );

  // "ការរំលឹក" (reminders) ត្រូវនឹងប្រភេទ "meal" ក្នុងទិន្នន័យ ដូច្នេះត្រូវផ្គូផ្គងដោយឡែក
  const filtered = useMemo(() => {
    return items.filter((n) => {
      if (unreadOnly && !n.isUnread) return false;
      if (activeTab === "all") return true;
      if (activeTab === "reminders") return n.category === "meal";
      if (activeTab === "system") return n.category === "account";
      return n.category === activeTab;
    });
  }, [items, activeTab, unreadOnly]);

  const grouped = useMemo(() => {
    return GROUP_ORDER.map((group) => ({
      group,
      notifications: filtered.filter((n) => n.group === group),
    }));
  }, [filtered]);

  const handleMarkAllRead = () => {
    setItems((prev) => prev.map((n) => ({ ...n, isUnread: false })));
  };

  const handleClearRead = () => {
    setItems((prev) => prev.filter((n) => n.isUnread));
  };

  const handleSelectSummaryCard = (category: NotificationFilterTab["key"]) => {
    setActiveTab((current) =>
      current === category ? "all" : (category as NotificationFilterTab["key"]),
    );
  };

  const hasResults = filtered.length > 0;

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
      <NotificationsHeader
        unreadCount={unreadCount}
        onMarkAllRead={handleMarkAllRead}
        onClearRead={handleClearRead}
      />

      <NotificationSummaryCards
        cards={summaryCards}
        activeCategory={activeTab}
        onSelect={handleSelectSummaryCard}
      />

      <NotificationFilters
        tabs={filterTabs}
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        unreadOnly={unreadOnly}
        onToggleUnreadOnly={() => setUnreadOnly((v) => !v)}
      />

      {hasResults ? (
        <div className="space-y-8">
          {grouped.map(
            ({ group, notifications: groupItems }) =>
              groupItems.length > 0 && (
                <NotificationGroup
                  key={group}
                  group={group}
                  notifications={groupItems}
                />
              ),
          )}
        </div>
      ) : (
        <NotificationsEmptyState />
      )}
    </div>
  );
}
