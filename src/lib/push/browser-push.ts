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
