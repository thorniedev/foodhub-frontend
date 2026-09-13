import MenuPageClient from "./MenuPageClient";
import { BACKEND_API_URL } from "@/lib/seo";
import type { CatalogMenuItem } from "@/types/catalog-menu-item";
import type { DiscoveryFilterOptionsResponse } from "@/types/search";

async function getInitialMenuItems(): Promise<CatalogMenuItem[]> {
  try {
    const res = await fetch(
      `${BACKEND_API_URL}/catalog/menu-items?page=0&size=60`,
      {
        headers: { Accept: "application/json" },
        next: { revalidate: 120 },
      },
    );
    if (!res.ok) return [];
    const json = await res.json();
    const payload = json?.payload ?? json?.data ?? json;
    const items =
      payload?.contents ??
      payload?.content ??
      payload?.items ??
      (Array.isArray(payload) ? payload : []);
    return items as CatalogMenuItem[];
  } catch {
    return [];
  }
}

async function getInitialFilters(): Promise<DiscoveryFilterOptionsResponse | null> {
  try {
    const res = await fetch(`${BACKEND_API_URL}/discovery/menu-items/filters`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return (json?.payload ?? json?.data ?? json) as DiscoveryFilterOptionsResponse;
  } catch {
    return null;
  }
}

export const revalidate = 120;

export default async function FoodPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [initialMenuItems, initialFilters, resolvedSearchParams] =
    await Promise.all([
      getInitialMenuItems(),
      getInitialFilters(),
      searchParams,
    ]);

  return (
    <MenuPageClient
      initialMenuItems={initialMenuItems}
      initialFilters={initialFilters}
      searchParamsProp={resolvedSearchParams}
    />
  );
}
