"use client";

import { useEffect, useState } from "react";

import { IoSearchOutline } from "react-icons/io5";

import { useGetMenuItemsQuery } from "@/app/store/menuApi";

import LocationContent from "@/components/food-page/location/LocationContent";

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

  if (isLoading || isFetching) {
    return (
      <div className="flex min-h-[500px] flex-col items-center justify-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-100 border-t-primary-800" />
        <p className="text-[16px] text-gray-500">កំពុងផ្ទុក...</p>
      </div>
    );
  }

  return (
    <>
      <section className="mb-4 rounded-full border border-gray-100 bg-white p-1 shadow-sm">
        <div className="flex min-h-[56px] flex-1 items-center gap-3 rounded-full border border-gray-200 bg-white px-5 transition focus-within:border-primary-700 focus-within:ring-4 focus-within:ring-primary-50">
          <IoSearchOutline className="shrink-0 text-[22px] text-primary-700" />

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
              className="shrink-0 text-[16px] font-medium text-secondary-500"
            >
              សម្អាត
            </button>
          )}
        </div>
      </section>

      <LocationContent menuItems={menuItems} searchQuery={debouncedQuery} />
    </>
  );
}
