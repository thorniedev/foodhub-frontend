// types/notifications.ts

/** ប្រភេទសំខាន់ៗនៃការជូនដំណឹង (ត្រូវនឹង tab តម្រង) */
export type NotificationCategory =
  | "recommendations"
  | "health"
  | "meal"
  | "favorites"
  | "family"
  | "account";

export type NotificationPriority = "LOW" | "NORMAL" | "HIGH" | "URGENT" | string;

export type NotificationStatus =
  | "CREATED"
  | "QUEUED"
  | "SENT"
  | "DELIVERED"
  | "READ"
  | "DISMISSED"
  | "EXPIRED"
  | string;

export interface FoodHubNotification {
  uuid: string;
  typeCode: string | null;
  typeName: string | null;
  subjectProfileId: number | null;
  recommendationItemId: number | null;
  storeId: number | null;
  menuItemId: number | null;
  title: string;
  body: string;
  imageUrl: string | null;
  priority: NotificationPriority | null;
  data: Record<string, unknown> | null;
  actionUrl: string | null;
  status: NotificationStatus | null;
  isRead: boolean;
  scheduledAt: string | null;
  expiresAt: string | null;
  readAt: string | null;
  dismissedAt: string | null;
  createdAt: string;
}

export interface NotificationFeedMeta {
  page: number;
  pageSize: number;
  totalPages: number;
  limit: number;
  total: number;
  unreadCount: number;
}

export interface NotificationFeedResponse {
  data: FoodHubNotification[];
  meta: NotificationFeedMeta;
}

export interface GetNotificationsParams {
  page?: number;
  size?: number;
  isRead?: boolean;
  typeCode?: string;
}

export interface WebPushSubscriptionRecord {
  uuid: string;
  browserName: string | null;
  deviceLabel: string | null;
  status: string | null;
  failureCount: number | null;
  lastUsedAt: string | null;
  createdAt: string | null;
}

export interface CreatePushSubscriptionRequest {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  browserName?: string;
  deviceLabel?: string;
}

export interface ProximityPingRequest {
  latitude: number;
  longitude: number;
  speed: number | null;
  radiusMeters: number;
}

export interface ProximityNotificationResult {
  triggered: boolean;
  reason: string;
  profileUuid: string | null;
  storeUuid: string | null;
  storeName: string | null;
  distanceMeters: number | string | null;
  menuItemUuid: string | null;
  menuItemName: string | null;
  notificationUuid: string | null;
}

/** ស្លាកញែកបន្ថែមលើកាតនីមួយៗ (ពណ៌ + អត្ថបទខ្លី) */
export interface NotificationTag {
  label: string;
  tone?: "default" | "urgent";
}

/** អ្នកនាំសារ/សមាជិកគ្រួសារ ដែលភ្ជាប់ជាមួយការជូនដំណឹង (ប្រើសម្រាប់ avatar) */
export interface NotificationActor {
  name: string;
  initials: string;
  color?: string; // e.g. "bg-emerald-500"
}

/** តំណភ្ជាប់សកម្មភាព ដែលបង្ហាញនៅចុងកាត (ឧ. "មើលមុខម្ហូប") */
export interface NotificationAction {
  label: string;
  href: string;
}

export interface AppNotification {
  id: string;
  uuid?: string;
  category: NotificationCategory;
  typeCode?: string | null;
  typeName?: string | null;
  title: string;
  message: string;
  imageUrl?: string | null;
  priority?: NotificationPriority | null;
  status?: NotificationStatus | null;
  data?: Record<string, unknown> | null;
  actionUrl?: string | null;
  /** ស្លាកតូចៗនៅក្រោមសារ ឧ. "ការណែនាំ · អាហារថ្ងៃត្រង់" */
  tags: NotificationTag[];
  createdAt: string; // ISO date string
  isUnread: boolean;
  isUrgent?: boolean;
  actor?: NotificationActor;
  action: NotificationAction;
  /** ក្រុមកាលបរិច្ឆេទសម្រាប់ចំណងជើងផ្នែក ("ថ្ងៃនេះ", "ម្សិលមិញ", "មុននេះ") */
  group: "today" | "yesterday" | "earlier";
}

/** សង្ខេបចំនួននីមួយៗសម្រាប់ស្លាកខាងលើទំព័រ (Recommendations, Health...) */
export interface NotificationSummaryCard {
  key: string;
  category: NotificationCategory;
  typeCode?: string | null;
  label: string;
  count: number;
  icon: "sparkles" | "heart" | "utensils" | "star" | "users" | "settings";
  accent: string; // tailwind text/bg accent class root, e.g. "emerald"
}

/** តម្រង tab នៅជួរទី ២ */
export interface NotificationFilterTab {
  key: string;
  label: string;
  count?: number;
  dotColor?: string;
}
