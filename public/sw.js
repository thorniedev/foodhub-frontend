const CACHE_VERSION = "foodhub-v1";
const DEFAULT_NOTIFICATION_URL = "/notifications";
const DEFAULT_NOTIFICATION_ICON = "/icons/pwa-192x192.png";
const DEFAULT_NOTIFICATION_BADGE = "/icons/pwa-badge-96x96.png";

function normalizeNotificationPath(value) {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  try {
    const url = new URL(value.trim(), self.location.origin);

    if (url.origin !== self.location.origin) {
      return null;
    }

    return `${url.pathname}${url.search}${url.hash}` || DEFAULT_NOTIFICATION_URL;
  } catch {
    return null;
  }
}

function resolveNotificationPath(data = {}) {
  const explicitPath = normalizeNotificationPath(data.actionUrl || data.url);

  if (explicitPath) {
    return explicitPath;
  }

  if (typeof data.storeUuid === "string" && data.storeUuid.trim()) {
    const storePath = `/stores/${encodeURIComponent(data.storeUuid.trim())}`;
    const itemQuery =
      typeof data.menuItemUuid === "string" && data.menuItemUuid.trim()
        ? `?item=${encodeURIComponent(data.menuItemUuid.trim())}`
        : "";

    return `${storePath}${itemQuery}`;
  }

  if (typeof data.menuItemUuid === "string" && data.menuItemUuid.trim()) {
    return `/menu-items/${encodeURIComponent(data.menuItemUuid.trim())}`;
  }

  if (data.type === "MEAL_REMINDER" && typeof data.mealTypeCode === "string") {
    return `/menu?mealType=${encodeURIComponent(data.mealTypeCode)}`;
  }

  if (typeof data.notificationUuid === "string" && data.notificationUuid.trim()) {
    return `/notifications?notification=${encodeURIComponent(
      data.notificationUuid.trim(),
    )}`;
  }

  return DEFAULT_NOTIFICATION_URL;
}

self.addEventListener("install", () => {
  console.log("[FoodHub PWA] Service Worker installed");

  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("[FoodHub PWA] Service Worker activated");

  event.waitUntil(
    Promise.all([
      self.clients.claim(),

      caches
        .keys()
        .then((cacheNames) =>
          Promise.all(
            cacheNames
              .filter(
                (cacheName) =>
                  cacheName.startsWith("foodhub-") &&
                  cacheName !== CACHE_VERSION,
              )
              .map((cacheName) => caches.delete(cacheName)),
          ),
        ),
    ]),
  );
});

/**
 * Receive Web Push messages.
 */
self.addEventListener("push", (event) => {
  let payload = {
    title: "FoodHub",
    body: "You have a new notification.",
    icon: DEFAULT_NOTIFICATION_ICON,
    badge: DEFAULT_NOTIFICATION_BADGE,
    tag: "foodhub-notification",
    image: undefined,
    data: {
      url: DEFAULT_NOTIFICATION_URL,
    },
  };

  if (event.data) {
    try {
      const parsedPayload = event.data.json();

      payload = {
        ...payload,
        ...parsedPayload,
        data: {
          ...payload.data,
          ...(parsedPayload.data || {}),
          actionUrl: parsedPayload.data?.actionUrl || parsedPayload.actionUrl,
          url: resolveNotificationPath({
            ...(parsedPayload.data || {}),
            actionUrl: parsedPayload.data?.actionUrl || parsedPayload.actionUrl,
            url: parsedPayload.data?.url || parsedPayload.url,
          }),
        },
      };
    } catch (error) {
      console.error("[FoodHub Push] Failed to parse push payload:", error);

      payload.body = event.data.text();
    }
  }

  const options = {
    body: payload.body,

    icon: payload.icon || DEFAULT_NOTIFICATION_ICON,

    badge: payload.badge || DEFAULT_NOTIFICATION_BADGE,

    tag: payload.tag || payload.data?.notificationUuid || "foodhub-notification",

    image: payload.image,

    data: {
      ...payload.data,
      url: resolveNotificationPath(payload.data),
    },

    actions: [
      {
        action: "view",
        title: "View",
      },
      {
        action: "dismiss",
        title: "Dismiss",
      },
    ],

    vibrate: [200, 100, 200],
  };

  event.waitUntil(
    self.registration.showNotification(payload.title || "FoodHub", options),
  );
});

/**
 * Handle notification clicks.
 */
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "dismiss") {
    return;
  }

  const targetUrl = new URL(
    resolveNotificationPath(event.notification.data),
    self.location.origin,
  ).href;

  event.waitUntil(
    clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then(async (windowClients) => {
        for (const client of windowClients) {
          if (!client.url.startsWith(self.location.origin)) {
            continue;
          }

          if (client.url === targetUrl) {
            return client.focus();
          }
        }

        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      }),
  );
});
