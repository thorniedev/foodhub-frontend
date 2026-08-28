"use client";

import { useEffect, useMemo, useState } from "react";

import Link from "next/link";

import { AnimatePresence, motion } from "framer-motion";

import {
  IoArrowBack,
  IoCallOutline,
  IoFilterOutline,
  IoLocationOutline,
  IoMailOutline,
  IoRefreshOutline,
  IoSearchOutline,
  IoShieldCheckmarkOutline,
  IoTimeOutline,
} from "react-icons/io5";

import { FaStore } from "react-icons/fa";

import { useGetStoreByUuidQuery } from "@/app/store/locationApi";
import { useGetMenuItemsQuery } from "@/app/store/menuApi";
import { BookmarkButton } from "@/components/common/BookmarkButton";

import FoodCard from "@/components/dynamic-card/FoodCard";

import { resolveStoreMediaUrl } from "@/components/food-page/store/store-page-utils";

import {
  DEFAULT_STORE_MENU_FILTERS,
  applyStoreMenuFilters,
  buildStoreMenuFilterOptions,
  countActiveStoreMenuFilters,
  getStoreMenuItems,
} from "@/lib/store-menu-filter";

import type { FoodStoreDetail, StoreOpeningHour } from "@/types/store-page";

import type { StoreMenuFilterState } from "@/types/store-menu-filter";

import StoreMenuFilterSidebar from "./StoreMenuFilterSidebar";

type StoreDetailPageProps = {
  storeUuid: string;
};

function getStoreAddress(store: FoodStoreDetail): string {
  const values = [
    store.addressLine,
    store.commune,
    store.district,
    store.city,
    store.province,
  ]
    .map((value) => (typeof value === "string" ? value.trim() : ""))
    .filter(Boolean);

  return Array.from(new Set(values)).join(", ") || "មិនមានអាសយដ្ឋាន";
}

function formatPriceLevel(value: FoodStoreDetail["priceLevel"]): string | null {
  if (value === null || value === undefined || String(value).trim() === "") {
    return null;
  }

  if (typeof value === "number") {
    if (value <= 0) {
      return null;
    }

    return "$".repeat(Math.min(Math.max(Math.round(value), 1), 4));
  }

  return String(value);
}

function getCurrentStatusLabel(store: FoodStoreDetail): string {
  if (store.isOpenNow) {
    return "បើកឥឡូវនេះ";
  }

  return "បានបិទឥឡូវនេះ";
}

function getOperatingStatusLabel(value: string): string {
  switch (value.trim().toUpperCase()) {
    case "OPEN":
      return "កំពុងដំណើរការ";

    case "CLOSED":
      return "បានបិទ";

    case "TEMPORARILY_CLOSED":
      return "បិទជាបណ្ដោះអាសន្ន";

    case "PERMANENTLY_CLOSED":
      return "បិទជាអចិន្ត្រៃយ៍";

    default:
      return value;
  }
}

function formatHour(value: string | null): string {
  if (!value) {
    return "—";
  }

  const [hours, minutes] = value.split(":");

  if (hours === undefined || minutes === undefined) {
    return value;
  }

  return `${hours}:${minutes}`;
}

function getWeekdayLabel(dayOfWeek: number | null): string {
  switch (dayOfWeek) {
    case 1:
      return "ចន្ទ";
    case 2:
      return "អង្គារ";
    case 3:
      return "ពុធ";
    case 4:
      return "ព្រហស្បតិ៍";
    case 5:
      return "សុក្រ";
    case 6:
      return "សៅរ៍";
    case 7:
      return "អាទិត្យ";
    default:
      return "—";
  }
}

function groupOpeningHours(
  openingHours: StoreOpeningHour[],
): StoreOpeningHour[] {
  return [...openingHours].sort(
    (first, second) =>
      (first.dayOfWeek ?? 99) - (second.dayOfWeek ?? 99) ||
      first.intervalOrder - second.intervalOrder,
  );
}

function StoreMediaImage({
  mediaUuid,
  fallbackMediaUuid,
  alt,
  className,
}: {
  mediaUuid?: string | null;
  fallbackMediaUuid?: string | null;
  alt: string;
  className: string;
}) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    setImageUrl(null);
    setFailed(false);

    async function load() {
      let resolved = await resolveStoreMediaUrl(mediaUuid);

      if (!resolved && fallbackMediaUuid && fallbackMediaUuid !== mediaUuid) {
        resolved = await resolveStoreMediaUrl(fallbackMediaUuid);
      }

      if (!cancelled) {
        setImageUrl(resolved);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [mediaUuid, fallbackMediaUuid]);

  if (!imageUrl || failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`${className} flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50`}
      >
        <FaStore className="text-[46px] text-primary-300" />
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      draggable={false}
      onError={() => setFailed(true)}
      className={className}
    />
  );
}

function StoreHero({ store }: { store: FoodStoreDetail }) {
  const address = getStoreAddress(store);
  const priceLevel = formatPriceLevel(store.priceLevel);

  const hygiene =
    store.hygieneRating !== null && Number.isFinite(Number(store.hygieneRating))
      ? Number(store.hygieneRating).toFixed(1)
      : null;

  return (
    <section className="overflow-hidden rounded-[28px] border border-gray-100 bg-white shadow-sm">
      <div className="relative h-[260px] overflow-hidden sm:h-[320px] lg:h-[380px]">
        <StoreMediaImage
          mediaUuid={store.coverMediaUuid}
          fallbackMediaUuid={store.logoMediaUuid}
          alt={`${store.storeName} cover`}
          className="h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />

        {/* Top-Right Bookmark Button */}
        <div className="absolute right-4 top-4 z-10 sm:right-6 sm:top-6">
          <BookmarkButton
            storeUuid={store.uuid}
            showText={false}
            className="h-11 w-11 sm:h-12 sm:w-12 bg-white/90 text-gray-700 shadow-md backdrop-blur-md hover:bg-white hover:text-secondary-500 dark:bg-black/60 dark:text-gray-200 dark:hover:bg-black/80"
          />
        </div>

        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7 lg:p-8">
          <div className="flex items-end gap-4">
            <div className="relative hidden h-24 w-24 shrink-0 overflow-hidden rounded-[22px] border-4 border-white bg-white shadow-sm sm:block">
              <StoreMediaImage
                mediaUuid={store.logoMediaUuid}
                alt={`${store.storeName} logo`}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1.5 text-[16px] font-semibold ${
                    store.isOpenNow
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {getCurrentStatusLabel(store)}
                </span>

                <span className="rounded-full bg-white/90 px-3 py-1.5 text-[16px] font-semibold text-gray-700 backdrop-blur">
                  {getOperatingStatusLabel(store.operatingStatus)}
                </span>
              </div>

              <h4 className="truncate text-[30px] font-bold leading-tight text-white sm:text-[36px]">
                {store.storeName}
              </h4>

              <div className="mt-3 flex min-w-0 items-center gap-2 text-white/90">
                <IoLocationOutline className="shrink-0 text-[21px]" />

                <p className="truncate text-[18px]">{address}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[1fr_auto] lg:items-start lg:p-7">
        <div className="min-w-0">
          {store.description && (
            <p className="max-w-4xl text-[18px] leading-8 text-gray-600">
              {store.description}
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3 text-[18px] text-gray-600">
            {hygiene && (
              <span className="inline-flex items-center gap-2">
                <IoShieldCheckmarkOutline className="text-primary-700" />
                អនាម័យ {hygiene}
              </span>
            )}

            {priceLevel && (
              <span className="font-semibold text-primary-800">
                {priceLevel}
              </span>
            )}

            {store.phoneNumber && (
              <a
                href={`tel:${store.phoneNumber}`}
                className="inline-flex items-center gap-2 transition hover:text-primary-700"
              >
                <IoCallOutline />
                {store.phoneNumber}
              </a>
            )}

            {store.email && (
              <a
                href={`mailto:${store.email}`}
                className="inline-flex items-center gap-2 transition hover:text-primary-700"
              >
                <IoMailOutline />
                {store.email}
              </a>
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-primary-50 px-4 py-3 text-[18px] text-primary-800">
          <p className="font-semibold">{store.timezone || "Asia/Phnom_Penh"}</p>

          {store.countryCode && (
            <p className="mt-1 text-gray-500">{store.countryCode}</p>
          )}
        </div>
      </div>
    </section>
  );
}

function StoreOpeningHoursCard({ store }: { store: FoodStoreDetail }) {
  const schedules = groupOpeningHours(store.openingHours);

  if (schedules.length === 0) {
    return null;
  }

  return (
    <section className="rounded-[24px] border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-50 text-primary-700">
          <IoTimeOutline className="text-[23px]" />
        </span>

        <div>
          <p className="text-[22px] font-bold text-primary-900">ម៉ោងបើកបិទ</p>

          <p className="text-[18px] text-gray-400">កាលវិភាគប្រចាំសប្ដាហ៍</p>
        </div>
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {schedules.map((schedule, index) => (
          <div
            key={`${schedule.dayOfWeek}-${schedule.intervalOrder}-${index}`}
            className="flex items-center justify-between gap-3 rounded-xl bg-gray-50 px-3 py-2.5"
          >
            <span className="text-[18px] font-medium text-gray-600">
              {getWeekdayLabel(schedule.dayOfWeek)}
            </span>

            <span className="text-[18px] text-primary-800">
              {schedule.isClosed
                ? "បិទ"
                : `${formatHour(schedule.openingTime)}–${formatHour(
                    schedule.closingTime,
                  )}`}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function LoadingPage() {
  return (
    <main className="min-h-screen bg-[#f7f9f7]">
      <div className="mx-auto max-w-[1500px] space-y-6 px-4 py-8 sm:px-6">
        <div className="h-[330px] animate-pulse rounded-[28px] bg-gray-100" />

        <div className="flex gap-7">
          <div className="hidden h-[620px] w-[300px] animate-pulse rounded-[24px] bg-gray-100 xl:block" />

          <div className="grid flex-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({
              length: 6,
            }).map((_, index) => (
              <div
                key={index}
                className="h-[350px] animate-pulse rounded-[24px] bg-gray-100"
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function StoreDetailPage({ storeUuid }: StoreDetailPageProps) {
  const [filters, setFilters] = useState<StoreMenuFilterState>(
    DEFAULT_STORE_MENU_FILTERS,
  );

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const {
    data: store,
    isLoading: storeLoading,
    isFetching: storeFetching,
    isError: storeError,
    refetch: refetchStore,
  } = useGetStoreByUuidQuery(storeUuid, {
    skip: !storeUuid,
  });

  const {
    data: allMenuItems = [],
    isLoading: menuLoading,
    isFetching: menuFetching,
    isError: menuError,
    refetch: refetchMenu,
  } = useGetMenuItemsQuery();

  const storeMenuItems = useMemo(() => {
    const canonicalStoreUuid = store?.uuid?.trim() || storeUuid.trim();

    return getStoreMenuItems(
      allMenuItems,
      canonicalStoreUuid,
      store?.storeName,
    );
  }, [allMenuItems, store?.uuid, store?.storeName, storeUuid]);

  const filterOptions = useMemo(
    () => buildStoreMenuFilterOptions(storeMenuItems),
    [storeMenuItems],
  );

  const filteredMenuItems = useMemo(
    () => applyStoreMenuFilters(storeMenuItems, filters),
    [storeMenuItems, filters],
  );

  const activeFilterCount = countActiveStoreMenuFilters(filters);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") {
      return;
    }

    const loadedStoreUuids = Array.from(
      new Set(
        allMenuItems
          .map((item) => item.store?.uuid?.trim())
          .filter((value): value is string => Boolean(value)),
      ),
    );

    console.log("[STORE DETAIL MENU DEBUG]", {
      routeStoreUuid: storeUuid,
      detailStoreUuid: store?.uuid,
      detailStoreName: store?.storeName,
      allMenuItemsCount: allMenuItems.length,
      storeMenuItemsCount: storeMenuItems.length,
      filteredMenuItemsCount: filteredMenuItems.length,
      loadedStoreUuids,
    });
  }, [
    allMenuItems,
    filteredMenuItems.length,
    store?.storeName,
    store?.uuid,
    storeMenuItems.length,
    storeUuid,
  ]);

  useEffect(() => {
    if (!mobileFiltersOpen) {
      return;
    }

    const previous = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileFiltersOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previous;

      window.removeEventListener("keydown", handleEscape);
    };
  }, [mobileFiltersOpen]);

  if (storeLoading || menuLoading) {
    return <LoadingPage />;
  }

  if (storeError || menuError || !store) {
    return (
      <main className="min-h-screen bg-white ">
        <div className="mx-auto flex min-h-[650px] max-w-3xl flex-col items-center justify-center px-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500">
            <FaStore className="text-[30px]" />
          </div>

          <h4 className="mt-5 text-[28px] font-bold text-primary-900">
            មិនអាចបង្ហាញព័ត៌មានហាងបានទេ
          </h4>

          <p className="mt-2 text-[18px] leading-8 text-gray-500">
            សូមព្យាយាមទាញយកព័ត៌មានហាង និងមុខម្ហូបម្តងទៀត។
          </p>

          <button
            type="button"
            onClick={() => {
              void refetchStore();
              void refetchMenu();
            }}
            className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-full bg-primary-800 px-6 text-[18px] font-semibold text-white transition hover:bg-primary-700"
          >
            <IoRefreshOutline className="text-[21px]" />
            ព្យាយាមម្តងទៀត
          </button>
        </div>
      </main>
    );
  }

  const busy = storeFetching || menuFetching;

  return (
    <main className="min-h-screen  pb-14">
      <div className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:py-8">
        {/* Back */}

        <Link
          href="/food"
          className="mb-5 inline-flex items-center gap-2 text-[18px] font-medium text-gray-500 transition hover:text-primary-800"
        >
          <IoArrowBack className="text-[21px]" />
          ត្រឡប់ទៅរកអាហារ
        </Link>

        <div className="space-y-6">
          <StoreHero store={store} />

          <StoreOpeningHoursCard store={store} />

          {/* Menu heading/search */}

          <section className="rounded-[24px] border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-[18px] font-semibold text-secondary-500">
                  ម៉ឺនុយហាង
                </p>

                <p className="mt-1 text-[26px] font-bold text-primary-900">
                  មុខម្ហូបនៅ {store.storeName}
                </p>

                <p className="mt-1 text-[18px] text-gray-400">
                  បង្ហាញ {filteredMenuItems.length} ក្នុងចំណោម{" "}
                  {storeMenuItems.length} មុខម្ហូប
                </p>
              </div>

              <div className="flex min-w-0 flex-1 gap-3 lg:max-w-[650px]">
                <div className="flex min-h-[56px] min-w-0 flex-1 items-center gap-3 rounded-full border border-[#e4e4e7] bg-white px-5 transition focus-within:border-primary-800 focus-within:ring-4 focus-within:ring-primary-50">
                  <IoSearchOutline className="shrink-0 text-[22px] text-primary-800" />

                  <input
                    type="search"
                    value={filters.query}
                    onChange={(event) =>
                      setFilters({
                        ...filters,
                        query: event.target.value,
                      })
                    }
                    placeholder="ស្វែងរកម្ហូបក្នុងហាងនេះ..."
                    className="min-w-0 flex-1 bg-transparent text-[18px] text-gray-700 outline-none placeholder:text-gray-400"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(true)}
                  className="relative flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-full bg-primary-800 text-white shadow-sm transition hover:bg-primary-700 xl:hidden"
                  aria-label="Open menu filters"
                >
                  <IoFilterOutline className="text-[23px]" />

                  {activeFilterCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-secondary-500 px-1 text-[14px] font-bold text-white">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </section>

          {/* Filter + menu cards */}

          <div className="flex min-w-0 items-start gap-7">
            <StoreMenuFilterSidebar
              filters={filters}
              options={filterOptions}
              onChange={setFilters}
            />

            <section className="min-w-0 flex-1">
              {busy && (
                <div className="mb-4 rounded-xl bg-primary-50 px-4 py-3 text-[18px] text-primary-700">
                  កំពុងធ្វើបច្ចុប្បន្នភាពទិន្នន័យ...
                </div>
              )}

              {storeMenuItems.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-gray-200 bg-white px-5 py-14 text-center shadow-sm">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 text-primary-700">
                    <FaStore className="text-[27px]" />
                  </div>

                  <h3 className="mt-4 text-[22px] font-bold text-primary-900">
                    ហាងនេះមិនទាន់មានមុខម្ហូប
                  </h3>

                  <p className="mx-auto mt-2 max-w-xl text-[18px] leading-8 text-gray-500">
                    មិនមាន Menu Item ណាមួយក្នុងទិន្នន័យដែលភ្ជាប់ជាមួយហាងនេះទេ។
                  </p>

                  {process.env.NODE_ENV === "development" && (
                    <div className="mx-auto mt-5 max-w-2xl rounded-2xl bg-gray-50 p-4 text-left text-[16px] leading-7 text-gray-500">
                      <p>Store UUID: {store.uuid}</p>
                      <p>Loaded menu items: {allMenuItems.length}</p>
                      <p>Check Console: [STORE DETAIL MENU DEBUG]</p>
                    </div>
                  )}
                </div>
              ) : filteredMenuItems.length > 0 ? (
                <motion.div
                  layout
                  className="grid gap-5 sm:grid-cols-2 2xl:grid-cols-3"
                >
                  <AnimatePresence>
                    {filteredMenuItems.map((food) => (
                      <motion.div
                        layout
                        key={food.uuid}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                      >
                        <FoodCard food={food} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <div className="rounded-[24px] border border-dashed border-gray-200 bg-white px-5 py-14 text-center shadow-sm">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 text-primary-700">
                    <IoSearchOutline className="text-[28px]" />
                  </div>

                  <h3 className="mt-4 text-[22px] font-bold text-primary-900">
                    មិនមានមុខម្ហូបត្រូវនឹងតម្រង
                  </h3>

                  <p className="mx-auto mt-2 max-w-xl text-[18px] leading-8 text-gray-500">
                    ហាងនេះមាន {storeMenuItems.length} មុខម្ហូប
                    ប៉ុន្តែតម្រងបច្ចុប្បន្នបានដកលទ្ធផលទាំងអស់ចេញ។
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      setFilters({
                        ...DEFAULT_STORE_MENU_FILTERS,
                        query: "",
                      })
                    }
                    className="mt-5 rounded-full bg-primary-800 px-5 py-3 text-[18px] font-semibold text-white transition hover:bg-primary-700"
                  >
                    សម្អាតតម្រងទាំងអស់
                  </button>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}

      <AnimatePresence>
        {mobileFiltersOpen && (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            className="fixed inset-0 z-[120] xl:hidden"
          >
            <button
              type="button"
              aria-label="Close menu filters"
              onClick={() => setMobileFiltersOpen(false)}
              className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
            />

            <motion.div
              initial={{
                y: "100%",
              }}
              animate={{
                y: 0,
              }}
              exit={{
                y: "100%",
              }}
              transition={{
                type: "spring",
                stiffness: 320,
                damping: 32,
              }}
              className="absolute inset-x-0 bottom-0 h-[90dvh] overflow-hidden rounded-t-[28px] bg-white sm:left-auto sm:h-full sm:w-[390px] sm:rounded-none sm:rounded-l-[28px]"
            >
              <StoreMenuFilterSidebar
                mobile
                filters={filters}
                options={filterOptions}
                onChange={setFilters}
                onClose={() => setMobileFiltersOpen(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
