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

  const { data: menuItems = [] } = useGetMenuItemsQuery({ size: 20 });

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
