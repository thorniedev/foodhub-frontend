import Image from "next/image";
import { publicBannerApi, BannerApiError } from "@/lib/banners/public-banner-api";
import { toFrontendApiAssetUrl } from "@/lib/catalog-media";
import type { PublicBannerResponse } from "@/types/banner";

async function loadSeasonBanners(): Promise<
  { ok: true; banners: PublicBannerResponse[] } | { ok: false }
> {
  try {
    return { ok: true, banners: await publicBannerApi.getSeasonBanners() };
  } catch (error) {
    if (error instanceof BannerApiError) {
      console.error("[SeasonalBannerSection]", error.message, error.status);
    } else {
      console.error("[SeasonalBannerSection] unexpected error", error);
    }
    return { ok: false };
  }
}

/** Server Component: published SEASON banners as a promotional strip. */
export default async function SeasonalBannerSection() {
  const result = await loadSeasonBanners();

  if (!result.ok) {
    return (
      <section className="container mx-auto max-w-7xl py-8">
        <p className="rounded-2xl bg-neutral-100 p-6 text-center text-sm text-gray-500 dark:bg-neutral-900 dark:text-gray-400">
          មិនអាចផ្ទុកបែនណឺរដូវកាលបានទេ សូមព្យាយាមម្តងទៀត
        </p>
      </section>
    );
  }

  if (result.banners.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="seasonal-banners-heading"
      className="container mx-auto max-w-7xl py-8"
    >
      <h2
        id="seasonal-banners-heading"
        className="mb-6 text-2xl font-semibold text-primary-800 md:text-4xl dark:text-primary-dark"
      >
        រដូវកាល
      </h2>

      <div className="grid gap-4 md:grid-cols-2">
        {result.banners.map((banner, index) => (
          <figure
            key={banner.id}
            className="relative aspect-16/9 overflow-hidden rounded-2xl bg-neutral-100 shadow-sm dark:bg-neutral-900"
          >
            <Image
              src={toFrontendApiAssetUrl(banner.image)}
              alt={banner.title}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              priority={index === 0}
              className="object-cover"
            />
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4">
              <p className="text-lg font-semibold text-white">{banner.title}</p>
              {banner.description && (
                <p className="mt-1 line-clamp-2 text-sm text-white/90">
                  {banner.description}
                </p>
              )}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
