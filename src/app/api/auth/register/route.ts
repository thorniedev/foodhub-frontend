import { NextResponse } from "next/server";

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function POST(request: Request) {
  if (!BACKEND_API_URL) {
    return NextResponse.json(
      {
        message: "BACKEND_API_URL is not configured on the Next.js server.",
      },
      {
        status: 500,
      },
    );
  }

  try {
    const requestBody: unknown = await request.json();

    const backendResponse = await fetch(`${BACKEND_API_URL}/auth/register`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
      cache: "no-store",
    });

    const contentType = backendResponse.headers.get("content-type") ?? "";

    if (contentType.includes("application/json")) {
      const responseBody: unknown = await backendResponse.json();

      return NextResponse.json(responseBody, {
        status: backendResponse.status,
      });
    }

    const responseText = await backendResponse.text();

    return new NextResponse(responseText || null, {
      status: backendResponse.status,
      headers: {
        "Content-Type": contentType || "text/plain; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("[REGISTER ROUTE] Backend request failed:", error);

    return NextResponse.json(
      {
        message: "Could not connect to the authentication server.",
      },
      {
        status: 502,
      },
    );
  }
}
