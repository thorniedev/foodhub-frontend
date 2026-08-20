import { Suspense } from "react";

import HomePageClient from "@/components/home/HomePageClient";
import HeroBannerSection from "@/components/banners/HeroBannerSection";
import PopularBannerSection from "@/components/banners/PopularBannerSection";
import LocationBannerSection from "@/components/banners/LocationBannerSection";
import SeasonalBannerSection from "@/components/banners/SeasonalBannerSection";
import {
  BannerGridSkeleton,
  HeroBannerSkeleton,
} from "@/components/banners/BannerSectionSkeleton";

/**
 * Server Component: composes the real, backend-driven Banner sections
 * (MAIN/POPULAR/LOCATION/SEASON — each fetched and error-isolated
 * independently, see src/components/banners/*) around the existing curated
 * homepage content. Each Banner section streams in behind its own Suspense
 * boundary so a slow/failed category never blocks the rest of the page.
 */
export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <>
      <Suspense fallback={<HeroBannerSkeleton />}>
        <HeroBannerSection />
      </Suspense>

      <HomePageClient />

      <Suspense fallback={<BannerGridSkeleton count={4} />}>
        <PopularBannerSection />
      </Suspense>

      <Suspense fallback={<BannerGridSkeleton count={3} />}>
        <LocationBannerSection />
      </Suspense>

      <Suspense fallback={<BannerGridSkeleton count={2} />}>
        <SeasonalBannerSection />
      </Suspense>
    </>
  );
}
