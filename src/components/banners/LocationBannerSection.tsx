import React from "react";
import LocationBannerRow from "./LocationBannerRow";
import { publicBannerApi, BannerApiError } from "@/lib/banners/public-banner-api";
import type { PublicBannerResponse } from "@/types/banner";

async function loadLocationBanners(): Promise<
  { ok: true; banners: PublicBannerResponse[] } | { ok: false }
> {
  try {
    return { ok: true, banners: await publicBannerApi.getLocationBanners() };
  } catch (error) {
    if (error instanceof BannerApiError) {
      console.error("[LocationBannerSection]", error.message, error.status);
    } else {
      console.error("[LocationBannerSection] unexpected error", error);
    }
    return { ok: false };
  }
}

/**
 * Server Component: published LOCATION banners rendered via LocationBannerRow.
 */
export default async function LocationBannerSection() {
  const result = await loadLocationBanners();

  if (!result.ok || result.banners.length === 0) {
    return null;
  }

  return <LocationBannerRow banners={result.banners} />;
}
