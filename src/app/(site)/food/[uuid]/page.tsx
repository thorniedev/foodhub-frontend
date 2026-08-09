import type { Metadata } from "next";

import FoodDetailPage from "@/components/food-detail/FoodDetailPage";

import type {
  CatalogMenuItemDetail,
  CatalogMenuItemDetailResponse,
} from "@/types/catalog-menu-item-detail";

type PageProps = {
  params: Promise<{
    uuid: string;
  }>;
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:7070/api/v1";

/* =========================================================
   GET DETAIL FOR METADATA
========================================================= */

async function getMenuItemDetail(
  uuid: string,
): Promise<CatalogMenuItemDetail | null> {
  if (!uuid) {
    return null;
  }

  try {
    const response = await fetch(
      `${apiBaseUrl}/catalog/menu-items/${encodeURIComponent(uuid)}/detail`,
      {
        method: "GET",

        /**
         * Metadata should stay relatively fresh.
         *
         * Change this to:
         *
         * cache: "no-store"
         *
         * if you always want newest backend data.
         */
        next: {
          revalidate: 300,
        },
      },
    );

    if (!response.ok) {
      console.error("[FOOD METADATA] Request failed:", {
        uuid,
        status: response.status,
        statusText: response.statusText,
      });

      return null;
    }

    const result = (await response.json()) as CatalogMenuItemDetailResponse;

    return result.payload ?? null;
  } catch (error) {
    console.error("[FOOD METADATA] Failed:", error);

    return null;
  }
}

/* =========================================================
   MEDIA URL
========================================================= */

function getPublicMediaUrl(
  value: string | null | undefined,
): string | undefined {
  if (!value) {
    return undefined;
  }

  // Already absolute
  if (value.startsWith("https://") || value.startsWith("http://")) {
    return value;
  }

  /**
   * Backend gives:
   *
   * /api/v1/media/{uuid}
   *
   * Frontend public proxy:
   *
   * /api/media/{uuid}
   */
  if (value.startsWith("/api/v1/")) {
    return `${siteUrl}/api/${value.slice("/api/v1/".length)}`;
  }

  if (value.startsWith("/")) {
    return `${siteUrl}${value}`;
  }

  return `${siteUrl}/${value}`;
}

/* =========================================================
   METADATA
========================================================= */

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { uuid } = await params;

  const food = await getMenuItemDetail(uuid);

  if (!food) {
    return {
      title: "Food not found | FoodHub",

      description: "The requested food item could not be found on FoodHub.",

      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const foodName =
    food.localName?.trim() || food.name || food.food?.canonicalName || "Food";

  const restaurantName =
    food.store?.localName?.trim() || food.store?.name || "FoodHub";

  const description =
    food.localDescription?.trim() ||
    food.description?.trim() ||
    `${foodName} from ${restaurantName}. Discover delicious food on FoodHub.`;

  const imageUrl =
    getPublicMediaUrl(food.thumbnail) || getPublicMediaUrl(food.gallery?.[0]);

  const pageUrl = `${siteUrl}/food/${food.uuid}`;

  const categoryName = food.food?.category?.name;

  const cuisineName = food.food?.cuisine?.name;

  const keywords = [
    food.name,
    food.localName,
    food.food?.canonicalName,
    restaurantName,
    categoryName,
    cuisineName,
    "FoodHub",
    "food",
  ].filter(
    (value): value is string =>
      typeof value === "string" && value.trim().length > 0,
  );

  return {
    title: `${foodName} | ${restaurantName} | FoodHub`,

    description,

    alternates: {
      canonical: pageUrl,
    },

    keywords,

    openGraph: {
      type: "website",

      url: pageUrl,

      title: `${foodName} | FoodHub`,

      description,

      siteName: "FoodHub",

      ...(imageUrl
        ? {
            images: [
              {
                url: imageUrl,

                alt: `${foodName} from ${restaurantName}`,
              },
            ],
          }
        : {}),
    },

    twitter: {
      card: "summary_large_image",

      title: `${foodName} | FoodHub`,

      description,

      ...(imageUrl
        ? {
            images: [imageUrl],
          }
        : {}),
    },
  };
}

/* =========================================================
   PAGE
========================================================= */

export default async function Page({ params }: PageProps) {
  const { uuid } = await params;

  return <FoodDetailPage uuid={uuid} />;
}
