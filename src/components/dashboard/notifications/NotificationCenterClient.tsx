"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import {
  useDismissNotificationMutation,
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useLazyGetNotificationQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from "@/app/store/notificationApi";
import NotificationFilters from "@/components/dashboard/notifications/NotificationFilters";
import NotificationGroup from "@/components/dashboard/notifications/NotificationGroup";
import NotificationsEmptyState from "@/components/dashboard/notifications/NotificationsEmptyState";
import NotificationsHeader from "@/components/dashboard/notifications/NotificationsHeader";
import NotificationSummaryCards from "@/components/dashboard/notifications/NotificationSummaryCards";
import PushNotificationManager from "@/components/dashboard/notifications/PushNotificationManager";
import {
  createFilterTabs,
  createSummaryCards,
  toAppNotification,
} from "@/lib/notifications/notification-mappers";
import type {
  AppNotification,
  FoodHubNotification,
  NotificationFilterTab,
} from "@/types/notifications";

const GROUP_ORDER: AppNotification["group"][] = [
  "today",
  "yesterday",
  "earlier",
];

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "data" in error &&
    typeof error.data === "object" &&
    error.data !== null &&
    "message" in error.data &&
    typeof error.data.message === "string"
  ) {
    return error.data.message;
  }

  return fallback;
}

function resolveActionUrl(notification: FoodHubNotification): string {
  const dataUrl = notification.data?.url;

  if (notification.actionUrl?.trim()) {
    return notification.actionUrl.trim();
  }

  if (typeof dataUrl === "string" && dataUrl.trim()) {
    return dataUrl.trim();
  }

  return "/notifications";
}

export default function NotificationCenterClient() {
  const router = useRouter();
  const [activeTab, setActiveTab] =
    useState<NotificationFilterTab["key"]>("all");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [openingNotificationId, setOpeningNotificationId] = useState<
    string | null
  >(null);
  const [dismissingNotificationId, setDismissingNotificationId] = useState<
    string | null
  >(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(
    () => typeof navigator === "undefined" || navigator.onLine,
  );

  const {
    data: feed,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetNotificationsQuery({
    page: 0,
    size: 20,
  });
  const {
    data: unreadCount,
    isFetching: isFetchingUnreadCount,
    refetch: refetchUnreadCount,
  } = useGetUnreadCountQuery(undefined, {
    pollingInterval: 60_000,
    skipPollingIfUnfocused: true,
  });
  const [getNotification] = useLazyGetNotificationQuery();
  const [markNotificationRead] = useMarkNotificationReadMutation();
  const [markAllNotificationsRead, { isLoading: isMarkingAllRead }] =
    useMarkAllNotificationsReadMutation();
  const [dismissNotification] = useDismissNotificationMutation();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const notifications = useMemo(() => {
    return (feed?.data ?? []).map(toAppNotification);
  }, [feed?.data]);

  const displayedUnreadCount =
    unreadCount ?? feed?.meta.unreadCount ?? notifications.filter((n) => n.isUnread).length;

  const summaryCards = useMemo(
    () => createSummaryCards(notifications),
    [notifications],
  );

  const filterTabs = useMemo(
    () => createFilterTabs(notifications),
    [notifications],
  );

  const filtered = useMemo(() => {
    return notifications.filter((notification) => {
      if (unreadOnly && !notification.isUnread) {
        return false;
      }

      if (activeTab === "all") {
        return true;
      }

      if (activeTab === "reminders") {
        return (
          notification.category === "meal" ||
          notification.typeCode?.toLowerCase().includes("reminder") ||
          notification.typeName?.toLowerCase().includes("reminder")
        );
      }

      if (activeTab === "system") {
        return notification.category === "account";
      }

      return notification.category === activeTab;
    });
  }, [activeTab, notifications, unreadOnly]);

  const grouped = useMemo(() => {
    return GROUP_ORDER.map((group) => ({
      group,
      notifications: filtered.filter(
        (notification) => notification.group === group,
      ),
    }));
  }, [filtered]);

  const navigateToUrl = (url: string) => {
    try {
      const target = new URL(url || "/notifications", window.location.origin);

      if (target.origin === window.location.origin) {
        router.push(`${target.pathname}${target.search}${target.hash}`);
        return;
      }

      window.location.assign(target.href);
    } catch {
      router.push("/notifications");
    }
  };

  const handleRefresh = async () => {
    setActionError(null);
    await Promise.all([refetch(), refetchUnreadCount()]);
  };

  const handleMarkAllRead = async () => {
    setActionError(null);

    try {
      await markAllNotificationsRead().unwrap();
    } catch (error) {
      setActionError(
        getErrorMessage(error, "FoodHub could not mark notifications as read."),
      );
    }
  };

  const handleOpenNotification = async (notification: AppNotification) => {
    const uuid = notification.uuid ?? notification.id;
    setOpeningNotificationId(notification.id);
    setActionError(null);

    try {
      const detail = await getNotification(uuid).unwrap();

      if (!detail.isRead) {
        await markNotificationRead(uuid).unwrap();
      }

      navigateToUrl(resolveActionUrl(detail));
    } catch (error) {
      setActionError(
        getErrorMessage(error, "FoodHub could not open that notification."),
      );
    } finally {
      setOpeningNotificationId(null);
    }
  };

  const handleDismissNotification = async (notification: AppNotification) => {
    const uuid = notification.uuid ?? notification.id;
    setDismissingNotificationId(notification.id);
    setActionError(null);

    try {
      await dismissNotification(uuid).unwrap();
    } catch (error) {
      setActionError(
        getErrorMessage(error, "FoodHub could not dismiss that notification."),
      );
    } finally {
      setDismissingNotificationId(null);
    }
  };

  const handleSelectSummaryCard = (category: NotificationFilterTab["key"]) => {
    setActiveTab((current) =>
      current === category ? "all" : (category as NotificationFilterTab["key"]),
    );
  };

  const hasResults = filtered.length > 0;

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
      <PushNotificationManager />

      {!isOnline && (
        <p className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
          You are offline. FoodHub will refresh notifications when the network
          is available again.
        </p>
      )}

      {actionError && (
        <p className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {actionError}
        </p>
      )}

      <NotificationsHeader
        unreadCount={displayedUnreadCount}
        isMarkingAllRead={isMarkingAllRead}
        isRefreshing={isFetching || isFetchingUnreadCount}
        onMarkAllRead={handleMarkAllRead}
        onRefresh={handleRefresh}
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
        onToggleUnreadOnly={() => setUnreadOnly((value) => !value)}
      />

      {isLoading ? (
        <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-6 text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading notifications...
        </div>
      ) : isError ? (
        <NotificationsEmptyState
          title="FoodHub could not load notifications"
          description="Check your connection or sign in again, then refresh this page."
        />
      ) : hasResults ? (
        <div className="space-y-8">
          {grouped.map(
            ({ group, notifications: groupItems }) =>
              groupItems.length > 0 && (
                <NotificationGroup
                  key={group}
                  group={group}
                  notifications={groupItems}
                  openingNotificationId={openingNotificationId}
                  dismissingNotificationId={dismissingNotificationId}
                  onOpen={handleOpenNotification}
                  onDismiss={handleDismissNotification}
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
