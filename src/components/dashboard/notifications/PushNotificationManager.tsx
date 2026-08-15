"use client";

import { useCallback, useEffect, useState } from "react";

type NotificationStatus = "unsupported" | "loading" | "disabled" | "enabled";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);

  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);

  return Uint8Array.from(
    [...rawData].map((character) => character.charCodeAt(0)),
  );
}

export default function PushNotificationManager() {
  const [status, setStatus] = useState<NotificationStatus>("loading");

  const [isWorking, setIsWorking] = useState(false);

  const [message, setMessage] = useState<string | null>(null);

  const checkSubscription = useCallback(async () => {
    if (
      !("serviceWorker" in navigator) ||
      !("PushManager" in window) ||
      !("Notification" in window)
    ) {
      setStatus("unsupported");
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;

      const subscription = await registration.pushManager.getSubscription();

      if (subscription && Notification.permission === "granted") {
        setStatus("enabled");
        return;
      }

      setStatus("disabled");
    } catch (error) {
      console.error("[FoodHub Push] Check error:", error);

      setStatus("disabled");
    }
  }, []);

  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  const enableNotifications = async () => {
    setMessage(null);
    setIsWorking(true);

    try {
      if (
        !("serviceWorker" in navigator) ||
        !("PushManager" in window) ||
        !("Notification" in window)
      ) {
        setStatus("unsupported");
        return;
      }

      /**
       * Permission is intentionally requested
       * from this button click.
       */
      const permission = await Notification.requestPermission();

      if (permission !== "granted") {
        setMessage("Notification permission was not granted.");

        setStatus("disabled");
        return;
      }

      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

      if (!vapidPublicKey) {
        throw new Error("NEXT_PUBLIC_VAPID_PUBLIC_KEY is missing.");
      }

      const registration = await navigator.serviceWorker.ready;

      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,

          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        });
      }

      const response = await fetch("/api/push/subscribe", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(subscription.toJSON()),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save push subscription.");
      }

      setStatus("enabled");

      setMessage("FoodHub push notifications are enabled.");

      console.log("[FoodHub Push] Subscription:", subscription.toJSON());
    } catch (error) {
      console.error("[FoodHub Push] Enable error:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to enable notifications.",
      );
    } finally {
      setIsWorking(false);
    }
  };

  const disableNotifications = async () => {
    setMessage(null);
    setIsWorking(true);

    try {
      const registration = await navigator.serviceWorker.ready;

      const subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        setStatus("disabled");
        return;
      }

      await fetch("/api/push/subscribe", {
        method: "DELETE",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          endpoint: subscription.endpoint,
        }),
      });

      await subscription.unsubscribe();

      setStatus("disabled");

      setMessage("FoodHub push notifications are disabled.");
    } catch (error) {
      console.error("[FoodHub Push] Disable error:", error);

      setMessage("Failed to disable notifications.");
    } finally {
      setIsWorking(false);
    }
  };

  const sendTestNotification = async () => {
    setMessage(null);
    setIsWorking(true);

    try {
      const response = await fetch("/api/push/send", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          title: "FoodHub Recommendation 🍜",

          body: "We found food that matches your preferences.",

          url: "/food",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send notification.");
      }

      setMessage(`Push sent successfully to ${data.successCount} device(s).`);
    } catch (error) {
      console.error("[FoodHub Push] Test error:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to send test notification.",
      );
    } finally {
      setIsWorking(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <p className="text-lg text-gray-600">
          Checking notification support...
        </p>
      </div>
    );
  }

  if (status === "unsupported") {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <p className="text-xl font-semibold text-gray-900">
          Push Notifications
        </p>

        <p className="mt-2 text-lg text-gray-600">
          This browser does not support FoodHub push notifications.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
      <div className="flex flex-col gap-2">
        <p className="text-2xl font-semibold text-primary-800">
          Push Notifications
        </p>

        <p className="text-lg text-gray-600">
          Receive FoodHub recommendations, group updates, and important alerts.
        </p>
      </div>

      <div className="mt-5">
        <p className="text-lg text-gray-700">
          Status:{" "}
          <span className="font-semibold">
            {status === "enabled" ? "Enabled" : "Disabled"}
          </span>
        </p>
      </div>

      {message && (
        <div className="mt-4 rounded-xl bg-gray-50 px-4 py-3">
          <p className="text-lg text-gray-700">{message}</p>
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        {status === "disabled" && (
          <button
            type="button"
            onClick={enableNotifications}
            disabled={isWorking}
            className="rounded-full bg-primary-600 px-6 py-3 text-lg font-medium text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isWorking ? "Enabling..." : "Enable Notifications"}
          </button>
        )}

        {status === "enabled" && (
          <>
            <button
              type="button"
              onClick={sendTestNotification}
              disabled={isWorking}
              className="rounded-full bg-primary-600 px-6 py-3 text-lg font-medium text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isWorking ? "Sending..." : "Send Test Notification"}
            </button>

            <button
              type="button"
              onClick={disableNotifications}
              disabled={isWorking}
              className="rounded-full border border-gray-300 bg-white px-6 py-3 text-lg font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Disable Notifications
            </button>
          </>
        )}
      </div>
    </div>
  );
}
