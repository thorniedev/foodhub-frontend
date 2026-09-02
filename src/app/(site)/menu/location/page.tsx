"use client";

import { useEffect, useState } from "react";

import { IoSearchOutline } from "react-icons/io5";

import { useGetMenuItemsQuery } from "@/app/store/menuApi";

import LocationContent from "@/components/food-page/location/LocationContent";
import FoodNavTabs from "@/components/food-page/FoodNavTabs";

export default function LocationPage() {
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

  const renderContent = () => {
    if (isLoading || isFetching) {
      return (
        <div className="flex min-h-[500px] flex-col items-center justify-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-100 border-t-primary-800 dark:border-slate-700 dark:border-t-emerald-500" />
          <p className="text-[16px] text-gray-500 dark:text-gray-400">កំពុងផ្ទុក...</p>
        </div>
      );
    }
    return <LocationContent menuItems={menuItems} searchQuery={debouncedQuery} />;
  };

  return (
    <>
      <div className="sticky top-16 z-30 w-full border-b border-gray-100 bg-white/85 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/85">
        <div className="mx-auto flex w-full max-w-7xl px-4 py-3 sm:px-6 flex-col lg:flex-row lg:items-center gap-4">
          <FoodNavTabs />
          
          <div className="flex-1 w-full lg:w-auto">
            <div className="flex min-h-[56px] w-full items-center gap-3 rounded-full border border-gray-200 bg-white px-5 transition focus-within:border-primary-700 focus-within:ring-4 focus-within:ring-primary-50 dark:border-slate-700 dark:bg-slate-900 shadow-sm">
              <IoSearchOutline className="shrink-0 text-[22px] text-primary-700 dark:text-emerald-400" />

              <input
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="ស្វែងរកម្ហូប ហាង ប្រភេទម្ហូប..."
                aria-label="Search foods"
                className="w-full bg-transparent text-[16px] text-gray-700 outline-none placeholder:text-gray-400 dark:text-gray-100"
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
        {renderContent()}
      </div>
    </>
  );
}
