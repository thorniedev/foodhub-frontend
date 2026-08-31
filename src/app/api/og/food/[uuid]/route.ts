import { NextRequest, NextResponse } from "next/server";
import { BACKEND_API_URL, SITE_URL } from "@/lib/seo";
import sharp from "sharp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;

/**
 * Resolve the actual image URL for a menu-item UUID.
 * Strategy:
 *  1. Fetch menu-item detail to get the thumbnail URL (which may point to a
 *     different food entity UUID via /catalog/foods/{food-uuid}/images/1).
 *  2. Fall back to /catalog/menu-items/{uuid}/images/1 if detail fetch fails.
 */
async function resolveMenuItemImageUrl(uuid: string): Promise<string> {
  try {
    const detailRes = await fetch(
      `${BACKEND_API_URL}/catalog/menu-items/${encodeURIComponent(uuid)}/detail`,
      { next: { revalidate: 3600 } },
    );

    if (detailRes.ok) {
      const json = await detailRes.json();
      const item = json?.payload ?? json?.data ?? json;
      const thumbnail: string | null | undefined =
        item?.thumbnail ?? (Array.isArray(item?.gallery) ? item.gallery[0] : null);

      if (thumbnail) {
        // Thumbnail may be a relative API path like /api/v1/catalog/foods/{food-uuid}/images/1
        if (thumbnail.startsWith("http://") || thumbnail.startsWith("https://")) {
          return thumbnail;
        }
        // Strip leading /api/v1 if present, then prepend BACKEND_API_URL
        const path = thumbnail.replace(/^\/api\/v1/, "");
        return `${BACKEND_API_URL}${path}`;
      }
    }
  } catch {
    // Fall through to default
  }

  // Final fallback: direct image endpoint
  return `${BACKEND_API_URL}/catalog/menu-items/${encodeURIComponent(uuid)}/images/1`;
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ uuid: string }> },
) {
  const { uuid } = await context.params;

  if (!uuid) {
    return new Response("Missing UUID", { status: 400 });
  }

  try {
    const imageUrl = await resolveMenuItemImageUrl(uuid);

    const res = await fetch(imageUrl, {
      redirect: "follow",
      next: { revalidate: 86400 },
    });

    if (!res.ok) {
      return NextResponse.redirect(`${SITE_URL}/og-image.jpeg`);
    }

    const inputBuffer = Buffer.from(await res.arrayBuffer());

    // Resize and crop to exactly 1200x630 for Telegram/Facebook/Twitter
    const resized = await sharp(inputBuffer)
      .resize(OG_WIDTH, OG_HEIGHT, {
        fit: "cover",
        position: "centre",
      })
      .jpeg({ quality: 90 })
      .toBuffer();

    return new Response(new Uint8Array(resized), {
      status: 200,
      headers: {
        "Content-Type": "image/jpeg",
        "Content-Length": String(resized.byteLength),
        "Cache-Control":
          "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  } catch (error) {
    console.error("[OG FOOD IMAGE] Failed to process image:", error);
    return NextResponse.redirect(`${SITE_URL}/og-image.jpeg`);
  }
}
