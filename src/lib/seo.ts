import type { Metadata } from "next";

/* =========================================================
   CONFIG
========================================================= */

const RAW_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://www.mhoubahar.store";

export const SITE_URL = (
  RAW_SITE_URL.startsWith("http://") || RAW_SITE_URL.startsWith("https://")
    ? RAW_SITE_URL
    : `https://${RAW_SITE_URL}`
).replace(/\/+$/, "");

export const SITE_NAME = "ម្ហូបអាហារ";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpeg`;
export const FOOD_PUBLIC_PATH = "/menu";
export const STORE_PUBLIC_PATH = "/stores";

export const BACKEND_API_URL = (
  process.env.BACKEND_API_URL || "https://api.mhoubahar.store/api/v1"
).replace(/\/+$/, "");

/* =========================================================
   TYPES
========================================================= */

export interface FoodSeoData {
  uuid: string;

  name: string;
  localName?: string | null;

  description?: string | null;
  localDescription?: string | null;

  thumbnail?: string | null;
  imageUrl?: string | null;
  primaryMediaUuid?: string | null;
  gallery?: string[] | null;

  price?: number | string | null;
  currencyCode?: string | null;

  preparationTimeMinutes?: number | null;
  availabilityStatus?: string | null;
  isFeatured?: boolean | null;

  store?: {
    uuid: string;

    name: string;
    localName?: string | null;

    city?: string | null;
    district?: string | null;
    addressLine?: string | null;

    averageRating?: number | string | null;
    totalReviews?: number | null;

    logoUrl?: string | null;
  } | null;

  food?: {
    canonicalName?: string | null;

    category?: {
      name?: string | null;
      localName?: string | null;
    } | null;

    cuisine?: {
      name?: string | null;
      localName?: string | null;
    } | null;

    ingredients?: string[] | null;
  } | null;
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

  averageRating?: number | string | null;
  totalReviews?: number | null;

  isOpenNow?: boolean | null;
}

/* =========================================================
   HELPERS
========================================================= */

function cleanText(value: string | null | undefined): string {
  return (value || "").replace(/\s+/g, " ").trim();
}

function toNumber(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : null;
}

function truncate(value: string, maxLength = 160): string {
  const text = cleanText(value);

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 1).trim()}…`;
}

function unwrapResponse<T>(json: unknown): T | null {
  if (!json || typeof json !== "object") {
    return null;
  }

  const response = json as {
    payload?: unknown;
    data?: unknown;
  };

  return (response.payload ?? response.data ?? json) as T;
}

/* =========================================================
   MEDIA URL RESOLVER
========================================================= */

export function toAbsoluteMediaUrl(
  value: string | null | undefined,
  fallback = DEFAULT_OG_IMAGE,
): string {
  const source = value?.trim();

  if (!source) {
    return fallback;
  }

  // Already absolute
  if (source.startsWith("https://") || source.startsWith("http://")) {
    return source;
  }

  // Raw media UUID
  const UUID_REGEX =
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

  if (UUID_REGEX.test(source)) {
    return `${BACKEND_API_URL}/media/${source}/file`;
  }

  // Backend already returns /api/v1/...
  if (source.startsWith("/api/v1/")) {
    return `${BACKEND_API_URL}${source.slice("/api/v1".length)}`;
  }

  // Backend returns /api/...
  if (source.startsWith("/api/")) {
    return `${BACKEND_API_URL}${source.slice("/api".length)}`;
  }

  // Backend returns /media/...
  if (source.startsWith("/media/")) {
    return `${BACKEND_API_URL}${source}`;
  }

  if (source.startsWith("media/")) {
    return `${BACKEND_API_URL}/${source}`;
  }

  // Frontend public asset
  if (source.startsWith("/")) {
    return `${SITE_URL}${source}`;
  }

  return fallback;
}

/* =========================================================
   FOOD SEO FETCHER
========================================================= */

export async function fetchFoodForSeo(
  uuid: string,
): Promise<FoodSeoData | null> {
  if (!uuid) {
    return null;
  }

  const safeUuid = encodeURIComponent(uuid);

  /*
   * Your primary endpoint.
   *
   * The second endpoint is just a fallback in case
   * your backend exposes the detail directly.
   */
  const endpoints = [
    `${BACKEND_API_URL}/catalog/menu-items/${safeUuid}/detail`,
    `${BACKEND_API_URL}/catalog/menu-items/${safeUuid}`,
  ];

  for (const url of endpoints) {
    try {
      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
        },

        next: {
          revalidate: 300,
        },
      });

      if (!response.ok) {
        const body = await response.text().catch(() => "");

        console.error("[SEO] Food API failed:", {
          uuid,
          url,
          status: response.status,
          statusText: response.statusText,
          body,
        });

        continue;
      }

      const json = await response.json();

      const food = unwrapResponse<FoodSeoData>(json);

      if (!food) {
        console.error("[SEO] Empty food API response:", url);

        continue;
      }

      if (!food.uuid || !food.name) {
        console.error("[SEO] Invalid food API response:", {
          url,
          food,
        });

        continue;
      }

      console.log("[SEO] Food loaded:", {
        uuid: food.uuid,
        name: food.name,
      });

      return food;
    } catch (error) {
      console.error("[SEO] Food fetch error:", {
        uuid,
        url,
        error,
      });
    }
  }

  return null;
}

/* =========================================================
   STORE SEO FETCHER
========================================================= */

export async function fetchStoreForSeo(
  uuid: string,
): Promise<StoreSeoData | null> {
  if (!uuid) {
    return null;
  }

  const url = `${BACKEND_API_URL}/stores/${encodeURIComponent(uuid)}`;

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },

      next: {
        revalidate: 300,
      },
    });

    if (!response.ok) {
      console.error("[SEO] Store API failed:", {
        uuid,
        status: response.status,
        url,
      });

      return null;
    }

    const json = await response.json();

    return unwrapResponse<StoreSeoData>(json);
  } catch (error) {
    console.error("[SEO] Store fetch error:", error);

    return null;
  }
}

/* =========================================================
   FOOD METADATA
========================================================= */

export function generateFoodMetadata(
  food: FoodSeoData,
  uuid: string,
): Metadata {
  const displayName =
    cleanText(food.localName) ||
    cleanText(food.name) ||
    cleanText(food.food?.canonicalName) ||
    "មុខម្ហូប";

  const storeName =
    cleanText(food.store?.localName) || cleanText(food.store?.name);

  const numericPrice = toNumber(food.price);

  const currency = cleanText(food.currencyCode) || "USD";

  const priceText =
    numericPrice !== null
      ? currency === "USD"
        ? `$${numericPrice.toFixed(2)}`
        : `${numericPrice.toFixed(2)} ${currency}`
      : "";

  /*
   * Do not add FoodHub here.
   * Root layout title template adds it automatically.
   */

  const title = [displayName, storeName || null].filter(Boolean).join(" - ");

  const fallbackDescription = [
    `ស្វែងយល់អំពី ${displayName}`,
    storeName ? `ពី ${storeName}` : "នៅ FoodHub Cambodia",
    priceText ? `តម្លៃ ${priceText}` : null,
  ]
    .filter(Boolean)
    .join(" ");

  const description = truncate(
    cleanText(food.localDescription) ||
      cleanText(food.description) ||
      fallbackDescription,
  );

  /*
   * Dynamic food image has priority.
   * /og-image.jpeg is only fallback.
   */

  const primaryImage =
    food.imageUrl ||
    food.thumbnail ||
    food.primaryMediaUuid ||
    food.gallery?.[0] ||
    null;

  const imageUrl = toAbsoluteMediaUrl(primaryImage);

  const canonical = `${SITE_URL}${FOOD_PUBLIC_PATH}/${encodeURIComponent(uuid)}`;

  return {
    title,

    description,

    alternates: {
      canonical,
    },

    robots: {
      index: true,
      follow: true,

      googleBot: {
        index: true,
        follow: true,

        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },

    openGraph: {
      type: "website",
      url: canonical,

      siteName: SITE_NAME,

      title: storeName ? `${displayName} - ${storeName}` : displayName,

      description,

      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: displayName,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",

      title: storeName ? `${displayName} - ${storeName}` : displayName,

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
      "ម្ហូបអាហារ",
      "អាហារខ្មែរ",
      "Cambodia food",
      "Khmer food",
      "food recommendation",
    ].filter(Boolean),
  };
}

/* =========================================================
   STORE METADATA
========================================================= */

export function generateStoreMetadata(
  store: StoreSeoData,
  uuid: string,
): Metadata {
  const storeName = cleanText(store.storeName) || "ហាងអាហារ";

  const location = [
    store.addressLine,
    store.district,
    store.city,
    store.province,
  ]
    .filter(Boolean)
    .join(", ");

  const description = truncate(
    cleanText(store.description) ||
      `ស្វែងរកមុខម្ហូប និងព័ត៌មានអំពី ${storeName}${
        location ? ` នៅ ${location}` : ""
      } នៅ FoodHub Cambodia.`,
  );

  const mediaImageUrl = toAbsoluteMediaUrl(
    store.coverMediaUuid || store.logoMediaUuid,
  );

  const imageUrl = mediaImageUrl || `/api/og/store/${uuid}`;
  const canonical = `/stores/${uuid}`;

  return {
    title: storeName,

    description,

    alternates: {
      canonical,
    },

    robots: {
      index: true,
      follow: true,

      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },

    openGraph: {
      type: "website",
      url: canonical,

      siteName: SITE_NAME,

      title: storeName,

      description,

      images: [
        {
          url: imageUrl,
          secureUrl: imageUrl,
          width: 1200,
          height: 630,
          alt: storeName,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",

      title: storeName,

      description,

      images: [imageUrl],
    },
  };
}

/* =========================================================
   SCHEMA AVAILABILITY
========================================================= */

function getSchemaAvailability(
  status: string | null | undefined,
): string | undefined {
  const value = status?.trim().toUpperCase();

  switch (value) {
    case "AVAILABLE":
    case "ACTIVE":
    case "IN_STOCK":
      return "https://schema.org/InStock";

    case "OUT_OF_STOCK":
    case "UNAVAILABLE":
      return "https://schema.org/OutOfStock";

    case "PREORDER":
    case "PRE_ORDER":
      return "https://schema.org/PreOrder";

    default:
      return undefined;
  }
}

/* =========================================================
   FOOD JSON-LD
========================================================= */

export function generateFoodJsonLd(food: FoodSeoData, uuid: string): object {
  const displayName =
    cleanText(food.localName) ||
    cleanText(food.name) ||
    cleanText(food.food?.canonicalName) ||
    "Food";

  const storeName =
    cleanText(food.store?.localName) ||
    cleanText(food.store?.name) ||
    SITE_NAME;

  const description =
    cleanText(food.localDescription) || cleanText(food.description);

  const primaryImage =
    food.imageUrl ||
    food.thumbnail ||
    food.primaryMediaUuid ||
    food.gallery?.[0] ||
    null;

  const imageUrl = toAbsoluteMediaUrl(primaryImage);

  const numericPrice = toNumber(food.price);

  const canonical = `${SITE_URL}${FOOD_PUBLIC_PATH}/${encodeURIComponent(uuid)}`;

  const availability = getSchemaAvailability(food.availabilityStatus);

  return {
    "@context": "https://schema.org",

    "@type": "MenuItem",

    "@id": canonical,

    url: canonical,

    name: displayName,

    description: description || undefined,

    image: imageUrl !== DEFAULT_OG_IMAGE ? imageUrl : undefined,

    ...(food.food?.category
      ? {
          menuAddOn: undefined,
        }
      : {}),

    ...(numericPrice !== null
      ? {
          offers: {
            "@type": "Offer",

            url: canonical,

            price: numericPrice.toFixed(2),

            priceCurrency: food.currencyCode || "USD",

            ...(availability
              ? {
                  availability,
                }
              : {}),

            seller: {
              "@type": "FoodEstablishment",

              name: storeName,
            },
          },
        }
      : {}),
  };
}

/* =========================================================
   STORE JSON-LD
========================================================= */

export function generateStoreJsonLd(store: StoreSeoData, uuid: string): object {
  const imageUrl = toAbsoluteMediaUrl(
    store.coverMediaUuid || store.logoMediaUuid,
  );

  const rating = toNumber(store.averageRating);

  const reviewCount = store.totalReviews || 0;

  const canonical = `${SITE_URL}${STORE_PUBLIC_PATH}/${encodeURIComponent(uuid)}`;

  return {
    "@context": "https://schema.org",

    "@type": "FoodEstablishment",

    "@id": canonical,

    url: canonical,

    name: store.storeName,

    description: cleanText(store.description) || undefined,

    image: imageUrl !== DEFAULT_OG_IMAGE ? imageUrl : undefined,

    ...(store.city || store.province || store.addressLine
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

    /*
     * Only output rating when real rating
     * and real review count exist.
     */

    ...(rating !== null && reviewCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",

            ratingValue: rating,

            reviewCount,

            bestRating: 5,

            worstRating: 1,
          },
        }
      : {}),
  };
}

/* =========================================================
   WEBSITE JSON-LD
========================================================= */

export function generateWebSiteJsonLd(): object {
  return {
    "@context": "https://schema.org",

    "@graph": [
      /* -------------------------------------------------------
         ORGANIZATION — Establishes brand identity.
         "alternateName" teaches Google all spelling variants,
         which eliminates the "Did you mean mahabharat" typo
         correction because Google learns the real brand name.
      ------------------------------------------------------- */
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,

        name: "Mhoubahar FoodHub",
        legalName: "Mhoubahar FoodHub",

        alternateName: [
          "ម្ហូបអាហារ",
          "MhouBahar",
          "Mhoubahar",
          "mhoubahar",
          "mhoubahar.store",
          "FoodHub",
          "Food Hub Cambodia",
          "FoodHub Cambodia",
          "ម្ហូប",
          "មហូបអាហារ",
          "Mhoub",
          "Mhoub Ahar",
          "ម្ហូបអាហារ Cambodia",
        ],

        url: SITE_URL,

        logo: {
          "@type": "ImageObject",
          url: `${SITE_URL}/Image/foodHub-logo.png`,
          width: 300,
          height: 300,
          caption: "Mhoubahar FoodHub Logo",
        },

        image: `${SITE_URL}/Image/foodHub-logo.png`,

        description:
          "Mhoubahar FoodHub (ម្ហូបអាហារ) is Cambodia's personalized food discovery platform. Find Khmer food, restaurants, and meal recommendations tailored to your taste, dietary needs, religion, and location.",

        sameAs: [
          "https://www.mhoubahar.store",
          "https://mhoubahar.store",
        ],

        contactPoint: {
          "@type": "ContactPoint",
          email: "foouhub@gmail.com",
          contactType: "Customer Support",
          availableLanguage: ["km", "en"],
        },

        foundingLocation: {
          "@type": "Place",
          name: "Phnom Penh, Cambodia",
        },

        areaServed: {
          "@type": "Country",
          name: "Cambodia",
        },
      },

      /* -------------------------------------------------------
         WEBSITE + SEARCH ACTION
         Enables Google Sitelinks Searchbox in search results.
         SearchAction with target lets Google show your site
         search directly in the SERP.
      ------------------------------------------------------- */
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,

        url: SITE_URL,
        name: "Mhoubahar FoodHub — ម្ហូបអាហារ",

        alternateName: [
          "ម្ហូបអាហារ",
          "Mhoubahar",
          "FoodHub Cambodia",
        ],

        description:
          "ស្វែងរក និងណែនាំម្ហូបអាហារ (Mhoub) ភោជនីយដ្ឋាន ដោយផ្អែកលើចំណូលចិត្ត អាឡែស៊ី និងទីតាំងរបស់អ្នក — Discover personalized food and restaurant recommendations in Cambodia.",

        inLanguage: ["km-KH", "en-US"],

        publisher: {
          "@id": `${SITE_URL}/#organization`,
        },

        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${SITE_URL}/menu?search={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },

      /* -------------------------------------------------------
         BREADCRUMB — Helps Google understand site hierarchy.
      ------------------------------------------------------- */
      {
        "@type": "BreadcrumbList",
        "@id": `${SITE_URL}/#breadcrumb`,

        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "ទំព័រដើម — Mhoubahar FoodHub",
            item: SITE_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "ម្ហូបអាហារ — Khmer Food Menu",
            item: `${SITE_URL}/menu`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: "ភោជនីយដ្ឋាន — Restaurants",
            item: `${SITE_URL}/stores`,
          },
        ],
      },

      /* -------------------------------------------------------
         FAQ PAGE — FAQ schema adds keyword-rich content signals.
         Google indexes FAQ answers and can show them as rich
         results — greatly increasing keyword coverage for
         Khmer food, "foodhub", "mhoubahar", etc.
      ------------------------------------------------------- */
      {
        "@type": "FAQPage",
        "@id": `${SITE_URL}/#faq`,

        mainEntity: [
          {
            "@type": "Question",
            name: "Mhoubahar ជាអ្វី? (What is Mhoubahar?)",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Mhoubahar (ម្ហូបអាហារ) គឺជា FoodHub — វេទិកាស្វែងរក និងណែនាំម្ហូបអាហារ (Mhoub) ជាតិខ្មែរ និងហាងភោជនីយដ្ឋាននៅកម្ពុជា។ Mhoubahar.store is Cambodia's leading personalized food discovery app (FoodHub) that recommends Khmer food, restaurants, and meals based on your preferences, allergies, dietary type, and location.",
            },
          },
          {
            "@type": "Question",
            name: "តើ FoodHub ជួយអ្វី? (What does FoodHub help with?)",
            acceptedAnswer: {
              "@type": "Answer",
              text: "FoodHub (ម្ហូបអាហារ Mhoubahar) ជួយអ្នកស្វែងរក ម្ហូបឆ្ងាញ់ ហាងអាហារ ភោជនីយដ្ឋាន មុខម្ហូបខ្មែរ (Khmer food) ម្ហូបhalal ម្ហូប채食 (vegetarian food) ម្ហូបតាមរដូវ ម្ហូបប្រចាំទិវា និងការណែនាំម្ហូបដែលត្រូវការ (food recommendation) ដោយផ្អែកលើចំណូលចិត្ត (preferences) អាឡែស៊ី (allergies) ជំនឿ (religion) និងទីតាំង (location)។",
            },
          },
          {
            "@type": "Question",
            name: "ស្វែងរកម្ហូបខ្មែរ Khmer food យ៉ាងដូចម្តេច?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "ចូល Mhoubahar.store ហើយប្រើប្រាស់ប្រព័ន្ធស្វែងរកដើម្បីស្វែងរក មុខម្ហូប ហាងភោជនីយដ្ឋាន ឬប្រភេទអាហារ (food category) ណាមួយ។ អ្នកអាចស្វែងរកដោយ ប្រភេទ (category), ប្រភពពូជ (cuisine), ដូចជា ម្ហូបខ្មែរ, ម្ហូបចិន, ម្ហូបថៃ, ម្ហូបhalal, ម្ហូប채食 (vegetarian), ក្នុងតំបន់ (location), ឬតាមពេលវេលា (meal time).",
            },
          },
          {
            "@type": "Question",
            name: "FoodHub Cambodia ខុសពី app ផ្សេងៗ (food delivery app) ដូចម្តេច?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Mhoubahar FoodHub (ម្ហូបអាហារ) មិនមែនជា food delivery app ទេ។ FoodHub ផ្តល់ការណែនាំ (personalized food recommendation) ដែលផ្អែកលើ profile សុខភាព ចំណូលចិត្ត ជំនឿ (religion) ដូចជា Halal, Buddhism, Vegetarian, អាឡែស៊ី (allergies) និងទីតាំង (location) នៅ Cambodia។",
            },
          },
          {
            "@type": "Question",
            name: "ស្វែងរកហាងអាហារ (restaurant) ណែនាំ នៅភ្នំពេញ?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Mhoubahar FoodHub (ម្ហូបអាហារ) ផ្តល់ការណែនាំ ហាងអាហារ ភោជនីយដ្ឋាន restaurant នៅ ភ្នំពេញ (Phnom Penh) Cambodia ។ ប្រើ FoodHub.mhoubahar.store ដើម្បីរក ហាងអាហារ restaurant ណែនាំ ហាង halal ហាង채食 ហាង BBQ ហាងបាយ ហាងកាហ្វេ ហាងម្ហូបខ្មែរ ជិតទីតាំងអ្នក (near you).",
            },
          },
        ],
      },

      /* -------------------------------------------------------
         SPEAKABLE — Helps Google identify key text to read
         aloud in voice search results and Google Assistant.
      ------------------------------------------------------- */
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/#homepage`,

        url: SITE_URL,

        name: "ម្ហូបអាហារ Mhoubahar - ណែនាំម្ហូបឆ្ងាញ់ | FoodHub Cambodia",

        description:
          "Mhoubahar (ម្ហូបអាហារ) FoodHub Cambodia — ស្វែងរក និងណែនាំម្ហូបអាហារ ភោជនីយដ្ឋាន (restaurant) ជាតិខ្មែរ Khmer food ដោយផ្អែកលើចំណូលចិត្ត (preferences) អាឡែស៊ី (allergy) ជំនឿ (religion) ។",

        inLanguage: "km-KH",

        isPartOf: {
          "@id": `${SITE_URL}/#website`,
        },

        about: {
          "@id": `${SITE_URL}/#organization`,
        },

        speakable: {
          "@type": "SpeakableSpecification",
          cssSelector: ["h1", "h2", "[data-speakable]"],
        },

        primaryImageOfPage: {
          "@type": "ImageObject",
          url: DEFAULT_OG_IMAGE,
          width: 1200,
          height: 630,
          caption: "Mhoubahar FoodHub — ម្ហូបអាហារ Cambodia",
        },
      },
    ],
  };
}

// /**
//  * FoodHub — Centralized Dynamic SEO & Structured Data Library
//  *
//  * Generates dynamic Next.js Metadata and Schema.org JSON-LD structured data
//  * directly from real backend API data for foods, stores, menu items, and search.
//  */

// import type { Metadata } from "next";

// export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.trim()
//   ? process.env.NEXT_PUBLIC_SITE_URL.startsWith("http")
//     ? process.env.NEXT_PUBLIC_SITE_URL
//     : `https://${process.env.NEXT_PUBLIC_SITE_URL}`
//   : "https://www.mhoubahar.store";

// export const SITE_NAME = "ម្ហូបអាហារ";
// export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpeg`;

// const BACKEND_API_URL =
//   process.env.BACKEND_API_URL || "https://api.mhoubahar.store/api/v1";

// /* ================================================================
//    MEDIA URL RESOLVER (Absolute URLs for Open Graph & JSON-LD)
// ================================================================ */

// export function toAbsoluteMediaUrl(
//   value: string | null | undefined,
//   fallback = DEFAULT_OG_IMAGE,
// ): string {
//   const source = value?.trim();
//   if (!source) return fallback;

//   if (source.startsWith("http://") || source.startsWith("https://")) {
//     return source;
//   }

//   const UUID_REGEX =
//     /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

//   if (UUID_REGEX.test(source)) {
//     return `${BACKEND_API_URL}/media/${source}/file`;
//   }

//   if (source.startsWith("/api/v1/")) {
//     return `${BACKEND_API_URL}${source.slice("/api/v1".length)}`;
//   }

//   if (source.startsWith("/api/")) {
//     return `${BACKEND_API_URL}${source.slice("/api".length)}`;
//   }

//   if (source.startsWith("/")) {
//     return `${SITE_URL}${source}`;
//   }

//   return fallback;
// }

// /* ================================================================
//    SERVER-SIDE API DATA FETCHERS (with caching & revalidation)
// ================================================================ */

// export interface FoodSeoData {
//   uuid: string;
//   name: string;
//   localName?: string | null;
//   description?: string | null;
//   localDescription?: string | null;
//   thumbnail?: string | null;
//   gallery?: string[];
//   price?: number;
//   currencyCode?: string;
//   preparationTimeMinutes?: number;
//   isFeatured?: boolean;
//   store?: {
//     uuid: string;
//     name: string;
//     localName?: string | null;
//     city?: string | null;
//     district?: string | null;
//     addressLine?: string | null;
//     averageRating?: number;
//     logoUrl?: string | null;
//   };
//   food?: {
//     canonicalName?: string;
//     category?: { name: string; localName?: string };
//     cuisine?: { name: string; localName?: string };
//     ingredients?: string[];
//   };
// }

// export interface StoreSeoData {
//   uuid: string;
//   storeName: string;
//   description?: string | null;
//   city?: string | null;
//   province?: string | null;
//   district?: string | null;
//   addressLine?: string | null;
//   logoMediaUuid?: string | null;
//   coverMediaUuid?: string | null;
//   averageRating?: number;
//   totalReviews?: number;
//   isOpenNow?: boolean;
// }

// /**
//  * Fetch food item detail directly from backend API for SSR metadata.
//  */
// // export async function fetchFoodForSeo(uuid: string): Promise<FoodSeoData | null> {
// //   if (!uuid) return null;

// //   try {
// //     const res = await fetch(
// //       `${BACKEND_API_URL}/catalog/menu-items/${encodeURIComponent(uuid)}/detail`,
// //       {
// //         next: { revalidate: 3600 }, // 1 hour cache
// //       },
// //     );

// //     if (!res.ok) return null;

// //     const json = await res.json();
// //     return (json?.payload ?? json?.data ?? json) as FoodSeoData;
// //   } catch (error) {
// //     console.error("[SEO] Failed to fetch food item:", error);
// //     return null;
// //   }
// // }
// export async function fetchFoodForSeo(
//   uuid: string,
// ): Promise<FoodSeoData | null> {
//   if (!uuid) return null;

//   const url = `${BACKEND_API_URL}/catalog/menu-items/${encodeURIComponent(uuid)}/detail`;

//   try {
//     console.log("[SEO] Fetching:", url);

//     const res = await fetch(url, {
//       next: {
//         revalidate: 300,
//       },
//     });

//     if (!res.ok) {
//       const errorBody = await res.text();

//       console.error("[SEO] Food API failed:", {
//         uuid,
//         url,
//         status: res.status,
//         statusText: res.statusText,
//         body: errorBody,
//       });

//       return null;
//     }

//     const json = await res.json();

//     console.log("[SEO] Food API success:", {
//       uuid,
//       name: json?.payload?.name ?? json?.data?.name ?? json?.name,
//     });

//     return (json?.payload ?? json?.data ?? json) as FoodSeoData;
//   } catch (error) {
//     console.error("[SEO] Food fetch exception:", {
//       uuid,
//       url,
//       error,
//     });

//     return null;
//   }
// }

// /**
//  * Fetch store detail directly from backend API for SSR metadata.
//  */
// export async function fetchStoreForSeo(
//   uuid: string,
// ): Promise<StoreSeoData | null> {
//   if (!uuid) return null;

//   try {
//     const res = await fetch(
//       `${BACKEND_API_URL}/stores/${encodeURIComponent(uuid)}`,
//       {
//         next: { revalidate: 3600 },
//       },
//     );

//     if (!res.ok) return null;

//     const json = await res.json();
//     return (json?.payload ?? json?.data ?? json) as StoreSeoData;
//   } catch (error) {
//     console.error("[SEO] Failed to fetch store:", error);
//     return null;
//   }
// }

// /* ================================================================
//    DYNAMIC METADATA BUILDERS
// ================================================================ */

// // export function generateFoodMetadata(
// //   food: FoodSeoData,
// //   uuid: string,
// // ): Metadata {
// //   const displayName =
// //     food.localName?.trim() ||
// //     food.name?.trim() ||
// //     food.food?.canonicalName ||
// //     "មុខម្ហូប";
// //   const storeName =
// //     food.store?.localName?.trim() || food.store?.name?.trim() || "";
// //   const priceFormatted =
// //     food.price !== undefined ? `$${food.price.toFixed(2)}` : "";

// //   const title = storeName
// //     ? `${displayName} - ${storeName} | ${priceFormatted}`
// //     : `${displayName} ${priceFormatted ? `- ${priceFormatted}` : ""}`;

// //   const description =
// //     food.localDescription?.trim() ||
// //     food.description?.trim() ||
// //     `ស្វែងរក ${displayName} ឆ្ងាញ់ៗ ${storeName ? `ពី ${storeName}` : "នៅ FoodHub Cambodia"}. តម្លៃ ${priceFormatted}`;

// //   const primaryImage =
// //     food.thumbnail ||
// //     (food.gallery && food.gallery.length > 0 ? food.gallery[0] : null);
// //   const imageUrl = toAbsoluteMediaUrl(primaryImage);
// //   const canonical = `${SITE_URL}/menu/${uuid}`;

// //   return {
// //     title,
// //     description,
// //     alternates: {
// //       canonical,
// //     },
// //     openGraph: {
// //       type: "article",
// //       url: canonical,
// //       title: `${displayName} | FoodHub`,
// //       description,
// //       siteName: SITE_NAME,
// //       images: [
// //         {
// //           url: imageUrl,
// //           width: 1200,
// //           height: 630,
// //           alt: `${displayName} - FoodHub`,
// //         },
// //       ],
// //     },
// //     twitter: {
// //       card: "summary_large_image",
// //       title: `${displayName} | FoodHub`,
// //       description,
// //       images: [imageUrl],
// //     },
// //     keywords: [
// //       displayName,
// //       food.name,
// //       storeName,
// //       food.food?.category?.localName || food.food?.category?.name || "",
// //       food.food?.cuisine?.localName || food.food?.cuisine?.name || "",
// //       "FoodHub",
// //       "Cambodia food",
// //       "ម្ហូបអាហារ",
// //       "កុម្ម៉ង់ម្ហូប",
// //     ].filter(Boolean),
// //   };
// // }
// export function generateFoodMetadata(
//   food: FoodSeoData,
//   uuid: string,
// ): Metadata {
//   const displayName =
//     food.localName?.trim() ||
//     food.name?.trim() ||
//     food.food?.canonicalName ||
//     "មុខម្ហូប";

//   const storeName =
//     food.store?.localName?.trim() || food.store?.name?.trim() || "";

//   const priceFormatted =
//     food.price !== undefined ? `$${food.price.toFixed(2)}` : "";

//   const title = [displayName, storeName || null, priceFormatted || null]
//     .filter(Boolean)
//     .join(" - ");

//   const fallbackDescription = [
//     `ស្វែងរក ${displayName} ឆ្ងាញ់ៗ`,
//     storeName ? `ពី ${storeName}` : "នៅ FoodHub Cambodia",
//     priceFormatted ? `តម្លៃ ${priceFormatted}` : null,
//   ]
//     .filter(Boolean)
//     .join(" ");

//   const description =
//     food.localDescription?.trim() ||
//     food.description?.trim() ||
//     fallbackDescription;

//   const primaryImage = food.thumbnail || food.gallery?.[0] || null;

//   const imageUrl = toAbsoluteMediaUrl(primaryImage);

//   const canonical = `${SITE_URL}/menu/${uuid}`;

//   return {
//     title,

//     description,

//     alternates: {
//       canonical,
//     },

//     openGraph: {
//       type: "website",

//       url: canonical,

//       siteName: SITE_NAME,

//       title: displayName,

//       description,

//       images: [
//         {
//           url: imageUrl,

//           width: 1200,
//           height: 630,

//           alt: displayName,
//         },
//       ],
//     },

//     twitter: {
//       card: "summary_large_image",

//       title: displayName,

//       description,

//       images: [imageUrl],
//     },

//     keywords: [
//       displayName,

//       food.name,

//       storeName,

//       food.food?.category?.localName || food.food?.category?.name || "",

//       food.food?.cuisine?.localName || food.food?.cuisine?.name || "",

//       "FoodHub",
//       "Cambodia food",
//       "ម្ហូបអាហារ",
//     ].filter(Boolean),
//   };
// }

// export function generateStoreMetadata(
//   store: StoreSeoData,
//   uuid: string,
// ): Metadata {
//   const storeName = store.storeName?.trim() || "ហាងអាហារ";
//   const location = [
//     store.addressLine,
//     store.district,
//     store.city,
//     store.province,
//   ]
//     .filter(Boolean)
//     .join(", ");

//   const title = location
//     ? `${storeName} - ${store.city || store.province || "ហាងអាហារ"}`
//     : storeName;
//   const description =
//     store.description?.trim() ||
//     `ស្វែងរកមុខម្ហូប និងកុម្ម៉ង់អាហារពី ${storeName} ${location ? `នៅ ${location}` : ""}. ពិន្ទុ ${store.averageRating ? `⭐ ${store.averageRating.toFixed(1)}` : "ខ្ពស់"}`;

//   const imageUrl = toAbsoluteMediaUrl(
//     store.coverMediaUuid || store.logoMediaUuid,
//   );
//   const canonical = `${SITE_URL}/stores/${uuid}`;

//   return {
//     title,
//     description,
//     alternates: {
//       canonical,
//     },
//     openGraph: {
//       type: "article",
//       url: canonical,
//       title: `${storeName} | FoodHub`,
//       description,
//       siteName: SITE_NAME,
//       images: [
//         {
//           url: imageUrl,
//           width: 1200,
//           height: 630,
//           alt: `${storeName} - FoodHub`,
//         },
//       ],
//     },
//     twitter: {
//       card: "summary_large_image",
//       title: `${storeName} | FoodHub`,
//       description,
//       images: [imageUrl],
//     },
//     keywords: [
//       storeName,
//       store.city || "",
//       store.province || "",
//       "restaurant",
//       "ហាងអាហារ",
//       "FoodHub",
//       "Cambodia",
//     ].filter(Boolean),
//   };
// }

// /* ================================================================
//    JSON-LD STRUCTURED DATA BUILDERS (Schema.org)
// ================================================================ */

// /**
//  * Google Sitelinks Searchbox Schema
//  * Enables the search box directly in Google Search Engine results for FoodHub.
//  */
// export function generateWebSiteSearchJsonLd(): object {
//   return {
//     "@context": "https://schema.org",
//     "@type": "WebSite",
//     name: SITE_NAME,
//     url: SITE_URL,
//     potentialAction: {
//       "@type": "SearchAction",
//       target: {
//         "@type": "EntryPoint",
//         urlTemplate: `${SITE_URL}/menu?query={search_term_string}`,
//       },
//       "query-input": "required name=search_term_string",
//     },
//   };
// }

// export function generateFoodJsonLd(food: FoodSeoData, uuid: string): object {
//   const displayName =
//     food.localName?.trim() ||
//     food.name?.trim() ||
//     food.food?.canonicalName ||
//     "Food";
//   const storeName =
//     food.store?.localName?.trim() || food.store?.name?.trim() || "FoodHub";
//   const primaryImage =
//     food.thumbnail ||
//     (food.gallery && food.gallery.length > 0 ? food.gallery[0] : null);
//   const imageUrl = toAbsoluteMediaUrl(primaryImage);

//   return {
//     "@context": "https://schema.org",
//     "@type": "Product",
//     name: displayName,
//     description:
//       food.localDescription?.trim() || food.description?.trim() || undefined,
//     image: imageUrl !== DEFAULT_OG_IMAGE ? imageUrl : undefined,
//     url: `${SITE_URL}/menu/${uuid}`,
//     offers: {
//       "@type": "Offer",
//       price: food.price !== undefined ? food.price.toFixed(2) : "0.00",
//       priceCurrency: food.currencyCode || "USD",
//       availability: "https://schema.org/InStock",
//       seller: {
//         "@type": "FoodEstablishment",
//         name: storeName,
//       },
//     },
//     ...(food.store?.averageRating
//       ? {
//           aggregateRating: {
//             "@type": "AggregateRating",
//             ratingValue: food.store.averageRating.toFixed(1),
//             ratingCount: 1,
//             bestRating: "5",
//             worstRating: "1",
//           },
//         }
//       : {}),
//   };
// }

// export function generateStoreJsonLd(store: StoreSeoData, uuid: string): object {
//   const imageUrl = toAbsoluteMediaUrl(
//     store.coverMediaUuid || store.logoMediaUuid,
//   );

//   return {
//     "@context": "https://schema.org",
//     "@type": "FoodEstablishment",
//     name: store.storeName,
//     description: store.description?.trim() || undefined,
//     image: imageUrl !== DEFAULT_OG_IMAGE ? imageUrl : undefined,
//     url: `${SITE_URL}/stores/${uuid}`,
//     ...(store.city
//       ? {
//           address: {
//             "@type": "PostalAddress",
//             streetAddress: store.addressLine || undefined,
//             addressLocality: store.city || undefined,
//             addressRegion: store.province || undefined,
//             addressCountry: "KH",
//           },
//         }
//       : {}),
//     ...(store.averageRating
//       ? {
//           aggregateRating: {
//             "@type": "AggregateRating",
//             ratingValue: store.averageRating.toFixed(1),
//             ratingCount: store.totalReviews || 1,
//             bestRating: "5",
//             worstRating: "1",
//           },
//         }
//       : {}),
//   };
// }
