import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

const BACKEND_API_URL =
  process.env.BACKEND_API_URL || "https://api.mhoubahar.store/api/v1";

export const revalidate = 86400;

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(url, {
      signal: controller.signal,
      next: { revalidate: 86400 },
    }).finally(() => clearTimeout(timeoutId));
    if (!res.ok) return null;
    const json = await res.json();
    return (json?.payload ?? json?.data ?? json) as T;
  } catch {
    return null;
  }
}

function extractArray(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    const d = data as Record<string, unknown>;
    if (Array.isArray(d.content)) return d.content;
    if (Array.isArray(d.contents)) return d.contents;
  }
  return [];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${SITE_URL}/menu`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/food-page`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/login`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${SITE_URL}/register`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
  ];

  // Dynamic food items from live catalog
  const foodData = await fetchJson<unknown>(
    `${BACKEND_API_URL}/catalog/menu-items?page=0&size=500`,
  );
  const foodItems = extractArray(foodData) as Array<{
    uuid: string;
    updatedAt?: string;
  }>;

  const foodRoutes: MetadataRoute.Sitemap = foodItems
    .filter((item) => item.uuid)
    .map((item) => ({
      url: `${SITE_URL}/menu/${item.uuid}`,
      lastModified: item.updatedAt ? new Date(item.updatedAt) : now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

  // Dynamic stores from live database
  const storeData = await fetchJson<unknown>(
    `${BACKEND_API_URL}/stores?page=0&size=500`,
  );
  const storeItems = extractArray(storeData) as Array<{
    uuid: string;
    updatedAt?: string;
  }>;

  const storeRoutes: MetadataRoute.Sitemap = storeItems
    .filter((store) => store.uuid)
    .map((store) => ({
      url: `${SITE_URL}/stores/${store.uuid}`,
      lastModified: store.updatedAt ? new Date(store.updatedAt) : now,
      changeFrequency: "weekly" as const,
      priority: 0.75,
    }));

  return [
    ...staticRoutes,
    ...foodRoutes,
    ...storeRoutes,
  ];
}
