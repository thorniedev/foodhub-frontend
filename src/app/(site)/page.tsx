import { Suspense } from "react";

import HomePageClient from "@/components/home/HomePageClient";
import HeroBannerSection from "@/components/banners/HeroBannerSection";
import { HeroBannerSkeleton } from "@/components/banners/BannerSectionSkeleton";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <>
      <Suspense fallback={<HeroBannerSkeleton />}>
        <HeroBannerSection />
      </Suspense>

      <HomePageClient />
    </>
  );
}
