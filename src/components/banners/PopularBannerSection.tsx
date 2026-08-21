import React from "react";
import PopularBannerGrid from "./PopularBannerGrid";
import { publicBannerApi, BannerApiError } from "@/lib/banners/public-banner-api";
import type { PublicBannerResponse } from "@/types/banner";

async function loadPopularBanners(): Promise<
  { ok: true; banners: PublicBannerResponse[] } | { ok: false }
> {
  try {
    return { ok: true, banners: await publicBannerApi.getPopularBanners() };
  } catch (error) {
    if (error instanceof BannerApiError) {
      console.error("[PopularBannerSection]", error.message, error.status);
    } else {
      console.error("[PopularBannerSection] unexpected error", error);
    }
    return { ok: false };
  }
}

/**
 * Server Component: published POPULAR banners rendered via PopularBannerGrid.
 */
export default async function PopularBannerSection() {
  const result = await loadPopularBanners();

  if (!result.ok || result.banners.length === 0) {
    return null;
  }

  return <PopularBannerGrid banners={result.banners} />;
}
