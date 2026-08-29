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
    const imageUrl = `${BACKEND_API_URL}/catalog/menu-items/${encodeURIComponent(uuid)}/images/1`;

    const res = await fetch(imageUrl, {
      redirect: "follow",
      next: { revalidate: 86400 },
    });

    if (!res.ok) {
      return NextResponse.redirect(`${SITE_URL}/og-image.jpeg`);
    }

    const contentType = res.headers.get("content-type") || "image/jpeg";
    const imageBuffer = await res.arrayBuffer();

    return new Response(imageBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control":
          "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  } catch (error) {
    console.error("[OG FOOD IMAGE] Failed to fetch image:", error);
    return NextResponse.redirect(`${SITE_URL}/og-image.jpeg`);
  }
}
