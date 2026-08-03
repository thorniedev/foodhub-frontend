"use client";

import {
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { AnimatePresence, motion } from "framer-motion";

import { IoFilterOutline, IoRefreshOutline } from "react-icons/io5";

import { useGetStoresQuery } from "@/app/store/locationApi";

import type { MenuItem } from "@/types/manu";
import type { FoodStore, StorePageFilters } from "@/types/store-page";

import StoreFilters from "./StoreFilters";
import StoreGrid from "./StoreGrid";

import {
  DEFAULT_STORE_FILTERS,
  applyStoreFilters,
  countActiveStoreFilters,
  getStoreFilterOptions,
} from "./store-page-utils";

type StoreContentProps = {
  /**
   * Kept for compatibility with the current parent.
   * Store cards no longer read store data from menuItems.
   */
  menuItems?: MenuItem[];

  searchQuery?: string;
  onClearSearch?: () => void;
};

function QuickFilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full border px-4 py-2.5 text-[16px] font-semibold transition ${
        active
          ? "border-primary-800 bg-primary-800 text-white shadow-sm"
          : "border-gray-200 bg-white text-gray-600 hover:border-primary-300 hover:bg-primary-50"
      }`}
    >
      {children}
    </button>
  );
}

export default function StoreContent({
  searchQuery = "",
  onClearSearch,
}: StoreContentProps) {
  const deferredSearchQuery = useDeferredValue(searchQuery);

  const [filters, setFilters] = useState<StorePageFilters>(
    DEFAULT_STORE_FILTERS,
  );

  const [filtersOpen, setFiltersOpen] = useState(false);

  const {
    data: storeData = [],
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetStoresQuery();

  const stores = storeData as FoodStore[];

  const cityOptions = useMemo(
    () => getStoreFilterOptions(stores, (store) => store.city),
    [stores],
  );

  const districtOptions = useMemo(
    () => getStoreFilterOptions(stores, (store) => store.district),
    [stores],
  );

  const provinceOptions = useMemo(
    () => getStoreFilterOptions(stores, (store) => store.province),
    [stores],
  );

  const operatingStatusOptions = useMemo(
    () => getStoreFilterOptions(stores, (store) => store.operatingStatus),
    [stores],
  );

  const priceLevelOptions = useMemo(
    () => getStoreFilterOptions(stores, (store) => store.priceLevel),
    [stores],
  );

  const filteredStores = useMemo(
    () => applyStoreFilters(stores, deferredSearchQuery, filters),
    [stores, deferredSearchQuery, filters],
  );

  const activeFilterCount = countActiveStoreFilters(filters);

  useEffect(() => {
    if (!filtersOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setFiltersOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;

      window.removeEventListener("keydown", handleEscape);
    };
  }, [filtersOpen]);

  const resetAll = () => {
    setFilters(DEFAULT_STORE_FILTERS);
    onClearSearch?.();
  };

  const filterProps = {
    filters,
    onChange: setFilters,
    cityOptions,
    districtOptions,
    provinceOptions,
    operatingStatusOptions,
    priceLevelOptions,
  };

  if (isLoading || isFetching) {
    return (
      <div className="mt-6 space-y-5">
        <div className="h-32 animate-pulse rounded-[24px] bg-gray-100" />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({
            length: 6,
          }).map((_, index) => (
            <div
              key={index}
              className="h-80 animate-pulse rounded-[20px] bg-gray-100"
            />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mt-6 rounded-[24px] border border-red-100 bg-white px-5 py-14 text-center shadow-sm">
        <h2 className="text-[21px] font-semibold text-primary-900">
          មិនអាចទាញយកទិន្នន័យហាងបានទេ
        </h2>

        <p className="mx-auto mt-2 max-w-lg text-[16px] leading-7 text-gray-500">
          សូមពិនិត្យឯកសារ public/data/stores.json ហើយព្យាយាមម្តងទៀត។
        </p>

        <button
          type="button"
          onClick={() => void refetch()}
          className="mt-5 min-h-12 rounded-full bg-primary-800 px-6 text-[16px] font-semibold text-white transition hover:bg-primary-700"
        >
          ព្យាយាមម្តងទៀត
        </button>
      </div>
    );
  }

  return (
    <motion.section
      key="store-dashboard"
      initial={{
        opacity: 0,
        y: 16,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
        y: -16,
      }}
      transition={{
        duration: 0.25,
        ease: "easeOut",
      }}
      className="mt-6 min-w-0"
    >
      <div
        className="
      flex min-w-0 flex-col gap-6
      xl:flex-row
      xl:items-start
      xl:gap-8
    "
      >
        {/* Sticky desktop filter with its own scrollbar */}
        <aside
          className="
        hidden shrink-0 self-start
        xl:sticky
        xl:top-24
        xl:block
        xl:h-[calc(100dvh-7rem)]
        xl:max-h-[calc(100dvh-7rem)]
        xl:overflow-hidden
      "
        >
          <StoreFilters {...filterProps} />
        </aside>

        {/* Store content uses normal browser scrolling */}
        <main className="min-w-0 flex-1">
          {/* <section className="rounded-[24px] border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-[16px] font-semibold text-secondary-500">
                  ជម្រើសហាងអាហារ
                </p>

                <h2 className="mt-1 text-[25px] font-bold text-primary-900 sm:text-[28px]">
                  ហាងដែលអាចរកបាន
                </h2>

                <p className="mt-2 text-[16px] leading-7 text-gray-500">
                  ទិន្នន័យទាំងនេះត្រូវបានទាញយកពី stores.json ដោយផ្ទាល់។
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="rounded-2xl bg-primary-50 px-4 py-3">
                  <p className="text-[16px] text-primary-700">លទ្ធផល</p>

                  <p className="mt-1 text-[22px] font-bold text-primary-900">
                    {filteredStores.length}

                    <span className="ml-1 text-[16px] font-medium text-gray-500">
                      / {stores.length}
                    </span>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setFiltersOpen(true)}
                  className="
                flex min-h-12 items-center justify-center gap-2
                rounded-2xl bg-primary-800 px-5
                text-[16px] font-semibold text-white
                transition hover:bg-primary-700
                xl:hidden
              "
                >
                  <IoFilterOutline className="text-[21px]" />
                  តម្រង
                  {activeFilterCount > 0 && (
                    <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-secondary-500 px-1.5 text-[16px] font-bold text-white">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                {(activeFilterCount > 0 || searchQuery) && (
                  <button
                    type="button"
                    onClick={resetAll}
                    className="
                  flex min-h-12 items-center justify-center gap-2
                  rounded-2xl border border-secondary-200 px-4
                  text-[16px] font-semibold text-secondary-500
                  transition hover:bg-secondary-50
                "
                  >
                    <IoRefreshOutline className="text-[20px]" />
                    សម្អាត
                  </button>
                )}
              </div>
            </div>

            <div className="scrollbar-hide mt-5 flex gap-2.5 overflow-x-auto pb-1">
              <QuickFilterButton
                active={filters.activeOnly}
                onClick={() =>
                  setFilters((current) => ({
                    ...current,
                    activeOnly: !current.activeOnly,
                  }))
                }
              >
                គណនីសកម្ម
              </QuickFilterButton>

              <QuickFilterButton
                active={filters.approvedOnly}
                onClick={() =>
                  setFilters((current) => ({
                    ...current,
                    approvedOnly: !current.approvedOnly,
                  }))
                }
              >
                បានអនុម័ត
              </QuickFilterButton>

              <QuickFilterButton
                active={filters.openNowOnly}
                onClick={() =>
                  setFilters((current) => ({
                    ...current,
                    openNowOnly: !current.openNowOnly,
                  }))
                }
              >
                បើកឥឡូវនេះ
              </QuickFilterButton>

              <QuickFilterButton
                active={filters.cities.includes("Phnom Penh")}
                onClick={() =>
                  setFilters((current) => ({
                    ...current,
                    cities: current.cities.includes("Phnom Penh")
                      ? current.cities.filter((city) => city !== "Phnom Penh")
                      : [...current.cities, "Phnom Penh"],
                  }))
                }
              >
                Phnom Penh
              </QuickFilterButton>
            </div>
          </section> */}

          <div className="mt-6 pb-10">
            <StoreGrid stores={filteredStores} onReset={resetAll} />
          </div>
        </main>
      </div>

      {/* Mobile and tablet filter drawer */}
      <AnimatePresence>
        {filtersOpen && (
          <motion.div
            key="store-filter-drawer"
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            transition={{
              duration: 0.2,
            }}
            className="fixed inset-0 z-[100] xl:hidden"
          >
            <motion.button
              type="button"
              aria-label="Close store filters"
              onClick={() => setFiltersOpen(false)}
              className="absolute inset-0 cursor-default bg-black/45 backdrop-blur-[2px]"
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Store filters"
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
              className="
            absolute inset-x-0 bottom-0
            h-[88dvh] overflow-hidden
            rounded-t-[30px] bg-white shadow-2xl

            md:bottom-auto
            md:left-0
            md:right-auto
            md:top-0
            md:h-full
            md:w-[370px]
            md:rounded-none
            md:rounded-r-[30px]
          "
            >
              <StoreFilters
                {...filterProps}
                onClose={() => setFiltersOpen(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
