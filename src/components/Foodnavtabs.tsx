"use client";

import { useState } from "react";
import { MdRestaurant, MdMap, MdStorefront } from "react-icons/md";
import { FiSearch } from "react-icons/fi";
import { motion } from "framer-motion";

export type FoodTabId = "food" | "location" | "store";

const TABS = [
  { id: "food", label: "ចំណីអាហារ", Icon: MdRestaurant },
  { id: "location", label: "ទីតាំង", Icon: MdMap },
  { id: "store", label: "ហាងអាហារ", Icon: MdStorefront },
] as const;

interface FoodNavTabsProps {
  /** Pass this to control the active tab from the parent (optional). */
  activeTab?: FoodTabId;
  onTabChange?: (tab: FoodTabId) => void;
  onSearch?: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export default function FoodNavTabs({
  activeTab,
  onTabChange,
  onSearch,
  placeholder = "ស្វែងរកមុខម្ហូបអាហារ និង ភោជនីយដ្ឋាន...",
  className = "",
}: FoodNavTabsProps) {
  const [internalTab, setInternalTab] = useState<FoodTabId>("food");
  const [query, setQuery] = useState("");

  const active = activeTab ?? internalTab;

  const handleTab = (id: FoodTabId) => {
    setInternalTab(id);
    onTabChange?.(id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(query.trim());
  };

  return (
    <div className={`w-full  ${className}`}>
      <div className="mx-auto flex max-w-7xl flex-col gap-4  py-2 md:flex-row md:items-center md:justify-between md:gap-8 ">
        {/* Tabs */}
        <nav
          aria-label="ប្រភេទការស្វែងរក"
          className="-mx-4 flex items-center gap-6 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:gap-12 md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden"
        >
          {TABS.map(({ id, label, Icon }) => {
            const isActive = active === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => handleTab(id)}
                aria-current={isActive ? "page" : undefined}
                className={`relative flex shrink-0 items-center gap-2 rounded-md pb-2 text-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-800/40 md:gap-3 md:text-xl ${
                  isActive
                    ? "text-primary-800"
                    : "text-primary-800/70 hover:text-primary-800"
                }`}
              >
                <Icon className="h-6 w-6 md:h-7 md:w-7" aria-hidden="true" />
                <span>{label}</span>
                {isActive && (
                  <motion.div
                    layoutId="active-food-nav-underline"
                    className="absolute left-0 right-0 bottom-0 h-[3px] rounded-full bg-primary-800"
                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Search */}
        <form
          role="search"
          onSubmit={handleSubmit}
          className="relative w-full md:max-w-sm lg:max-w-md"
        >
          <FiSearch
            className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            aria-label={placeholder}
            className="w-full rounded-full border border-gray-200 bg-white py-3 pl-14 pr-5 text-base text-gray-700 dark:text-gray-100 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-primary-800 focus:ring-2 focus:ring-primary-800/20"
          />
        </form>
      </div>
    </div>
  );
}
