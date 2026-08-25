import type {
  AppNotification,
  FoodHubNotification,
  NotificationCategory,
  NotificationFilterTab,
  NotificationSummaryCard,
} from "@/types/notifications";
import { getPhnomPenhDateKey } from "@/lib/formatDate";

const CATEGORY_LABELS: Record<NotificationCategory, string> = {
  recommendations: "ការណែនាំ",
  health: "សុខភាព",
  meal: "អាហារ",
  favorites: "ចំណូលចិត្ត",
  family: "គ្រួសារ",
  account: "គណនី",
};

const CATEGORY_ICON: Record<NotificationCategory, NotificationSummaryCard["icon"]> = {
  recommendations: "sparkles",
  health: "heart",
  meal: "utensils",
  favorites: "star",
  family: "users",
  account: "settings",
};

const CATEGORY_ACCENT: Record<NotificationCategory, string> = {
  recommendations: "emerald",
  health: "rose",
  meal: "amber",
  favorites: "yellow",
  family: "violet",
  account: "slate",
};

const CATEGORY_DOT: Record<NotificationCategory, string> = {
  recommendations: "bg-emerald-500",
  health: "bg-rose-500",
  meal: "bg-orange-500",
  favorites: "bg-yellow-500",
  family: "bg-violet-500",
  account: "bg-slate-400",
};

function formatApiTypeLabel(value?: string | null): string {
  if (!value?.trim()) {
    return "";
  }

  return value
    .trim()
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function normalizeSearchText(notification: FoodHubNotification): string {
  return [
    notification.typeCode,
    notification.typeName,
    notification.title,
    notification.body,
    notification.priority,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function getNotificationCategory(
  notification: FoodHubNotification,
): NotificationCategory {
  const text = normalizeSearchText(notification);

  if (
    text.includes("health") ||
    text.includes("safety") ||
    text.includes("allerg") ||
    text.includes("diet") ||
    text.includes("medical")
  ) {
    return "health";
  }

  if (
    text.includes("meal") ||
    text.includes("reminder") ||
    text.includes("breakfast") ||
    text.includes("lunch") ||
    text.includes("dinner")
  ) {
    return "meal";
  }

  if (
    text.includes("favorite") ||
    text.includes("bookmark") ||
    text.includes("saved")
  ) {
    return "favorites";
  }

  if (
    text.includes("family") ||
    text.includes("profile") ||
    text.includes("member")
  ) {
    return "family";
  }

  if (
    text.includes("account") ||
    text.includes("system") ||
    text.includes("security") ||
    text.includes("password") ||
    text.includes("billing")
  ) {
    return "account";
  }

  return "recommendations";
}

export function getNotificationFeatureKey(
  notification: AppNotification,
): string {
  return notification.typeCode?.trim() || notification.category;
}

function getNotificationGroup(
  createdAt: string,
): AppNotification["group"] {
  const targetDateKey = getPhnomPenhDateKey(createdAt);

  if (!targetDateKey) {
    return "earlier";
  }

  const now = new Date();
  const todayKey = getPhnomPenhDateKey(now);
  const yesterdayKey = getPhnomPenhDateKey(
    new Date(now.getTime() - 86_400_000),
  );

  if (targetDateKey === todayKey) {
    return "today";
  }

  if (targetDateKey === yesterdayKey) {
    return "yesterday";
  }

  return "earlier";
}

function getDataUrl(data: Record<string, unknown> | null): string | null {
  const value = data?.url;
  return typeof value === "string" && value.trim() ? value : null;
}

function getActionUrl(notification: FoodHubNotification): string {
  return (
    notification.actionUrl?.trim() ||
    getDataUrl(notification.data) ||
    "/notifications"
  );
}

export function toAppNotification(
  notification: FoodHubNotification,
): AppNotification {
  const category = getNotificationCategory(notification);
  const typeLabel =
    notification.typeName?.trim() ||
    formatApiTypeLabel(notification.typeCode) ||
    CATEGORY_LABELS[category];

  return {
    id: notification.uuid,
    uuid: notification.uuid,
    category,
    typeCode: notification.typeCode,
    typeName: notification.typeName,
    title: notification.title || "FoodHub",
    message: notification.body || "You have a new FoodHub notification.",
    imageUrl: notification.imageUrl,
    priority: notification.priority,
    status: notification.status,
    data: notification.data,
    actionUrl: getActionUrl(notification),
    tags: [
      { label: typeLabel },
      ...(notification.priority === "URGENT" || notification.priority === "HIGH"
        ? [{ label: notification.priority, tone: "urgent" as const }]
        : []),
    ],
    createdAt: notification.createdAt,
    isUnread: !notification.isRead,
    isUrgent: notification.priority === "URGENT" || notification.priority === "HIGH",
    action: {
      label: "មើល",
      href: getActionUrl(notification),
    },
    group: getNotificationGroup(notification.createdAt),
  };
}

export function createSummaryCards(
  notifications: AppNotification[],
): NotificationSummaryCard[] {
  const typeMap = new Map<
    string,
    {
      category: NotificationCategory;
      count: number;
      label: string;
      typeCode: string | null;
    }
  >();

  notifications.forEach((notification) => {
    const typeCode = notification.typeCode?.trim() || null;
    const key = getNotificationFeatureKey(notification);
    const existing = typeMap.get(key);

    if (existing) {
      existing.count += 1;
      return;
    }

    typeMap.set(key, {
      category: notification.category,
      count: 1,
      label:
        notification.typeName?.trim() ||
        formatApiTypeLabel(typeCode) ||
        CATEGORY_LABELS[notification.category],
      typeCode,
    });
  });

  return [...typeMap.entries()]
    .sort(([, a], [, b]) => b.count - a.count || a.label.localeCompare(b.label))
    .map(([key, value]) => ({
      key,
      category: value.category,
      typeCode: value.typeCode,
      label: value.label,
      count: value.count,
      icon: CATEGORY_ICON[value.category],
      accent: CATEGORY_ACCENT[value.category],
    }));
}

export function createFilterTabs(
  notifications: AppNotification[],
): NotificationFilterTab[] {
  const typeTabs = createSummaryCards(notifications).map((card) => ({
    key: card.key,
    label: card.label,
    count: card.count,
    dotColor: CATEGORY_DOT[card.category],
  }));

  return [
    { key: "all", label: "ទាំងអស់", count: notifications.length },
    ...typeTabs,
  ];
}

export function timeAgo(iso: string, now: Date = new Date()): string {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const diffMs = Math.max(0, now.getTime() - date.getTime());
  const minutes = Math.floor(diffMs / 60_000);

  if (minutes < 1) {
    return "ទើបតែឥឡូវនេះ";
  }

  if (minutes < 60) {
    return `${minutes} នាទីមុន`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} ម៉ោងមុន`;
  }

  const days = Math.floor(hours / 24);

  return `${days} ថ្ងៃមុន`;
}
