// src/app/api/auth/register/route.ts

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://food.chanthorndev.site//api/v1";

function parseResponseBody(value: string): unknown {
  if (!value) {
    return {};
  }

  try {
    return JSON.parse(value);
  } catch {
    return {
      message: value,
    };
  }
}

export async function POST(request: NextRequest) {
  const endpoint = `${API_BASE_URL.replace(/\/$/, "")}/auth/register`;

  try {
    const requestBody = await request.json();

    console.log("[REGISTER PROXY REQUEST]", {
      endpoint,
      API_BASE_URL,
    });

    const backendResponse = await fetch(endpoint, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });

    const responseText = await backendResponse.text();
    const responseBody = parseResponseBody(responseText);

    console.log("[REGISTER PROXY RESPONSE]", {
      endpoint,
      status: backendResponse.status,
      ok: backendResponse.ok,
      response: responseBody,
    });

    return NextResponse.json(responseBody, {
      status: backendResponse.status,
    });
  } catch (error) {
    const fetchError = error as Error & {
      cause?: {
        code?: string;
        address?: string;
        port?: number;
        message?: string;
      };
    };

    console.error("[REGISTER PROXY CONNECTION ERROR]", {
      endpoint,
      name: fetchError.name,
      message: fetchError.message,
      cause: fetchError.cause,
    });

    return NextResponse.json(
      {
        message: "Could not connect to the authentication server.",
        error:
          process.env.NODE_ENV === "development"
            ? fetchError.message
            : undefined,
        cause:
          process.env.NODE_ENV === "development" ? fetchError.cause : undefined,
      },
      {
        status: 502,
      },
    );
  }
}
