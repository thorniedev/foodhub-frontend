export interface StoredPushSubscription {
  endpoint: string;

  expirationTime?: number | null;

  keys: {
    p256dh: string;
    auth: string;
  };
}

declare global {
  var foodhubPushSubscriptions: Map<string, StoredPushSubscription> | undefined;
}

/**
 * Temporary subscription storage.
 *
 * IMPORTANT:
 * This is only for development/testing.
 *
 * When Spring Boot push endpoints are ready,
 * subscriptions should be stored in the database.
 */
export const pushSubscriptions =
  globalThis.foodhubPushSubscriptions ??
  new Map<string, StoredPushSubscription>();

globalThis.foodhubPushSubscriptions = pushSubscriptions;
