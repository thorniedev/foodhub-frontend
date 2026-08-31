import type { MetadataRoute } from "next";
import { SITE_URL, FOOD_PUBLIC_PATH, STORE_PUBLIC_PATH } from "@/lib/seo";

/* =========================================================
   BACKEND URL
   Always use a hardcoded HTTPS fallback so the build never
   receives an invalid/empty URL from a missing env var.
   The imported BACKEND_API_URL from seo.ts can still be
   undefined in Vercel's GitHub Action build because the env
   var is only injected at runtime, not build-time.
========================================================= */

const BACKEND_BASE = (() => {
  const raw = process.env.BACKEND_API_URL?.trim();
  if (raw && (raw.startsWith("http://") || raw.startsWith("https://"))) {
    return raw.replace(/\/+$/, "");
  }
  return "https://api.mhoubahar.store/api/v1";
})();

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
  if (!json) return [];
  if (Array.isArray(json)) return json as T[];
  if (typeof json !== "object") return [];

  const response = json as {
    payload?: unknown;
    data?: unknown;
    content?: unknown;
  };

  const root = response.payload ?? response.data ?? response.content ?? json;

  if (Array.isArray(root)) return root as T[];

  if (root && typeof root === "object") {
    const nested = root as {
      content?: unknown;
      items?: unknown;
      results?: unknown;
    };
    if (Array.isArray(nested.content)) return nested.content as T[];
    if (Array.isArray(nested.items)) return nested.items as T[];
    if (Array.isArray(nested.results)) return nested.results as T[];
  }

  return [];
}

/* =========================================================
   DATE
========================================================= */

function safeDate(value: string | null | undefined): Date {
  if (!value) return new Date();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

/* =========================================================
   SAFE FETCH HELPER
   • Validates the URL before fetching (prevents build crash)
   • Times out after 15 seconds so the sitemap never blocks
     the build for 60+ seconds
========================================================= */

async function safeFetch(url: string): Promise<unknown> {
  // Guard: Validate URL before fetching
  try {
    new URL(url);
  } catch {
    console.error("[Sitemap] Invalid URL skipped:", url);
    return null;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
      // Revalidate cached response every hour
      next: { revalidate: 3600 },
    });

    clearTimeout(timeout);

    if (!response.ok) {
      console.error("[Sitemap] API returned", response.status, url);
      return null;
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeout);
    if ((error as Error)?.name === "AbortError") {
      console.error("[Sitemap] Fetch timed out (15s):", url);
    } else {
      console.error("[Sitemap] Fetch error:", url, error);
    }
    return null;
  }
}

/* =========================================================
   MENU ITEMS
========================================================= */

async function fetchMenuItems(): Promise<SitemapMenuItem[]> {
  const json = await safeFetch(
    `${BACKEND_BASE}/catalog/menu-items?page=0&size=1000`,
  );
  return extractContent<SitemapMenuItem>(json);
}

/* =========================================================
   STORES
========================================================= */

async function fetchStores(): Promise<SitemapStore[]> {
  const json = await safeFetch(`${BACKEND_BASE}/stores?page=0&size=1000`);
  return extractContent<SitemapStore>(json);
}

/* =========================================================
   SITEMAP
   Run dynamic fetches in parallel but each is time-bounded.
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
    {
      url: `${SITE_URL}/stores`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.85,
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
