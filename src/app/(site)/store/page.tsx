"use client";

import { useEffect, useState } from "react";

import { IoSearchOutline, IoClose } from "react-icons/io5";

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

  /* Scroll to top when page loads to prevent loading at bottom */
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  return (
    <div className="min-h-screen relative pt-16">
      <section className="sticky top-[64px] z-40 bg-slate-50/90 py-3 backdrop-blur-xl dark:bg-slate-900/90">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex h-[52px] flex-1 items-center gap-3 rounded-full border border-gray-200 bg-white px-5 shadow-sm transition focus-within:border-primary-700 focus-within:ring-4 focus-within:ring-primary-50 dark:border-gray-800 dark:bg-gray-950">
            <IoSearchOutline className="shrink-0 text-[22px] text-primary-700 dark:text-emerald-400" />

            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="ស្វែងរកហាង ទីតាំង ឈ្មោះហាង..."
              aria-label="Search stores"
              className="w-full bg-transparent text-[16px] text-gray-800 placeholder-gray-400 focus:outline-none dark:text-slate-100 dark:placeholder-gray-500 [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden [&::-webkit-search-results-button]:hidden [&::-webkit-search-results-decoration]:hidden"
            />

            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput("");
                  setDebouncedQuery("");
                }}
                className="shrink-0 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
              >
                <IoClose className="text-xl" />
              </button>
            )}
          </div>
        </div>
      </section>

      <StoreContent
        menuItems={[]}
        searchQuery={debouncedQuery}
        onClearSearch={() => setSearchInput("")}
      />
    </div>
  );
}
