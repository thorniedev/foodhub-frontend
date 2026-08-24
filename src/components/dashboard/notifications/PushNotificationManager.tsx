"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bell,
  BellOff,
  Loader2,
  MapPin,
  RadioTower,
  Smartphone,
  Trash2,
} from "lucide-react";

import {
  useCreatePushSubscriptionMutation,
  useDeletePushSubscriptionMutation,
  useGetPushSubscriptionsQuery,
  useLazyGetVapidPublicKeyQuery,
} from "@/app/store/notificationApi";
import { useNearbyRecommendationPings } from "@/hooks/useNearbyRecommendationPings";
import {
  getFoodHubServiceWorkerRegistration,
  isPushNotificationSupported,
  serializePushSubscription,
  urlBase64ToUint8Array,
} from "@/lib/push/browser-push";
import type { WebPushSubscriptionRecord } from "@/types/notifications";

type PushSupportStatus = "loading" | "supported" | "unsupported";

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

function getPushEnableErrorMessage(error: unknown): string {
  const rawMessage =
    error instanceof Error && error.message ? error.message : getErrorMessage(error, "");
  const message = rawMessage.toLowerCase();

  if (message.includes("push service error")) {
    return "This browser could not register with its push service. If you are using Brave, enable \"Use Google services for push messaging\" in brave://settings/privacy, restart Brave, then try again.";
  }

  return getErrorMessage(error, "FoodHub could not enable push notifications.");
}

function formatDate(value?: string | null): string {
  if (!value) {
    return "Not used yet";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not used yet";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getPermissionTone(permission: NotificationPermission) {
  if (permission === "granted") {
    return "bg-emerald-50 text-emerald-700 ring-emerald-100";
  }

  if (permission === "denied") {
    return "bg-rose-50 text-rose-700 ring-rose-100";
  }

  return "bg-slate-100 text-slate-700 ring-slate-200";
}

function SubscriptionRow({
  subscription,
  isRevoking,
  onRevoke,
}: {
  subscription: WebPushSubscriptionRecord;
  isRevoking: boolean;
  onRevoke: (uuid: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <Smartphone className="h-4 w-4 shrink-0 text-[#136C34]" />
          <p className="truncate text-sm font-semibold text-slate-800">
            {subscription.deviceLabel || "FoodHub device"}
          </p>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          {subscription.browserName || "Browser"} ·{" "}
          {subscription.status || "ACTIVE"} · Last used{" "}
          {formatDate(subscription.lastUsedAt)}
        </p>
      </div>

      <button
        type="button"
        onClick={() => onRevoke(subscription.uuid)}
        disabled={isRevoking}
        className="inline-flex items-center justify-center gap-2 rounded-lg border border-rose-100 bg-white px-3 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isRevoking ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
        Revoke
      </button>
    </div>
  );
}

function NearbyRecommendationsSettings() {
  const nearby = useNearbyRecommendationPings();
  const lastPingLabel = useMemo(() => {
    if (!nearby.lastPingAt) {
      return "No ping sent yet";
    }

    return formatDate(nearby.lastPingAt);
  }, [nearby.lastPingAt]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-[#136C34]">
            <MapPin className="h-5 w-5" />
          </span>
          <div>
            <p className="text-lg font-semibold text-slate-900">
              Nearby store recommendations
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Status: {nearby.enabled ? "Enabled" : "Disabled"} ·{" "}
              {nearby.status}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={nearby.enabled ? nearby.disable : nearby.enable}
          className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
            nearby.enabled
              ? "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              : "bg-[#136C34] text-white hover:bg-[#0f5428]"
          }`}
        >
          <RadioTower className="h-4 w-4" />
          {nearby.enabled ? "Disable nearby recommendations" : "Enable nearby recommendations"}
        </button>
      </div>

      <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs font-medium uppercase text-slate-400">
            Last proximity ping
          </p>
          <p className="mt-1 font-medium text-slate-700">{lastPingLabel}</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs font-medium uppercase text-slate-400">
            Latest result
          </p>
          <p className="mt-1 font-medium text-slate-700">
            {nearby.isPinging
              ? "Checking nearby stores..."
              : nearby.lastResult?.triggered
                ? nearby.lastResult.storeName || "Recommendation triggered"
                : nearby.lastResult?.reason || "Waiting for movement"}
          </p>
        </div>
      </div>

      {nearby.error && (
        <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {nearby.error}
        </p>
      )}
    </section>
  );
}

export default function PushNotificationManager() {
  const [supportStatus, setSupportStatus] =
    useState<PushSupportStatus>("loading");
  const [permission, setPermission] =
    useState<NotificationPermission>("default");
  const [localSubscription, setLocalSubscription] =
    useState<PushSubscription | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [revokingUuid, setRevokingUuid] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(
    () => typeof navigator === "undefined" || navigator.onLine,
  );

  const [fetchVapidPublicKey] = useLazyGetVapidPublicKeyQuery();
  const [createPushSubscription, { isLoading: isCreatingSubscription }] =
    useCreatePushSubscriptionMutation();
  const [deletePushSubscription] = useDeletePushSubscriptionMutation();

  const {
    data: subscriptions = [],
    isLoading: isLoadingSubscriptions,
    isFetching: isFetchingSubscriptions,
    isError: hasSubscriptionError,
    refetch: refetchSubscriptions,
  } = useGetPushSubscriptionsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const refreshBrowserPushState = useCallback(async () => {
    if (!isPushNotificationSupported()) {
      setSupportStatus("unsupported");
      return;
    }

    setSupportStatus("supported");
    setPermission(Notification.permission);

    try {
      const registration = await getFoodHubServiceWorkerRegistration();
      const subscription = await registration.pushManager.getSubscription();

      setLocalSubscription(subscription);
    } catch {
      setLocalSubscription(null);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void refreshBrowserPushState();
    });
  }, [refreshBrowserPushState]);

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

  const enableNotifications = async () => {
    setMessage(null);
    setActionError(null);

    try {
      if (!isPushNotificationSupported()) {
        setSupportStatus("unsupported");
        return;
      }

      const vapidPublicKey = await fetchVapidPublicKey().unwrap();

      if (!vapidPublicKey) {
        throw new Error(
          "Web Push is not configured on the backend. Set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY in production, redeploy the backend, then enable push again.",
        );
      }

      const nextPermission = await Notification.requestPermission();
      setPermission(nextPermission);

      if (nextPermission !== "granted") {
        return;
      }

      const registration = await getFoodHubServiceWorkerRegistration();
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        });
      }

      await createPushSubscription(
        serializePushSubscription(subscription),
      ).unwrap();

      setLocalSubscription(subscription);
      setMessage("Push notifications are enabled for this browser.");
      await refetchSubscriptions();
    } catch (error) {
      setActionError(getPushEnableErrorMessage(error));
    }
  };

  const disableThisBrowser = async () => {
    setMessage(null);
    setActionError(null);

    try {
      const registration = await getFoodHubServiceWorkerRegistration();
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
      }

      setLocalSubscription(null);
      setMessage("Push subscription was removed from this browser.");
    } catch (error) {
      setActionError(
        getErrorMessage(error, "FoodHub could not disable this browser."),
      );
    }
  };

  const revokeSubscription = async (uuid: string) => {
    setMessage(null);
    setActionError(null);
    setRevokingUuid(uuid);

    try {
      await deletePushSubscription(uuid).unwrap();
      setMessage("Push subscription revoked.");
      await refreshBrowserPushState();
    } catch (error) {
      setActionError(
        getErrorMessage(error, "FoodHub could not revoke that subscription."),
      );
    } finally {
      setRevokingUuid(null);
    }
  };

  const isBrowserSubscribed =
    permission === "granted" && Boolean(localSubscription);

  if (supportStatus === "loading") {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3 text-slate-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          Checking push notification support...
        </div>
      </section>
    );
  }

  if (supportStatus === "unsupported") {
    return (
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
              <BellOff className="h-5 w-5" />
            </span>
            <div>
              <p className="text-lg font-semibold text-slate-900">
                Push Notifications
              </p>
              <p className="mt-1 text-sm text-slate-500">
                This browser does not support FoodHub push notifications.
              </p>
            </div>
          </div>
        </section>
        <NearbyRecommendationsSettings />
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[#E36914]">
              <Bell className="h-5 w-5" />
            </span>
            <div>
              <p className="text-lg font-semibold text-slate-900">
                Push Notifications
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${getPermissionTone(
                    permission,
                  )}`}
                >
                  Permission: {permission}
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${
                    isBrowserSubscribed
                      ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
                      : "bg-slate-100 text-slate-700 ring-slate-200"
                  }`}
                >
                  Browser: {isBrowserSubscribed ? "Subscribed" : "Not subscribed"}
                </span>
                {!isOnline && (
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-100">
                    Offline
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={enableNotifications}
              disabled={isCreatingSubscription || !isOnline}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#136C34] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0f5428] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isCreatingSubscription ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Bell className="h-4 w-4" />
              )}
              Enable Push Notifications
            </button>

            {isBrowserSubscribed && (
              <button
                type="button"
                onClick={disableThisBrowser}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <BellOff className="h-4 w-4" />
                Disable this browser
              </button>
            )}
          </div>
        </div>

        {permission === "denied" && (
          <p className="mt-4 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">
            Browser permission is denied. Enable notifications from your browser
            or device settings, then return to FoodHub.
          </p>
        )}

        {message && (
          <p className="mt-4 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {message}
          </p>
        )}

        {actionError && (
          <p className="mt-4 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {actionError}
          </p>
        )}

        <div className="mt-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-slate-700">
              Registered subscriptions
            </p>
            {isFetchingSubscriptions && (
              <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
            )}
          </div>

          {isLoadingSubscriptions ? (
            <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
              Loading subscriptions...
            </div>
          ) : hasSubscriptionError ? (
            <div className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700">
              FoodHub could not load registered subscriptions.
            </div>
          ) : subscriptions.length > 0 ? (
            <div className="space-y-2">
              {subscriptions.map((subscription) => (
                <SubscriptionRow
                  key={subscription.uuid}
                  subscription={subscription}
                  isRevoking={revokingUuid === subscription.uuid}
                  onRevoke={revokeSubscription}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
              No push subscriptions are registered for this account.
            </div>
          )}
        </div>
      </section>

      <NearbyRecommendationsSettings />
    </div>
  );
}
