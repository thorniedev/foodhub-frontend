"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import {
  FaArrowLeft,
  FaMapMarkerAlt,
  FaPhone,
  FaSearch,
  FaStar,
  FaStore,
} from "react-icons/fa";
import { IoTimeOutline } from "react-icons/io5";

import { useGetMenuItemsQuery } from "@/app/store/menuApi";
import { useGetStoreByUuidQuery } from "@/app/store/locationApi";
import type { CatalogMenuItem } from "@/types/catalog-menu-item";
import type { FoodStore } from "@/types/store-page";

const FALLBACK_IMAGE = "/Image/default-avatar.png";

type StoreCategory = { key: string; label: string; items: CatalogMenuItem[] };

function imageUrl(value: string | null | undefined): string {
  const valueText = value?.trim();
  if (!valueText) return FALLBACK_IMAGE;
  return valueText.startsWith("/") || valueText.startsWith("http")
    ? valueText
    : `/${valueText}`;
}

function getCategories(
  items: CatalogMenuItem[],
  storeUuid: string,
): StoreCategory[] {
  const groups = new Map<string, StoreCategory>();

  items
    .filter((item) => item.store?.uuid === storeUuid)
    .forEach((item) => {
      const sourceKey = String(item.filterData?.category?.code || "other");
      const category = groups.get(sourceKey) ?? {
        key: sourceKey.replace(/[^a-zA-Z0-9_-]/g, "-") || "other",
        label: item.filterData?.category?.name || "មុខម្ហូបផ្សេងៗ",
        items: [],
      };
      category.items.push(item);
      groups.set(sourceKey, category);
    });

  return [...groups.values()];
}

function StoreHeader({ store }: { store: FoodStore }) {
  const isOpen =
    store.isOpenNow === true ||
    String(store.operatingStatus).toUpperCase() === "OPEN";
  const address = [store.addressLine, store.commune, store.district, store.city]
    .filter(Boolean)
    .join(", ");
  const openingHour = store.openingHours.find((hour) => !hour.isClosed);

  return (
    <section className="overflow-hidden rounded-[32px] border border-gray-100 bg-white shadow-sm">
      <div className="relative h-56 bg-primary-50 sm:h-72">
        <Image
          src={imageUrl(store.coverImageUrl || store.logoUrl)}
          alt={`${store.storeName} cover`}
          fill
          unoptimized
          sizes="(max-width: 768px) 100vw, 80vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
        <div className="absolute bottom-5 left-5 right-5 flex items-end gap-4 text-white sm:bottom-7 sm:left-7 sm:right-7">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border-2 border-white bg-white sm:h-20 sm:w-20">
            <Image
              src={imageUrl(store.logoUrl)}
              alt={`${store.storeName} logo`}
              fill
              unoptimized
              sizes="80px"
              className="object-contain p-1"
            />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-bold sm:text-4xl">
              {store.storeName}
            </h1>
            <p className="mt-1 truncate text-sm text-white/85">
              {store.description || "FoodHub store"}
            </p>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3 px-5 py-4 text-sm text-gray-600 sm:px-7">
        <span className="inline-flex items-center gap-1.5 text-accent-500">
          <FaStar /> {Number(store.averageRating || 0).toFixed(1)} (
          {store.totalReviews || 0})
        </span>
        <span
          className={`inline-flex items-center gap-1.5 font-semibold ${isOpen ? "text-emerald-600" : "text-red-500"}`}
        >
          <IoTimeOutline /> {isOpen ? "បើកឥឡូវនេះ" : "បានបិទ"}
        </span>
        {openingHour && (
          <span>
            {openingHour.openTime || "08:00"} -
            {openingHour.closeTime || "21:00"}
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-4 border-t border-gray-100 px-5 py-4 text-sm text-gray-500 sm:px-7">
        {address && (
          <span className="inline-flex items-center gap-2">
            <FaMapMarkerAlt className="text-primary-500" /> {address}
          </span>
        )}
        {store.phoneNumber && (
          <span className="inline-flex items-center gap-2">
            <FaPhone className="text-primary-500" /> {store.phoneNumber}
          </span>
        )}
      </div>
    </section>
  );
}

function StoreMenuSection({
  category,
  rating,
}: {
  category: StoreCategory;
  rating: number;
}) {
  return (
    <section
      id={`store-menu-${category.key}`}
      className="scroll-mt-28 border-t border-gray-100 pt-8 first:border-t-0 first:pt-0"
    >
      <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-orange-500 sm:text-2xl">
        <FaStore /> {category.label}
      </h2>
      <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 no-scrollbar">
        {category.items.map((item) => (
          <article
            key={item.uuid}
            className="w-[210px] shrink-0 overflow-hidden rounded-[24px] border border-gray-100 bg-white p-2.5 shadow-sm transition hover:-translate-y-1 hover:shadow-md sm:w-[230px]"
          >
            <div className="relative h-40 overflow-hidden rounded-[14px] bg-primary-50 sm:h-44">
              <Image
                src={imageUrl(item.thumbnail)}
                alt={item.localName || item.name}
                fill
                unoptimized
                sizes="230px"
                className="object-cover"
              />
              {item.isFeatured && (
                <span className="absolute left-2 top-2 rounded-full bg-secondary-500 px-2.5 py-1 text-xs font-bold text-white">
                  ពេញនិយម
                </span>
              )}
            </div>
            <div className="px-1 pb-1 pt-3">
              <p className="line-clamp-1 text-base font-semibold text-primary-900">
                {item.localName || item.name}
              </p>
              <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1 text-accent-500">
                  <FaStar /> {rating.toFixed(1)}
                </span>
                <span>{Number(item.preparationTimeMinutes) || 0} min</span>
              </div>
              <p className="mt-2 text-lg font-bold text-primary-800 dark:text-primary-dark">
                {Number(item.price || 0).toFixed(2)}
                {item.currencyCode || "USD"}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function CategoryNavigation({ categories }: { categories: StoreCategory[] }) {
  return (
    <aside className="hidden h-max w-56 shrink-0 rounded-3xl border border-gray-100 bg-white p-4 shadow-sm lg:sticky lg:top-24 lg:block">
      <h2 className="px-2 pb-3 text-lg font-bold text-primary-900">
        ប្រភេទមុខម្ហូប
      </h2>
      <nav className="flex flex-col gap-1" aria-label="ប្រភេទមុខម្ហូប">
        {categories.map((category) => (
          <a
            key={category.key}
            href={`#store-menu-${category.key}`}
            className="rounded-2xl px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-primary-50 hover:text-primary-800 dark:text-primary-dark"
          >
            {category.label}
          </a>
        ))}
      </nav>
    </aside>
  );
}

export default function StoreDetailPage() {
  const { id: storeUuid } = useParams<{ id: string }>();
  const [query, setQuery] = useState("");
  const { data: store, isLoading: storeLoading } = useGetStoreByUuidQuery(
    storeUuid,
    { skip: !storeUuid },
  );
  const { data: menuItems = [], isLoading: menuLoading } =
    useGetMenuItemsQuery();

  const categories = useMemo(
    () => (store ? getCategories(menuItems, store.uuid) : []),
    [menuItems, store],
  );
  const filteredCategories = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return categories;
    return categories
      .map((category) => ({
        ...category,
        items: category.items.filter((item) =>
          `${item.name} ${item.localName || ""}`.toLowerCase().includes(search),
        ),
      }))
      .filter((category) => category.items.length > 0);
  }, [categories, query]);

  if (storeLoading || menuLoading)
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-zinc-50 text-gray-400">
        កំពុងផ្ទុកព័ត៌មានហាង...
      </main>
    );

  if (!store)
    return (
      <main className="flex min-h-[70vh] flex-col items-center justify-center gap-4 bg-zinc-50 px-4 text-center">
        <p className="text-lg font-semibold text-gray-600">រកមិនឃើញហាងនេះទេ</p>
        <Link
          href="/food"
          className="rounded-full bg-primary-800 px-6 py-2.5 font-semibold text-white"
        >
          ត្រឡប់ទៅបញ្ជីហាង
        </Link>
      </main>
    );

  return (
    <main className="min-h-screen bg-zinc-50 pt-14">
      <div className="mx-auto max-w-360 px-4 py-6 sm:px-6">
        <Link
          href="/food"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-primary-800 dark:text-primary-dark hover:text-primary-600"
        >
          <FaArrowLeft /> ត្រឡប់ទៅបញ្ជីហាង
        </Link>
        <div className="mb-6 flex gap-2 overflow-x-auto pb-1 no-scrollbar lg:hidden">
          {filteredCategories.map((category) => (
            <a
              key={category.key}
              href={`#store-menu-${category.key}`}
              className="shrink-0 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-600"
            >
              {category.label}
            </a>
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-[224px_1fr] lg:items-start lg:gap-8">
          <CategoryNavigation categories={filteredCategories} />
          <div className="flex min-w-0 flex-col gap-6">
            <StoreHeader store={store} />
            <div className="relative">
              <FaSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                type="search"
                placeholder="ស្វែងរកមុខម្ហូបក្នុងហាង..."
                aria-label="ស្វែងរកមុខម្ហូបក្នុងហាង"
                className="h-12 w-full rounded-full border border-gray-200 bg-white pl-11 pr-4 text-sm text-gray-700 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
              />
            </div>
            {filteredCategories.length > 0 ? (
              filteredCategories.map((category) => (
                <StoreMenuSection
                  key={category.key}
                  category={category}
                  rating={Number(store.averageRating) || 0}
                />
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-gray-200 bg-white px-5 py-12 text-center text-gray-500">
                រកមិនឃើញមុខម្ហូបក្នុងហាងនេះទេ
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
