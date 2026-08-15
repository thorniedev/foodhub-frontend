const CACHE_VERSION = "foodhub-v1";

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
  console.log("[FoodHub Push] Push received");

  let data = {
    title: "FoodHub",
    body: "You have a new notification.",
    url: "/dashboard/notifications",
    icon: "/icons/pwa-192x192.png",
    badge: "/icons/pwa-192x192.png",
    tag: "foodhub-notification",
  };

  if (event.data) {
    try {
      const payload = event.data.json();

      data = {
        ...data,
        ...payload,
      };
    } catch (error) {
      console.error("[FoodHub Push] Failed to parse push payload:", error);

      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,

    icon: data.icon || "/icons/pwa-192x192.png",

    badge: data.badge || "/icons/pwa-192x192.png",

    tag: data.tag || "foodhub-notification",

    data: {
      url: data.url || "/dashboard/notifications",
    },

    vibrate: [200, 100, 200],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || "FoodHub", options),
  );
});

/**
 * Handle notification clicks.
 */
self.addEventListener("notificationclick", (event) => {
  console.log("[FoodHub Push] Notification clicked");

  event.notification.close();

  const targetPath = event.notification.data?.url || "/dashboard/notifications";

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
