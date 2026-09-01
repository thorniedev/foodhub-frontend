import { baseApi } from "./baseApi";
import {
  normalizeArrayPayload,
  normalizePayload,
} from "./utils/normalize";

import type {
  CreatePushSubscriptionRequest,
  FoodHubNotification,
  GetNotificationsParams,
  NotificationFeedMeta,
  NotificationFeedResponse,
  NotificationPreferenceRecord,
  NotificationTypeSummary,
  ProximityNotificationResult,
  ProximityPingRequest,
  UpdateNotificationPreferenceRequest,
  WebPushSubscriptionRecord,
} from "@/types/notifications";

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  return fallback;
}

function asString(value: unknown, fallback = ""): string {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return fallback;
}

function asOptionalString(value: unknown): string | undefined {
  const normalized = asString(value).trim();
  return normalized ? normalized : undefined;
}

function normalizeFeedMeta(value: unknown, itemCount: number): NotificationFeedMeta {
  if (!isRecord(value)) {
    return {
      page: 0,
      pageSize: itemCount,
      totalPages: itemCount > 0 ? 1 : 0,
      limit: itemCount,
      total: itemCount,
      unreadCount: 0,
    };
  }

  return {
    page: asNumber(value.page, 0),
    pageSize: asNumber(value.pageSize, asNumber(value.limit, itemCount)),
    totalPages: asNumber(value.totalPages, itemCount > 0 ? 1 : 0),
    limit: asNumber(value.limit, asNumber(value.pageSize, itemCount)),
    total: asNumber(value.total, itemCount),
    unreadCount: asNumber(value.unreadCount, 0),
  };
}

function normalizeNotificationFeed(response: unknown): NotificationFeedResponse {
  const unwrapped = normalizePayload<unknown>(response, response);

  if (isRecord(unwrapped)) {
    const rawData = unwrapped.data;

    if (Array.isArray(rawData)) {
      return {
        data: rawData as FoodHubNotification[],
        meta: normalizeFeedMeta(unwrapped.meta, rawData.length),
      };
    }

    const pageItems =
      Array.isArray(unwrapped.items)
        ? unwrapped.items
        : Array.isArray(unwrapped.contents)
          ? unwrapped.contents
          : Array.isArray(unwrapped.content)
            ? unwrapped.content
            : null;

    if (pageItems) {
      return {
        data: pageItems as FoodHubNotification[],
        meta: {
          page: asNumber(unwrapped.pageNumber ?? unwrapped.number ?? unwrapped.page, 0),
          pageSize: asNumber(unwrapped.pageSize ?? unwrapped.size, pageItems.length),
          totalPages: asNumber(unwrapped.totalPages, pageItems.length > 0 ? 1 : 0),
          limit: asNumber(unwrapped.limit ?? unwrapped.pageSize ?? unwrapped.size, pageItems.length),
          total: asNumber(unwrapped.totalElements ?? unwrapped.total, pageItems.length),
          unreadCount: asNumber(unwrapped.unreadCount, 0),
        },
      };
    }
  }

  const items = normalizeArrayPayload<FoodHubNotification>(response);

  return {
    data: items,
    meta: normalizeFeedMeta(null, items.length),
  };
}

function normalizeUnreadCount(response: unknown): number {
  const payload = normalizePayload<unknown>(response, response);

  if (isRecord(payload)) {
    return asNumber(payload.count, 0);
  }

  return asNumber(payload, 0);
}

function normalizeVapidPublicKey(response: unknown): string {
  const payload = normalizePayload<unknown>(response, response);

  if (isRecord(payload)) {
    return asString(payload.publicKey).trim();
  }

  return asString(payload).trim();
}

export const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getVapidPublicKey: builder.query<string, void>({
      query: () => ({
        url: "/notifications/push-subscriptions/vapid-public-key",
        method: "GET",
      }),
      transformResponse: normalizeVapidPublicKey,
    }),

    getPushSubscriptions: builder.query<WebPushSubscriptionRecord[], void>({
      query: () => ({
        url: "/notifications/push-subscriptions",
        method: "GET",
      }),
      transformResponse: (response: unknown) =>
        normalizeArrayPayload<WebPushSubscriptionRecord>(response),
      providesTags: [{ type: "PushSubscription", id: "LIST" }],
    }),

    createPushSubscription: builder.mutation<
      WebPushSubscriptionRecord,
      CreatePushSubscriptionRequest
    >({
      query: (body) => ({
        url: "/notifications/push-subscriptions",
        method: "POST",
        body,
      }),
      transformResponse: (response: unknown) =>
        normalizePayload<WebPushSubscriptionRecord>(
          response,
          {} as WebPushSubscriptionRecord,
        ),
      invalidatesTags: [{ type: "PushSubscription", id: "LIST" }],
    }),

    deletePushSubscription: builder.mutation<void, string>({
      query: (uuid) => ({
        url: `/notifications/push-subscriptions/${encodeURIComponent(uuid)}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "PushSubscription", id: "LIST" }],
    }),

    getNotifications: builder.query<
      NotificationFeedResponse,
      GetNotificationsParams | void
    >({
      query: (params) => ({
        url: "/notifications",
        method: "GET",
        params: {
          page: params?.page ?? 0,
          size: params?.size ?? 20,
          ...(typeof params?.isRead === "boolean"
            ? { isRead: params.isRead }
            : {}),
          ...(params?.typeCode ? { typeCode: params.typeCode } : {}),
        },
      }),
      transformResponse: normalizeNotificationFeed,
      providesTags: (result) => [
        { type: "Notification", id: "LIST" },
        ...(result?.data ?? []).map((notification) => ({
          type: "Notification" as const,
          id: notification.uuid,
        })),
      ],
    }),

    getUnreadCount: builder.query<number, void>({
      query: () => ({
        url: "/notifications/unread-count",
        method: "GET",
      }),
      transformResponse: normalizeUnreadCount,
      providesTags: [{ type: "Notification", id: "UNREAD_COUNT" }],
    }),

    getNotification: builder.query<FoodHubNotification, string>({
      query: (uuid) => ({
        url: `/notifications/${encodeURIComponent(uuid)}`,
        method: "GET",
      }),
      transformResponse: (response: unknown) =>
        normalizePayload<FoodHubNotification>(
          response,
          {} as FoodHubNotification,
        ),
      providesTags: (_result, _error, uuid) => [
        { type: "Notification", id: uuid },
      ],
    }),

    markNotificationRead: builder.mutation<FoodHubNotification, string>({
      query: (uuid) => ({
        url: `/notifications/${encodeURIComponent(uuid)}/read`,
        method: "PATCH",
      }),
      transformResponse: (response: unknown) =>
        normalizePayload<FoodHubNotification>(
          response,
          {} as FoodHubNotification,
        ),
      invalidatesTags: (_result, _error, uuid) => [
        { type: "Notification", id: uuid },
        { type: "Notification", id: "LIST" },
        { type: "Notification", id: "UNREAD_COUNT" },
      ],
    }),

    markAllNotificationsRead: builder.mutation<
      { updatedCount: number; readAt?: string },
      void
    >({
      query: () => ({
        url: "/notifications/read-all",
        method: "PATCH",
      }),
      transformResponse: (response: unknown) => {
        const payload = normalizePayload<unknown>(response, {});

        if (!isRecord(payload)) {
          return { updatedCount: 0 };
        }

        return {
          updatedCount: asNumber(payload.updatedCount, 0),
          readAt: asOptionalString(payload.readAt),
        };
      },
      invalidatesTags: [
        { type: "Notification", id: "LIST" },
        { type: "Notification", id: "UNREAD_COUNT" },
      ],
    }),

    dismissNotification: builder.mutation<FoodHubNotification, string>({
      query: (uuid) => ({
        url: `/notifications/${encodeURIComponent(uuid)}/dismiss`,
        method: "PATCH",
      }),
      transformResponse: (response: unknown) =>
        normalizePayload<FoodHubNotification>(
          response,
          {} as FoodHubNotification,
        ),
      invalidatesTags: (_result, _error, uuid) => [
        { type: "Notification", id: uuid },
        { type: "Notification", id: "LIST" },
        { type: "Notification", id: "UNREAD_COUNT" },
      ],
    }),

    sendProximityPing: builder.mutation<
      ProximityNotificationResult,
      ProximityPingRequest
    >({
      query: (body) => ({
        url: "/notifications/proximity-ping",
        method: "POST",
        body,
      }),
      transformResponse: (response: unknown) =>
        normalizePayload<ProximityNotificationResult>(
          response,
          {} as ProximityNotificationResult,
        ),
      invalidatesTags: [
        { type: "Notification", id: "LIST" },
        { type: "Notification", id: "UNREAD_COUNT" },
        { type: "ProximityNotification", id: "LAST_RESULT" },
      ],
    }),

    // =========================================================
    // NOTIFICATION TYPES + PER-TYPE ALERT PREFERENCES
    // GET /notifications/types (static reference data, no tag)
    // GET/PUT /notifications/preferences (the user's own overrides)
    // =========================================================
    getNotificationTypes: builder.query<NotificationTypeSummary[], void>({
      query: () => ({
        url: "/notification-types",
        method: "GET",
        params: { page: 0, size: 100 },
      }),
      transformResponse: (response: unknown) =>
        normalizeArrayPayload<NotificationTypeSummary>(response),
    }),

    getNotificationPreferences: builder.query<
      NotificationPreferenceRecord[],
      void
    >({
      query: () => ({
        url: "/notification-preferences",
        method: "GET",
      }),
      transformResponse: (response: unknown) =>
        normalizeArrayPayload<NotificationPreferenceRecord>(response),
      providesTags: [{ type: "NotificationPreference", id: "LIST" }],
    }),

    updateNotificationPreference: builder.mutation<
      NotificationPreferenceRecord,
      {
        notificationTypeId: number;
        channelType: string;
        body: UpdateNotificationPreferenceRequest;
      }
    >({
      query: ({ notificationTypeId, channelType, body }) => ({
        url: `/notification-preferences/${notificationTypeId}/${channelType}`,
        method: "PUT",
        body,
      }),
      transformResponse: (response: unknown) =>
        normalizePayload<NotificationPreferenceRecord>(
          response,
          {} as NotificationPreferenceRecord,
        ),
      invalidatesTags: [{ type: "NotificationPreference", id: "LIST" }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetVapidPublicKeyQuery,
  useLazyGetVapidPublicKeyQuery,
  useGetPushSubscriptionsQuery,
  useCreatePushSubscriptionMutation,
  useDeletePushSubscriptionMutation,
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useLazyGetNotificationQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useDismissNotificationMutation,
  useSendProximityPingMutation,
  useGetNotificationTypesQuery,
  useGetNotificationPreferencesQuery,
  useUpdateNotificationPreferenceMutation,
} = notificationApi;
