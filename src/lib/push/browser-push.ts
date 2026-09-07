import type { CreatePushSubscriptionRequest } from "@/types/notifications";

export function isPushNotificationSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export function urlBase64ToUint8Array(
  base64String: string,
): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length) as Uint8Array<ArrayBuffer>;

  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

export async function getFoodHubServiceWorkerRegistration(): Promise<ServiceWorkerRegistration> {
  if (!("serviceWorker" in navigator)) {
    throw new Error("Service workers are not supported in this browser.");
  }

  const existingRegistration = await navigator.serviceWorker.getRegistration("/");

  if (existingRegistration) {
    return existingRegistration;
  }

  await navigator.serviceWorker.register("/sw.js", {
    scope: "/",
    updateViaCache: "none",
  });

  return navigator.serviceWorker.ready;
}

/**
 * Ends this browser's Web Push subscription, then sends the user to logout.
 *
 * <p>Signing out only cleared cookies, so the push subscription registered on
 * the device stayed live: a logged-out browser -- including a shared or public
 * one -- kept receiving meal reminders and nearby-store alerts for the account
 * that had used it. Unsubscribing invalidates the push endpoint, and the
 * backend marks the stored subscription INVALID the next time it gets a 410
 * from the push service, so no separate cleanup call is needed.
 *
 * Navigation happens even if unsubscribing fails: refusing to log someone out
 * because their browser would not release a push subscription is the worse
 * outcome of the two.
 */
export async function logoutAndUnsubscribePush(
  logoutUrl = "/api/auth/logout",
): Promise<void> {
  try {
    if (isPushNotificationSupported()) {
      const registration = await navigator.serviceWorker.getRegistration("/");
      const subscription = await registration?.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
      }
    }
  } catch {
    // Falls through to the logout navigation below.
  }

  window.location.assign(logoutUrl);
}

export function detectBrowserName(userAgent = navigator.userAgent): string {
  if (/Edg\//.test(userAgent)) {
    return "Microsoft Edge";
  }

  if (/OPR\//.test(userAgent) || /Opera/.test(userAgent)) {
    return "Opera";
  }

  if (/Firefox\//.test(userAgent)) {
    return "Firefox";
  }

  if (/Chrome\//.test(userAgent) || /CriOS\//.test(userAgent)) {
    return "Chrome";
  }

  if (/Safari\//.test(userAgent)) {
    return "Safari";
  }

  return "Browser";
}

export function getDeviceLabel(browserName = detectBrowserName()): string {
  const platform = navigator.platform || "this device";
  return `${browserName} on ${platform}`;
}

export function serializePushSubscription(
  subscription: PushSubscription,
): CreatePushSubscriptionRequest {
  const json = subscription.toJSON();
  const p256dh = json.keys?.p256dh;
  const auth = json.keys?.auth;

  if (!subscription.endpoint || !p256dh || !auth) {
    throw new Error("Browser returned an incomplete push subscription.");
  }

  const browserName = detectBrowserName();

  return {
    endpoint: subscription.endpoint,
    keys: {
      p256dh,
      auth,
    },
    browserName,
    deviceLabel: getDeviceLabel(browserName),
  };
}
