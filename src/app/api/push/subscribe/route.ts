import { NextRequest, NextResponse } from "next/server";

import {
  pushSubscriptions,
  type StoredPushSubscription,
} from "@/lib/push/subscriptions";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const subscription = (await request.json()) as StoredPushSubscription;

    if (!subscription.endpoint) {
      return NextResponse.json(
        {
          success: false,
          message: "Push subscription endpoint is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (!subscription.keys?.p256dh || !subscription.keys?.auth) {
      return NextResponse.json(
        {
          success: false,
          message: "Push subscription encryption keys are required.",
        },
        {
          status: 400,
        },
      );
    }

    pushSubscriptions.set(subscription.endpoint, subscription);

    console.log("[FoodHub Push] Subscription saved:", {
      endpoint: subscription.endpoint,
      totalSubscriptions: pushSubscriptions.size,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Push notification enabled.",
        totalSubscriptions: pushSubscriptions.size,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error("[FoodHub Push] Subscribe error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to save push subscription.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      endpoint?: string;
    };

    if (!body.endpoint) {
      return NextResponse.json(
        {
          success: false,
          message: "Push subscription endpoint is required.",
        },
        {
          status: 400,
        },
      );
    }

    pushSubscriptions.delete(body.endpoint);

    console.log("[FoodHub Push] Subscription removed:", {
      endpoint: body.endpoint,
      totalSubscriptions: pushSubscriptions.size,
    });

    return NextResponse.json({
      success: true,
      message: "Push notification disabled.",
      totalSubscriptions: pushSubscriptions.size,
    });
  } catch (error) {
    console.error("[FoodHub Push] Unsubscribe error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to remove push subscription.",
      },
      {
        status: 500,
      },
    );
  }
}
