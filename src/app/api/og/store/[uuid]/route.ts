import { NextRequest, NextResponse } from "next/server";
import { BACKEND_API_URL, SITE_URL } from "@/lib/seo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ uuid: string }> },
) {
  const { uuid } = await context.params;

  if (!uuid) {
    return new Response("Missing UUID", { status: 400 });
  }

  try {
    const storeRes = await fetch(
      `${BACKEND_API_URL}/stores/${encodeURIComponent(uuid)}`,
      {
        next: { revalidate: 86400 },
      },
    );

    if (!storeRes.ok) {
      return NextResponse.redirect(`${SITE_URL}/og-image.jpeg`);
    }

    const storeJson = await storeRes.json();
    const store = storeJson?.payload ?? storeJson?.data ?? storeJson;
    const mediaUuid = store?.coverMediaUuid || store?.logoMediaUuid;

    if (!mediaUuid) {
      return NextResponse.redirect(`${SITE_URL}/og-image.jpeg`);
    }

    const imageRes = await fetch(`${BACKEND_API_URL}/media/${mediaUuid}/file`, {
      redirect: "follow",
      next: { revalidate: 86400 },
    });

    if (!imageRes.ok) {
      return NextResponse.redirect(`${SITE_URL}/og-image.jpeg`);
    }

    const contentType = imageRes.headers.get("content-type") || "image/jpeg";
    const imageBuffer = await imageRes.arrayBuffer();

    return new Response(imageBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(imageBuffer.byteLength),
        "Cache-Control":
          "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  } catch (error) {
    console.error("[OG STORE IMAGE] Failed to fetch image:", error);
    return NextResponse.redirect(`${SITE_URL}/og-image.jpeg`);
  }
}
