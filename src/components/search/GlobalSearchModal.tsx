"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Store as StoreIcon, Utensils, Star, DollarSign, ArrowRight, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLazyPublicSearchQuery } from "@/app/store/searchApi";
import type { MenuItemHit, StoreHit } from "@/types/search";

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const POPULAR_SEARCHES = [
  "បាយឆា (Fried Rice)",
  "គុយទាវ (Noodles)",
  "កាហ្វេ (Coffee)",
  "ប៊ឺហ្គឺ (Burger)",
  "ភេសជ្ជៈ (Drinks)",
  "មាន់បំពង (Fried Chicken)",
];

export default function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const [triggerSearch, { data, isFetching, isError }] = useLazyPublicSearchQuery();

  // Debounce input (250ms delay)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 250);

    return () => clearTimeout(handler);
  }, [query]);

  // Execute query when debouncedQuery changes
  useEffect(() => {
    if (debouncedQuery) {
      triggerSearch({ q: debouncedQuery, limit: 10, offset: 0 });
    }
  }, [debouncedQuery, triggerSearch]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      setQuery("");
      setDebouncedQuery("");
    }
  }, [isOpen]);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const stores: StoreHit[] = data?.stores?.items ?? [];
  const menuItems: MenuItemHit[] = data?.menuItems?.items ?? [];
  const hasResults = stores.length > 0 || menuItems.length > 0;

  const handleSelectStore = (store: StoreHit) => {
    const storeId =
      store.uuid ||
      store.storeUuid ||
      store.store_uuid ||
      (store as any).id ||
      (store as any).storeId;

    if (!storeId || storeId === "undefined") {
      console.warn("[SEARCH MODAL] Invalid store UUID:", store);
      return;
    }

    onClose();
    router.push(`/store/${storeId}`);
  };

  const handleSelectMenuItem = (item: MenuItemHit) => {
    const itemUuid =
      item.uuid ||
      item.menuItemUuid ||
      item.menu_item_uuid ||
      (item as any).id ||
      (item as any).menuItemId;

    if (!itemUuid || itemUuid === "undefined") {
      console.warn("[SEARCH MODAL] Invalid menu item UUID:", item);
      return;
    }

    onClose();
    router.push(`/menu/${itemUuid}`);
  };

  const renderPriceLevel = (level?: number) => {
    if (!level) return "$$";
    return "$".repeat(Math.min(Math.max(level, 1), 4));
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-100 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-sm">
        {/* Backdrop click to close */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0"
          onClick={onClose}
        />

        {/* Search Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.2 }}
          className="relative z-10 w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl"
        >
          {/* Search Header Input */}
          <div className="relative flex items-center border-b border-slate-200 dark:border-slate-800 px-5 py-4">
            <Search className="h-5 w-5 text-slate-400 shrink-0 mr-3" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ស្វែងរកហាង ឬ មុខម្ហូប (Search stores or dishes)..."
              className="w-full bg-transparent text-lg font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
            />
            {isFetching && (
              <Loader2 className="h-5 w-5 animate-spin text-emerald-600 dark:text-emerald-400 shrink-0 ml-2" />
            )}
            {query && !isFetching && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Body Content */}
          <div className="max-h-[65vh] overflow-y-auto p-5 space-y-6 custom-scrollbar">
            {/* Empty Input state: Popular searches & quick triggers */}
            {!query && (
              <div className="space-y-4">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  ការស្វែងរកពេញនិយម (Popular Searches)
                </div>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_SEARCHES.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => setQuery(term.split(" ")[0])}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
                    >
                      <Search className="h-3.5 w-3.5" />
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Results loading state */}
            {query && isFetching && !hasResults && (
              <div className="py-12 text-center space-y-3">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600 dark:text-emerald-400 mx-auto" />
                <p className="text-sm text-slate-500">កំពុងស្វែងរក... (Searching...)</p>
              </div>
            )}

            {/* No Results state */}
            {debouncedQuery && !isFetching && !hasResults && (
              <div className="py-12 text-center space-y-2">
                <Utensils className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto" />
                <p className="text-base font-semibold text-slate-800 dark:text-slate-200">
                  រកមិនឃើញផលតដែលត្រូវគ្នាទេ (No results found)
                </p>
                <p className="text-sm text-slate-500">
                  សូមព្យាយាមស្វែងរកពាក្យផ្សេងទៀត ឬពិនិត្យពាក្យរបស់អ្នក។
                </p>
              </div>
            )}

            {/* Categorized Stores Section */}
            {stores.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  <StoreIcon className="h-4 w-4" />
                  🏪 ហាងអាហារ (Stores) ({stores.length})
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {stores.map((store) => (
                    <div
                      key={store.id || store.uuid}
                      onClick={() => handleSelectStore(store)}
                      className="group flex items-center gap-3 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-emerald-50/80 dark:hover:bg-emerald-950/40 hover:border-emerald-200 dark:hover:border-emerald-800 transition cursor-pointer"
                    >
                      <img
                        src={store.logoUrl || store.bannerUrl || "/Image/foodHub-logo.png"}
                        alt={store.storeName || store.name || "Store"}
                        className="h-12 w-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/Image/foodHub-logo.png";
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-sm text-slate-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                          {store.storeName || store.name}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {store.city && <span>{store.city}</span>}
                          <span className="flex items-center gap-1 text-amber-500 font-medium">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            {store.averageRating ? store.averageRating.toFixed(1) : "4.8"}
                          </span>
                          <span className="font-semibold text-slate-600 dark:text-slate-300">
                            {renderPriceLevel(store.priceLevel)}
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Categorized Dishes / Menu Items Section */}
            {menuItems.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  <Utensils className="h-4 w-4" />
                  🍲 មុខម្ហូប (Dishes & Menu Items) ({menuItems.length})
                </div>

                <div className="space-y-2">
                  {menuItems.map((item) => (
                    <div
                      key={item.id || item.uuid}
                      onClick={() => handleSelectMenuItem(item)}
                      className="group flex items-center justify-between p-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-emerald-50/80 dark:hover:bg-emerald-950/40 hover:border-emerald-200 dark:hover:border-emerald-800 transition cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={item.imageUrl || "/Image/foodHub-logo.png"}
                          alt={item.name}
                          className="h-12 w-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/Image/foodHub-logo.png";
                          }}
                        />
                        <div className="min-w-0">
                          <h4 className="font-semibold text-sm text-slate-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                            {item.name}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {item.storeName || "FoodHub Restaurant"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400">
                          ${(item.price ?? 4.5).toFixed(2)}
                        </span>
                        <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 px-5 py-3 text-xs text-slate-400">
            <span>ចុច <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">Esc</kbd> ដើម្បីបិទ</span>
            <span>FoodHub Global Search</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
