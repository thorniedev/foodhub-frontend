import React from "react";
import HeroBannerCarousel from "./HeroBannerCarousel";
import { publicBannerApi, BannerApiError } from "@/lib/banners/public-banner-api";
import type { PublicBannerResponse } from "@/types/banner";

async function loadMainBanners(): Promise<
  { ok: true; banners: PublicBannerResponse[] } | { ok: false }
> {
  try {
    return { ok: true, banners: await publicBannerApi.getMainBanners() };
  } catch (error) {
    if (error instanceof BannerApiError) {
      console.error("[HeroBannerSection]", error.message, error.status);
    } else {
      console.error("[HeroBannerSection] unexpected error", error);
    }
    return { ok: false };
  }
}

/**
 * Server Component: fetches published MAIN banners and renders the
 * interactive HeroBannerCarousel.
 */
export default async function HeroBannerSection() {
  const result = await loadMainBanners();

  if (!result.ok || result.banners.length === 0) {
    return null;
  }

  return <HeroBannerCarousel banners={result.banners} />;
}
