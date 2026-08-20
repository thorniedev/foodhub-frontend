import Image from "next/image";
import { publicBannerApi, BannerApiError } from "@/lib/banners/public-banner-api";
import { toFrontendApiAssetUrl } from "@/lib/catalog-media";
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
 * Server Component: published POPULAR banners rendered as a static
 * promotional grid. "Popular" here reflects the banner category an admin
 * assigned, not a computed popularity ranking — the backend has no ranking
 * signal for this category.
 */
export default async function PopularBannerSection() {
  const result = await loadPopularBanners();

  if (!result.ok) {
    return (
      <section className="container mx-auto max-w-7xl py-8">
        <p className="rounded-2xl bg-neutral-100 p-6 text-center text-sm text-gray-500 dark:bg-neutral-900 dark:text-gray-400">
          មិនអាចផ្ទុកបែនណឺពេញនិយមបានទេ សូមព្យាយាមម្តងទៀត
        </p>
      </section>
    );
  }

  if (result.banners.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="popular-banners-heading"
      className="container mx-auto max-w-7xl py-8"
    >
      <h2
        id="popular-banners-heading"
        className="mb-6 text-2xl font-semibold text-primary-800 md:text-4xl dark:text-primary-dark"
      >
        ពេញនិយម
      </h2>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {result.banners.map((banner, index) => (
          <figure
            key={banner.id}
            className="relative aspect-4/3 overflow-hidden rounded-2xl bg-neutral-100 shadow-sm dark:bg-neutral-900"
          >
            <Image
              src={toFrontendApiAssetUrl(banner.image)}
              alt={banner.title}
              fill
              sizes="(min-width: 768px) 25vw, 50vw"
              priority={index === 0}
              className="object-cover"
            />
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3">
              <p className="line-clamp-1 text-sm font-semibold text-white md:text-base">
                {banner.title}
              </p>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
