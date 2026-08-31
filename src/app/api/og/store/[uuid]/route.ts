import { NextRequest, NextResponse } from "next/server";
import { BACKEND_API_URL, SITE_URL } from "@/lib/seo";
import sharp from "sharp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;

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

    const inputBuffer = Buffer.from(await imageRes.arrayBuffer());

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
    console.error("[OG STORE IMAGE] Failed to process image:", error);
    return NextResponse.redirect(`${SITE_URL}/og-image.jpeg`);
  }
}
