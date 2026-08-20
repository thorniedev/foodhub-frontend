import BannerCarousel, {
  type HeroBannerSlide,
} from "@/components/home/features/BannerCarousel";
import { publicBannerApi, BannerApiError } from "@/lib/banners/public-banner-api";
import { toFrontendApiAssetUrl } from "@/lib/catalog-media";
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
 * interactive hero carousel (a small Client Component) with the resolved
 * data. An empty published list hides the section; a request/validation
 * failure renders a safe inline fallback instead of crashing the home page
 * or falling back to static banner data.
 */
export default async function HeroBannerSection() {
  const result = await loadMainBanners();

  if (!result.ok) {
    return (
      <section className="container mx-auto max-w-7xl pt-8 lg:pt-12.5">
        <div className="flex h-[220px] items-center justify-center rounded-2xl bg-neutral-100 text-sm text-gray-500 sm:h-[300px] md:h-[400px] md:rounded-3xl dark:bg-neutral-900 dark:text-gray-400">
          មិនអាចផ្ទុកផ្ទាំងផ្សព្វផ្សាយបានទេ សូមព្យាយាមម្តងទៀត
        </div>
      </section>
    );
  }

  if (result.banners.length === 0) {
    return null;
  }

  const slides: HeroBannerSlide[] = result.banners.map((banner) => ({
    id: banner.id,
    image: toFrontendApiAssetUrl(banner.image),
    alt: banner.title,
    title: banner.title,
    description: banner.description,
  }));

  return <BannerCarousel banners={slides} />;
}
