/**
 * FoodHub — Centralized Dynamic SEO & Structured Data Library
 *
 * Generates dynamic Next.js Metadata and Schema.org JSON-LD structured data
 * directly from real backend API data for foods, stores, menu items, and search.
 */

import type { Metadata } from "next";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.trim()
    ? process.env.NEXT_PUBLIC_SITE_URL.startsWith("http")
      ? process.env.NEXT_PUBLIC_SITE_URL
      : `https://${process.env.NEXT_PUBLIC_SITE_URL}`
    : "https://www.mhoubahar.store";

export const SITE_NAME = "ម្ហូបអាហារ - FoodHub";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpeg`;

function getBackendApiV1Url(): string {
  const raw = (process.env.BACKEND_API_URL || "https://api.mhoubahar.store")
    .trim()
    .replace(/\/+$/, "");
  if (raw.endsWith("/api/v1")) return raw;
  if (raw.endsWith("/api")) return `${raw}/v1`;
  return `${raw}/api/v1`;
}

export const BACKEND_API_URL = getBackendApiV1Url();

/* ================================================================
   MEDIA URL RESOLVER (Absolute URLs for Open Graph & JSON-LD)
================================================================ */

export function toAbsoluteMediaUrl(
  value: string | null | undefined,
  fallback = DEFAULT_OG_IMAGE,
): string {
  const source = value?.trim();
  if (!source) return fallback;

  if (source.startsWith("http://") || source.startsWith("https://")) {
    return source;
  }

  const UUID_REGEX =
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

  if (UUID_REGEX.test(source)) {
    return `${BACKEND_API_URL}/media/${source}/file`;
  }

  if (source.startsWith("/api/v1/")) {
    return `https://api.mhoubahar.store${source}`;
  }

  if (source.startsWith("/api/")) {
    return `https://api.mhoubahar.store/api/v1${source.slice("/api".length)}`;
  }

  if (source.startsWith("/")) {
    return `${SITE_URL}${source}`;
  }

  return fallback;
}

/* ================================================================
   SERVER-SIDE API DATA FETCHERS (with caching & revalidation)
================================================================ */

export interface FoodSeoData {
  uuid: string;
  name: string;
  localName?: string | null;
  description?: string | null;
  localDescription?: string | null;
  thumbnail?: string | null;
  gallery?: string[];
  price?: number;
  currencyCode?: string;
  preparationTimeMinutes?: number;
  isFeatured?: boolean;
  store?: {
    uuid: string;
    name: string;
    localName?: string | null;
    city?: string | null;
    district?: string | null;
    addressLine?: string | null;
    averageRating?: number;
    logoUrl?: string | null;
  };
  food?: {
    canonicalName?: string;
    category?: { name: string; localName?: string };
    cuisine?: { name: string; localName?: string };
    ingredients?: string[];
  };
}

export interface StoreSeoData {
  uuid: string;
  storeName: string;
  description?: string | null;
  city?: string | null;
  province?: string | null;
  district?: string | null;
  addressLine?: string | null;
  logoMediaUuid?: string | null;
  coverMediaUuid?: string | null;
  averageRating?: number;
  totalReviews?: number;
  isOpenNow?: boolean;
}

/**
 * Fetch food item detail directly from backend API for SSR metadata.
 */
export async function fetchFoodForSeo(uuid: string): Promise<FoodSeoData | null> {
  if (!uuid) return null;

  try {
    const res = await fetch(
      `${BACKEND_API_URL}/catalog/menu-items/${encodeURIComponent(uuid)}/detail`,
      {
        next: { revalidate: 3600 }, // 1 hour cache
      },
    );

    if (!res.ok) return null;

    const json = await res.json();
    return (json?.payload ?? json?.data ?? json) as FoodSeoData;
  } catch (error) {
    console.error("[SEO] Failed to fetch food item:", error);
    return null;
  }
}

/**
 * Fetch store detail directly from backend API for SSR metadata.
 */
export async function fetchStoreForSeo(uuid: string): Promise<StoreSeoData | null> {
  if (!uuid) return null;

  try {
    const res = await fetch(
      `${BACKEND_API_URL}/stores/${encodeURIComponent(uuid)}`,
      {
        next: { revalidate: 3600 },
      },
    );

    if (!res.ok) return null;

    const json = await res.json();
    return (json?.payload ?? json?.data ?? json) as StoreSeoData;
  } catch (error) {
    console.error("[SEO] Failed to fetch store:", error);
    return null;
  }
}

/* ================================================================
   DYNAMIC METADATA BUILDERS
================================================================ */

export function generateFoodMetadata(food: FoodSeoData, uuid: string): Metadata {
  const displayName =
    food.localName?.trim() || food.name?.trim() || food.food?.canonicalName || "មុខម្ហូប";
  const storeName =
    food.store?.localName?.trim() || food.store?.name?.trim() || "";
  const priceFormatted = food.price !== undefined
    ? `$${food.price.toFixed(2)}`
    : "";

  const title = storeName
    ? `${displayName} - ${storeName} | ${priceFormatted}`
    : `${displayName} ${priceFormatted ? `- ${priceFormatted}` : ""}`;

  const description =
    food.localDescription?.trim() ||
    food.description?.trim() ||
    `ស្វែងរក ${displayName} ឆ្ងាញ់ៗ ${storeName ? `ពី ${storeName}` : "នៅ FoodHub Cambodia"}. តម្លៃ ${priceFormatted}`;

  const imageUrl = `/api/og/food/${uuid}`;
  const canonical = `/menu/${uuid}`;

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      type: "website",
      url: canonical,
      title: `${displayName} | FoodHub`,
      description,
      siteName: SITE_NAME,
      images: [
        {
          url: imageUrl,
          width: 736,
          height: 736,
          alt: `${displayName} - FoodHub`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${displayName} | FoodHub`,
      description,
      images: [imageUrl],
    },
    keywords: [
      displayName,
      food.name,
      storeName,
      food.food?.category?.localName || food.food?.category?.name || "",
      food.food?.cuisine?.localName || food.food?.cuisine?.name || "",
      "FoodHub",
      "Cambodia food",
      "ម្ហូបអាហារ",
      "កុម្ម៉ង់ម្ហូប",
    ].filter(Boolean),
  };
}

export function generateStoreMetadata(store: StoreSeoData, uuid: string): Metadata {
  const storeName = store.storeName?.trim() || "ហាងអាហារ";
  const location = [store.addressLine, store.district, store.city, store.province]
    .filter(Boolean)
    .join(", ");

  const title = location ? `${storeName} - ${store.city || store.province || "ហាងអាហារ"}` : storeName;
  const description =
    store.description?.trim() ||
    `ស្វែងរកមុខម្ហូប និងកុម្ម៉ង់អាហារពី ${storeName} ${location ? `នៅ ${location}` : ""}. ពិន្ទុ ${store.averageRating ? `⭐ ${store.averageRating.toFixed(1)}` : "ខ្ពស់"}`;

  const imageUrl = `/api/og/store/${uuid}`;
  const canonical = `/stores/${uuid}`;

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      type: "website",
      url: canonical,
      title: `${storeName} | FoodHub`,
      description,
      siteName: SITE_NAME,
      images: [
        {
          url: imageUrl,
          secureUrl: imageUrl,
          width: 1200,
          height: 630,
          alt: `${storeName} - FoodHub`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${storeName} | FoodHub`,
      description,
      images: [imageUrl],
    },
    keywords: [
      storeName,
      store.city || "",
      store.province || "",
      "restaurant",
      "ហាងអាហារ",
      "FoodHub",
      "Cambodia",
    ].filter(Boolean),
  };
}

/* ================================================================
   JSON-LD STRUCTURED DATA BUILDERS (Schema.org)
================================================================ */

/**
 * Google Sitelinks Searchbox Schema
 * Enables the search box directly in Google Search Engine results for FoodHub.
 */
export function generateWebSiteSearchJsonLd(): object {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    alternateName: [
      "mhoubahar.store",
      "mhoubahar",
      "មហូបអាហារ",
      "FoodHub",
      "FoodHub Cambodia",
      "Food Hub",
    ],
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/menu?query={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * Google Organization Schema for Knowledge Graph
 */
export function generateOrganizationJsonLd(): object {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    alternateName: [
      "mhoubahar.store",
      "mhoubahar",
      "មហូបអាហារ",
      "FoodHub",
      "FoodHub Cambodia",
    ],
    url: SITE_URL,
    logo: `${SITE_URL}/og-image.jpeg`,
    sameAs: [
      "https://facebook.com",
      "https://t.me",
    ],
  };
}

export function generateFoodJsonLd(food: FoodSeoData, uuid: string): object {
  const displayName =
    food.localName?.trim() || food.name?.trim() || food.food?.canonicalName || "Food";
  const storeName =
    food.store?.localName?.trim() || food.store?.name?.trim() || "FoodHub";
  const primaryImage =
    food.thumbnail ||
    (food.gallery && food.gallery.length > 0 ? food.gallery[0] : null);
  const imageUrl = toAbsoluteMediaUrl(primaryImage);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: displayName,
    description: food.localDescription?.trim() || food.description?.trim() || undefined,
    image: imageUrl !== DEFAULT_OG_IMAGE ? imageUrl : undefined,
    url: `${SITE_URL}/menu/${uuid}`,
    offers: {
      "@type": "Offer",
      price: food.price !== undefined ? food.price.toFixed(2) : "0.00",
      priceCurrency: food.currencyCode || "USD",
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "FoodEstablishment",
        name: storeName,
      },
    },
    ...(food.store?.averageRating
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: food.store.averageRating.toFixed(1),
            ratingCount: 1,
            bestRating: "5",
            worstRating: "1",
          },
        }
      : {}),
  };
}

export function generateStoreJsonLd(store: StoreSeoData, uuid: string): object {
  const imageUrl = toAbsoluteMediaUrl(store.coverMediaUuid || store.logoMediaUuid);

  return {
    "@context": "https://schema.org",
    "@type": "FoodEstablishment",
    name: store.storeName,
    description: store.description?.trim() || undefined,
    image: imageUrl !== DEFAULT_OG_IMAGE ? imageUrl : undefined,
    url: `${SITE_URL}/stores/${uuid}`,
    ...(store.city
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress: store.addressLine || undefined,
            addressLocality: store.city || undefined,
            addressRegion: store.province || undefined,
            addressCountry: "KH",
          },
        }
      : {}),
    ...(store.averageRating
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: store.averageRating.toFixed(1),
            ratingCount: store.totalReviews || 1,
            bestRating: "5",
            worstRating: "1",
          },
        }
      : {}),
  };
}
