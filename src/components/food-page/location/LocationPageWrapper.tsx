"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { IoSearchOutline } from "react-icons/io5";

import { useGetMenuItemsQuery } from "@/app/store/menuApi";

import LocationContent from "@/components/food-page/location/LocationContent";
import FoodNavTabs from "@/components/food-page/FoodNavTabs";
import type { RecommendationMode } from "@/types/location";

interface LocationPageWrapperProps {
  mode: RecommendationMode;
}

export default function LocationPageWrapper({ mode }: LocationPageWrapperProps) {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const {
    data: menuItems = [],
    isLoading,
    isFetching,
  } = useGetMenuItemsQuery();

  /* Debounce the search input */
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedQuery(searchInput);
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [searchInput]);

  const handleModeChange = (newMode: RecommendationMode) => {
    if (newMode === "me") {
      router.push("/menu/location");
    } else if (newMode === "single") {
      router.push("/menu/location/friends");
    } else if (newMode === "group") {
      router.push("/menu/location/group");
    }
  };

  if (isLoading || isFetching) {
    return (
      <>
        {/* Top bar skeleton */}
        <div className="sticky top-16 z-30 w-full border-b border-gray-100 bg-white/85 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/85">
          <div className="mx-auto flex w-full max-w-7xl px-4 py-3 sm:px-6 flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex gap-2 w-full lg:w-auto">
              <div className="h-11 w-24 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse" />
              <div className="h-11 w-24 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse" />
              <div className="h-11 w-24 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse" />
            </div>

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center flex-1 w-full lg:w-auto">
              <div className="h-14 w-full flex-1 rounded-2xl lg:rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse" />
              <div className="hidden lg:block h-14 w-32 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse" />
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 pb-20 pt-2 sm:px-6">
          <section className="mt-6 min-w-0 text-[17px]">
            <div className="flex min-w-0 items-start gap-7">
              {/* Sidebar Skeleton */}
              <div className="sticky top-28 hidden h-[calc(100dvh-8rem)] shrink-0 self-start overflow-hidden xl:block w-[300px] rounded-[24px] border border-gray-100 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm animate-pulse">
                <div className="p-4 space-y-6">
                  <div className="h-6 w-32 bg-gray-200 dark:bg-gray-800 rounded-md" />
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="space-y-3">
                      <div className="h-5 w-24 bg-gray-200 dark:bg-gray-800 rounded-md" />
                      <div className="flex flex-wrap gap-2">
                        <div className="h-9 w-20 bg-gray-200 dark:bg-gray-800 rounded-full" />
                        <div className="h-9 w-24 bg-gray-200 dark:bg-gray-800 rounded-full" />
                        <div className="h-9 w-16 bg-gray-200 dark:bg-gray-800 rounded-full" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Main Content Skeleton */}
              <main className="min-w-0 flex-1">
                {/* Unified LocationHeader Skeleton */}
                <div className="rounded-[24px] border border-gray-100 bg-white p-4 sm:p-5 lg:p-6 shadow-sm animate-pulse dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-3">
                       <div className="h-6 w-24 rounded-md bg-gray-200 dark:bg-gray-800" />
                       <div className="h-8 w-48 rounded-md bg-gray-200 dark:bg-gray-800" />
                       <div className="h-5 w-64 rounded-md bg-gray-200 dark:bg-gray-800" />
                    </div>
                    <div className="h-10 w-48 rounded-full bg-gray-200 dark:bg-gray-800" />
                  </div>
                  
                  {/* Chips */}
                  <div className="mt-5 flex gap-2">
                    <div className="h-11 w-24 rounded-full bg-gray-200 dark:bg-gray-800" />
                    <div className="h-11 w-32 rounded-full bg-gray-200 dark:bg-gray-800" />
                    <div className="h-11 w-32 rounded-full bg-gray-200 dark:bg-gray-800" />
                  </div>

                  {/* Segmented Location Buttons */}
                  <div className="mt-5 flex gap-2 rounded-2xl border border-gray-100 bg-gray-50 p-1.5 dark:border-slate-800 dark:bg-slate-950">
                    <div className="h-12 flex-1 rounded-xl bg-gray-200 dark:bg-gray-800" />
                    <div className="h-12 flex-1 rounded-xl bg-gray-200 dark:bg-gray-800" />
                    <div className="h-12 flex-1 rounded-xl bg-gray-200 dark:bg-gray-800" />
                  </div>

                  {/* Profile and Radius (Children) */}
                  <div className="mt-5 border-t border-gray-100 pt-5 space-y-4 dark:border-slate-800">
                    {/* Profile Selection */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="space-y-2">
                        <div className="h-5 w-32 rounded-md bg-gray-200 dark:bg-gray-800" />
                        <div className="h-4 w-48 rounded-md bg-gray-200 dark:bg-gray-800" />
                      </div>
                      <div className="h-11 w-40 rounded-full bg-gray-200 dark:bg-gray-800" />
                    </div>

                    {/* Radius */}
                    <div className="space-y-2 pt-2">
                      <div className="flex items-center justify-between">
                        <div className="h-5 w-24 rounded-md bg-gray-200 dark:bg-gray-800" />
                        <div className="h-5 w-12 rounded-md bg-gray-200 dark:bg-gray-800" />
                      </div>
                      <div className="grid grid-cols-5 gap-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className="h-10 rounded-xl bg-gray-200 dark:bg-gray-800" />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pb-10">
                  {/* Grid Skeleton */}
                  <div className="grid grid-cols-2 gap-3 sm:gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 w-full">
                    {Array.from({ length: 6 }).map((_, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col w-full gap-4 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 shadow-sm rounded-[24px] p-2.5 animate-pulse"
                      >
                        <div className="rounded-[14px] w-full h-[150px] md:h-37.5 lg:h-46.25 bg-gray-200 dark:bg-gray-700" />
                        <div className="flex flex-col gap-2 px-1 pb-2">
                          <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                          <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-700 rounded mb-1" />
                          <div className="flex justify-between items-center mt-2">
                            <div className="h-4 w-1/4 bg-gray-200 dark:bg-gray-700 rounded" />
                            <div className="h-6 w-1/5 rounded-full bg-gray-200 dark:bg-gray-700" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </main>
            </div>
          </section>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="sticky top-16 z-30 w-full border-b border-gray-100 bg-white/85 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/85">
        <div className="mx-auto flex w-full max-w-7xl px-4 py-3 sm:px-6 flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 shrink-0">
            <FoodNavTabs />
            <div className="hidden sm:block h-6 w-px bg-gray-200 dark:bg-slate-700 shrink-0" />
          </div>
          
          <div className="w-full flex-1 min-w-[280px] max-w-2xl">
            <div className="flex min-h-[56px] w-full items-center gap-3 rounded-full border border-gray-200 bg-white px-5 transition focus-within:border-primary-700 focus-within:ring-4 focus-within:ring-primary-50 dark:border-slate-700 dark:bg-slate-900 shadow-sm">
              <IoSearchOutline className="shrink-0 text-[22px] text-primary-700 dark:text-emerald-400" />

              <input
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="ស្វែងរកម្ហូប ហាង ប្រភេទម្ហូប..."
                aria-label="Search foods"
                className="w-full bg-transparent text-[16px] text-gray-700 outline-none placeholder:text-gray-400 dark:text-gray-100 [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden [&::-webkit-search-results-button]:hidden [&::-webkit-search-results-decoration]:hidden"
              />

              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput("");
                    setDebouncedQuery("");
                  }}
                  className="shrink-0 text-[16px] font-medium text-secondary-500 hover:text-secondary-600 transition"
                >
                  សម្អាត
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-20 pt-2 sm:px-6">
        <LocationContent menuItems={menuItems} searchQuery={debouncedQuery} mode={mode} onModeChange={handleModeChange} />
      </div>
    </>
  );
}
