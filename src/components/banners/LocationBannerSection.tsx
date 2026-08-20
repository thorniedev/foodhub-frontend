import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { publicBannerApi, BannerApiError } from "@/lib/banners/public-banner-api";
import { toFrontendApiAssetUrl } from "@/lib/catalog-media";
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
 * Server Component: published LOCATION banners as a horizontally scrolling
 * row of cards. Cards link to the existing /food route — the app has no
 * location query-param filter contract today (verified: /food/page.tsx
 * reads no searchParams), so a fabricated `?location=` link would silently
 * do nothing on that page.
 */
export default async function LocationBannerSection() {
  const result = await loadLocationBanners();

  if (!result.ok) {
    return (
      <section className="container mx-auto max-w-7xl py-8">
        <p className="rounded-2xl bg-neutral-100 p-6 text-center text-sm text-gray-500 dark:bg-neutral-900 dark:text-gray-400">
          មិនអាចផ្ទុកបែនណឺទីតាំងបានទេ សូមព្យាយាមម្តងទៀត
        </p>
      </section>
    );
  }

  if (result.banners.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="location-banners-heading"
      className="container mx-auto max-w-7xl py-8"
    >
      <h2
        id="location-banners-heading"
        className="mb-6 text-2xl font-semibold text-primary-800 md:text-4xl dark:text-primary-dark"
      >
        ទីតាំង
      </h2>

      <ul className="flex gap-4 overflow-x-auto pb-2">
        {result.banners.map((banner) => (
          <li key={banner.id} className="shrink-0">
            <Link
              href="/food"
              className="
                group
                relative
                block h-48 w-64
                overflow-hidden rounded-2xl
                bg-neutral-100
                shadow-sm
                focus-visible:outline-2
                focus-visible:outline-offset-2
                focus-visible:outline-primary-700
                dark:bg-neutral-900
              "
            >
              <Image
                src={toFrontendApiAssetUrl(banner.image)}
                alt={banner.title}
                fill
                sizes="256px"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                {banner.location && (
                  <span className="mb-1 inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
                    <MapPin size={12} />
                    {banner.location}
                  </span>
                )}
                <p className="line-clamp-1 text-base font-semibold text-white">
                  {banner.title}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
