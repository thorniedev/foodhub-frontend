"use client";

import { useEffect, useState } from "react";

import { IoSearchOutline } from "react-icons/io5";

import StoreContent from "@/components/food-page/store/StoreContent";

export default function StorePage() {
  const [searchInput, setSearchInput] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  /* Debounce the search input */
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedQuery(searchInput);
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [searchInput]);

  return (
    <>
      <section className="mb-4 pt-32 container mx-auto max-w-7xl px-4">
        <div className="flex min-h-[56px] flex-1 items-center gap-3 rounded-full border border-gray-200 bg-white px-5 py-1 shadow-sm transition focus-within:border-primary-700 focus-within:ring-4 focus-within:ring-primary-50">
          <IoSearchOutline className="shrink-0 text-[22px] text-primary-700" />

          <input
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="ស្វែងរកម្ហូប ហាង ប្រភេទម្ហូប..."
            aria-label="Search stores"
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

      <StoreContent
        menuItems={[]}
        searchQuery={debouncedQuery}
        onClearSearch={() => setSearchInput("")}
      />
    </>
  );
}
