import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const backendApiUrl = (
  process.env.BACKEND_API_URL ?? "http://localhost:7070/api/v1"
).replace(/\/+$/, "");

function getAccessToken(request: NextRequest): string | null {
  return request.cookies.get("foodhub_access_token")?.value ?? null;
}

async function forwardBackendResponse(
  backendResponse: Response,
): Promise<Response> {
  const responseBody = await backendResponse.arrayBuffer();

  const headers = new Headers();

  const contentType = backendResponse.headers.get("content-type");

  if (contentType) {
    headers.set("Content-Type", contentType);
  }

  return new Response(responseBody.byteLength > 0 ? responseBody : null, {
    status: backendResponse.status,
    headers,
  });
}

export async function GET(request: NextRequest): Promise<Response> {
  const accessToken = getAccessToken(request);

  if (!accessToken) {
    return NextResponse.json(
      {
        message: "Not authenticated.",
      },
      {
        status: 401,
      },
    );
  }

  try {
    const backendResponse = await fetch(`${backendApiUrl}/users/me`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    return forwardBackendResponse(backendResponse);
  } catch (error) {
    console.error("[GET CURRENT USER ERROR]", error);

    return NextResponse.json(
      {
        message: "Could not connect to FoodHub backend.",
      },
      {
        status: 502,
      },
    );
  }
}

export async function PATCH(request: NextRequest): Promise<Response> {
  const accessToken = getAccessToken(request);

  if (!accessToken) {
    return NextResponse.json(
      {
        message: "Not authenticated.",
      },
      {
        status: 401,
      },
    );
  }

  try {
    const requestBody = await request.text();

    const backendResponse = await fetch(`${backendApiUrl}/users/me`, {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: requestBody,
      cache: "no-store",
    });

    console.log("[UPDATE CURRENT USER]", {
      status: backendResponse.status,
      backendUrl: `${backendApiUrl}/users/me`,
    });

    return forwardBackendResponse(backendResponse);
  } catch (error) {
    console.error("[UPDATE CURRENT USER ERROR]", error);

    return NextResponse.json(
      {
        message: "Could not connect to FoodHub backend.",
      },
      {
        status: 502,
      },
    );
  }
}
