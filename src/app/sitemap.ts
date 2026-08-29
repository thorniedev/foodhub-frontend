import type { MetadataRoute } from "next";

import { FOOD_PUBLIC_PATH, SITE_URL, STORE_PUBLIC_PATH } from "@/lib/seo";

/* =========================================================
   BACKEND
========================================================= */

const BACKEND_API_URL = (
  process.env.BACKEND_API_URL || "https://api.mhoubahar.store/api/v1"
).replace(/\/+$/, "");

/* =========================================================
   TYPES
========================================================= */

interface SitemapMenuItem {
  uuid: string;

  updatedAt?: string | null;
}

interface SitemapStore {
  uuid: string;

  updatedAt?: string | null;
}

/* =========================================================
   RESPONSE PARSER
========================================================= */

function extractContent<T>(json: unknown): T[] {
  if (!json) {
    return [];
  }

  if (Array.isArray(json)) {
    return json as T[];
  }

  if (typeof json !== "object") {
    return [];
  }

  const response = json as {
    payload?: unknown;
    data?: unknown;
    content?: unknown;
  };

  const root = response.payload ?? response.data ?? response.content ?? json;

  if (Array.isArray(root)) {
    return root as T[];
  }

  if (root && typeof root === "object") {
    const nested = root as {
      content?: unknown;
      items?: unknown;
      results?: unknown;
    };

    if (Array.isArray(nested.content)) {
      return nested.content as T[];
    }

    if (Array.isArray(nested.items)) {
      return nested.items as T[];
    }

    if (Array.isArray(nested.results)) {
      return nested.results as T[];
    }
  }

  return [];
}

/* =========================================================
   DATE
========================================================= */

function safeDate(value: string | null | undefined): Date {
  if (!value) {
    return new Date();
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return new Date();
  }

  return date;
}

/* =========================================================
   MENU ITEMS
========================================================= */

async function fetchMenuItems(): Promise<SitemapMenuItem[]> {
  const urls = [`${BACKEND_API_URL}/catalog/menu-items?page=0&size=1000`];

  for (const url of urls) {
    try {
      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
        },

        next: {
          revalidate: 3600,
        },
      });

      if (!response.ok) {
        console.error("[Sitemap] Menu API failed:", response.status, url);

        continue;
      }

      const json = await response.json();

      const items = extractContent<SitemapMenuItem>(json);

      if (items.length) {
        return items;
      }
    } catch (error) {
      console.error("[Sitemap] Menu fetch error:", error);
    }
  }

  return [];
}

/* =========================================================
   STORES
========================================================= */

async function fetchStores(): Promise<SitemapStore[]> {
  try {
    const response = await fetch(`${BACKEND_API_URL}/stores?page=0&size=1000`, {
      headers: {
        Accept: "application/json",
      },

      next: {
        revalidate: 3600,
      },
    });

    if (!response.ok) {
      console.error("[Sitemap] Store API failed:", response.status);

      return [];
    }

    const json = await response.json();

    return extractContent<SitemapStore>(json);
  } catch (error) {
    console.error("[Sitemap] Store fetch error:", error);

    return [];
  }
}

/* =========================================================
   SITEMAP
========================================================= */

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [menuItems, stores] = await Promise.all([
    fetchMenuItems(),
    fetchStores(),
  ]);

  /* -------------------------
     STATIC PUBLIC PAGES
  ------------------------- */

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,

      lastModified: new Date(),

      changeFrequency: "daily",

      priority: 1,
    },

    {
      url: `${SITE_URL}/menu`,

      lastModified: new Date(),

      changeFrequency: "daily",

      priority: 0.9,
    },

    {
      url: `${SITE_URL}/food-page`,

      lastModified: new Date(),

      changeFrequency: "daily",

      priority: 0.8,
    },

    {
      url: `${SITE_URL}/about`,

      lastModified: new Date(),

      changeFrequency: "monthly",

      priority: 0.6,
    },
  ];

  /* -------------------------
     FOOD DETAIL PAGES
  ------------------------- */

  const foodPages: MetadataRoute.Sitemap = menuItems
    .filter((food) => Boolean(food.uuid))
    .map((food) => ({
      url: `${SITE_URL}${FOOD_PUBLIC_PATH}/${food.uuid}`,

      lastModified: safeDate(food.updatedAt),

      changeFrequency: "weekly" as const,

      priority: 0.8,
    }));

  /* -------------------------
     STORE DETAIL PAGES
  ------------------------- */

  const storePages: MetadataRoute.Sitemap = stores
    .filter((store) => Boolean(store.uuid))
    .map((store) => ({
      url: `${SITE_URL}${STORE_PUBLIC_PATH}/${store.uuid}`,

      lastModified: safeDate(store.updatedAt),

      changeFrequency: "weekly" as const,

      priority: 0.7,
    }));

  return [...staticPages, ...foodPages, ...storePages];
}

// import type { MetadataRoute } from "next";
// import { SITE_URL } from "@/lib/seo";

// const BACKEND_API_URL =
//   process.env.BACKEND_API_URL || "https://api.mhoubahar.store/api/v1";

// async function fetchJson<T>(url: string): Promise<T | null> {
//   try {
//     const res = await fetch(url, { next: { revalidate: 86400 } });
//     if (!res.ok) return null;
//     const json = await res.json();
//     return (json?.payload ?? json?.data ?? json) as T;
//   } catch {
//     return null;
//   }
// }

// function extractArray(data: unknown): unknown[] {
//   if (Array.isArray(data)) return data;
//   if (data && typeof data === "object") {
//     const d = data as Record<string, unknown>;
//     if (Array.isArray(d.content)) return d.content;
//     if (Array.isArray(d.contents)) return d.contents;
//   }
//   return [];
// }

// export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
//   const now = new Date();

//   // Static routes
//   const staticRoutes: MetadataRoute.Sitemap = [
//     { url: SITE_URL, lastModified: now, changeFrequency: "daily", priority: 1.0 },
//     { url: `${SITE_URL}/menu`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
//     { url: `${SITE_URL}/food-page`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
//     { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
//     { url: `${SITE_URL}/login`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
//     { url: `${SITE_URL}/register`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
//   ];

//   // Dynamic food items from live catalog
//   const foodData = await fetchJson<unknown>(
//     `${BACKEND_API_URL}/catalog/menu-items?page=0&size=500`,
//   );
//   const foodItems = extractArray(foodData) as Array<{
//     uuid: string;
//     updatedAt?: string;
//   }>;

//   const foodRoutes: MetadataRoute.Sitemap = foodItems
//     .filter((item) => item.uuid)
//     .map((item) => ({
//       url: `${SITE_URL}/menu/${item.uuid}`,
//       lastModified: item.updatedAt ? new Date(item.updatedAt) : now,
//       changeFrequency: "weekly" as const,
//       priority: 0.8,
//     }));

//   // Dynamic stores from live database
//   const storeData = await fetchJson<unknown>(
//     `${BACKEND_API_URL}/stores?page=0&size=500`,
//   );
//   const storeItems = extractArray(storeData) as Array<{
//     uuid: string;
//     updatedAt?: string;
//   }>;

//   const storeRoutes: MetadataRoute.Sitemap = storeItems
//     .filter((store) => store.uuid)
//     .map((store) => ({
//       url: `${SITE_URL}/stores/${store.uuid}`,
//       lastModified: store.updatedAt ? new Date(store.updatedAt) : now,
//       changeFrequency: "weekly" as const,
//       priority: 0.75,
//     }));

//   return [
//     ...staticRoutes,
//     ...foodRoutes,
//     ...storeRoutes,
//   ];
// }
