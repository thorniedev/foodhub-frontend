const CACHE_VERSION = "foodhub-v1";
const DEFAULT_NOTIFICATION_URL = "/notifications";
const DEFAULT_NOTIFICATION_ICON = "/icons/pwa-192x192.png";
const DEFAULT_NOTIFICATION_BADGE = "/icons/pwa-192x192.png";

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
          url:
            parsedPayload.data?.url ||
            parsedPayload.url ||
            DEFAULT_NOTIFICATION_URL,
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
      url: payload.data?.url || DEFAULT_NOTIFICATION_URL,
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

  const targetPath = event.notification.data?.url || DEFAULT_NOTIFICATION_URL;

  const targetUrl = new URL(targetPath, self.location.origin).href;

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

          if ("navigate" in client) {
            await client.navigate(targetUrl);
          }

          return client.focus();
        }

        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      }),
  );
});
