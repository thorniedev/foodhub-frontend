import { NextRequest, NextResponse } from "next/server";

import webPush from "web-push";

import {
  pushSubscriptions,
  type StoredPushSubscription,
} from "@/lib/push/subscriptions";

export const runtime = "nodejs";

interface PushRequest {
  title?: string;
  body?: string;
  url?: string;
  tag?: string;
}

function getPushErrorStatus(error: unknown): number | undefined {
  if (typeof error === "object" && error !== null && "statusCode" in error) {
    const value = (
      error as {
        statusCode?: unknown;
      }
    ).statusCode;

    if (typeof value === "number") {
      return value;
    }
  }

  return undefined;
}

function configureWebPush() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  const privateKey = process.env.VAPID_PRIVATE_KEY;

  const subject = process.env.VAPID_SUBJECT || "mailto:foodhub@example.com";

  if (!publicKey) {
    throw new Error("NEXT_PUBLIC_VAPID_PUBLIC_KEY is missing.");
  }

  if (!privateKey) {
    throw new Error("VAPID_PRIVATE_KEY is missing.");
  }

  webPush.setVapidDetails(subject, publicKey, privateKey);
}

async function sendToSubscription(
  subscription: StoredPushSubscription,
  payload: string,
) {
  try {
    await webPush.sendNotification(subscription, payload);

    return {
      success: true,
      endpoint: subscription.endpoint,
    };
  } catch (error) {
    const statusCode = getPushErrorStatus(error);

    /**
     * 404 / 410 means the subscription
     * is no longer valid.
     */
    if (statusCode === 404 || statusCode === 410) {
      pushSubscriptions.delete(subscription.endpoint);
    }

    console.error("[FoodHub Push] Failed to send:", {
      endpoint: subscription.endpoint,
      statusCode,
      error,
    });

    return {
      success: false,
      endpoint: subscription.endpoint,
      statusCode,
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    /**
     * TEMPORARY safety restriction.
     *
     * This endpoint is only a development
     * test sender.
     *
     * Later Spring Boot/admin authorization
     * should control push sending.
     */
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        {
          success: false,
          message: "Test push sending is disabled in production.",
        },
        {
          status: 403,
        },
      );
    }

    configureWebPush();

    const body = (await request.json()) as PushRequest;

    if (pushSubscriptions.size === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No browser is currently subscribed.",
        },
        {
          status: 400,
        },
      );
    }

    const payload = JSON.stringify({
      title: body.title || "FoodHub Notification 🍜",

      body: body.body || "You have a new FoodHub notification.",

      url: body.url || "/dashboard/notifications",

      tag: body.tag || `foodhub-${Date.now()}`,

      icon: "/icons/pwa-192x192.png",

      badge: "/icons/pwa-192x192.png",
    });

    const subscriptions = Array.from(pushSubscriptions.values());

    const results = await Promise.all(
      subscriptions.map((subscription) =>
        sendToSubscription(subscription, payload),
      ),
    );

    const successCount = results.filter((result) => result.success).length;

    const failedCount = results.length - successCount;

    console.log("[FoodHub Push] Send result:", {
      successCount,
      failedCount,
    });

    return NextResponse.json({
      success: true,
      message: "Push send completed.",
      successCount,
      failedCount,
      results,
    });
  } catch (error) {
    console.error("[FoodHub Push] Send error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to send push notification.",
      },
      {
        status: 500,
      },
    );
  }
}
