"use client";

import Image from "next/image";
import { Clock, MapPin, ShieldCheck, Star, Utensils, Navigation } from "lucide-react";
import Link from "next/link";
import type { StoreMenuItemCard } from "@/lib/location/store-menu-item-cards";

interface StoreMenuItemListProps {
  cards: StoreMenuItemCard[];
  selectedStoreId: string | null;
  onSelectStore: (storeUuid: string) => void;
  emptyLabel?: string;
  className?: string;
}

function formatPrice(price: number | null, currencyCode: string) {
  if (price === null) {
    return null;
  }

  return currencyCode === "USD"
    ? `$${price.toFixed(2)}`
    : `${price.toFixed(2)} ${currencyCode}`;
}

/**
 * Menu items grouped by the store that sells them. Selecting any card reports
 * that item's store so the map can centre on it, matching the store list it
 * replaced.
 */
export default function StoreMenuItemList({
  cards,
  selectedStoreId,
  onSelectStore,
  emptyLabel = "មិនមានមុខម្ហូបក្នុងចម្ងាយដែលបានកំណត់ទេ។",
  className = "",
}: StoreMenuItemListProps) {
  if (cards.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center text-sm text-gray-500 dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-800 dark:bg-primary-950/60 dark:text-primary-300 mb-3">
          <Utensils className="h-6 w-6" />
        </div>
        <p className="font-semibold text-gray-800 dark:text-gray-200">{emptyLabel}</p>
        <p className="mt-1 text-xs text-gray-400">សូមសាកល្បងពង្រីកកាំស្វែងរក ឬកែតម្រងរបស់អ្នក</p>
      </div>
    );
  }

  return (
    <div
      className={`space-y-3.5 2xl:max-h-[calc(100dvh-220px)] 2xl:overflow-y-auto 2xl:pr-1.5 2xl:[scrollbar-width:none] 2xl:[&::-webkit-scrollbar]:hidden ${className}`}
    >
      {cards.map((card) => {
        const selected = selectedStoreId === card.storeUuid;
        const priceLabel = formatPrice(card.price, card.currencyCode);

        return (
          <div
            key={card.key}
            onClick={() => onSelectStore(card.storeUuid)}
            className={`group relative flex flex-col sm:flex-row items-start gap-3.5 rounded-[22px] border p-3.5 sm:p-4 text-left transition-all duration-200 cursor-pointer shadow-xs ${
              selected
                ? "border-primary-800 bg-primary-50/70 ring-2 ring-primary-700/40 shadow-md dark:border-emerald-500 dark:bg-emerald-950/40 dark:ring-emerald-500/40"
                : "border-gray-100/90 bg-white hover:border-primary-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
            }`}
          >
            {/* Thumbnail */}
            <div className="relative flex h-24 w-full sm:h-24 sm:w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gray-100 dark:bg-slate-800">
              {card.thumbnail ? (
                <Image
                  src={card.thumbnail}
                  alt={card.name}
                  fill
                  sizes="(max-width: 640px) 100vw, 96px"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <Utensils className="h-8 w-8 text-gray-400" />
              )}

              {/* Operating status badge on image */}
              <span
                className={`absolute bottom-1.5 left-1.5 rounded-full px-2 py-0.5 text-[11px] font-bold shadow-xs backdrop-blur-xs ${
                  card.isOpenNow
                    ? "bg-emerald-600/90 text-white"
                    : "bg-gray-800/80 text-gray-200"
                }`}
              >
                {card.isOpenNow ? "បើក" : "បិទ"}
              </span>

              {/* Active Selection Indicator */}
              {selected && (
                <span className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary-800 text-white shadow-xs">
                  <Navigation className="h-3 w-3 fill-current" />
                </span>
              )}
            </div>

            {/* Content Details */}
            <div className="min-w-0 flex-1 w-full">
              {/* Dish Name & Price */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-base font-bold text-primary-950 dark:text-white leading-snug group-hover:text-primary-800 dark:group-hover:text-emerald-400 transition-colors">
                    {card.name}
                  </h4>
                  {card.localName && card.localName !== card.name && (
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                      {card.localName}
                    </p>
                  )}
                </div>

                {priceLabel && (
                  <span className="shrink-0 rounded-full bg-primary-100/80 px-2.5 py-1 text-xs font-bold text-primary-800 dark:bg-primary-950/80 dark:text-primary-300">
                    {priceLabel}
                  </span>
                )}
              </div>

              {/* Store Name with Pin */}
              <div className="mt-1.5 flex items-center gap-1.5 text-xs text-gray-600 dark:text-slate-400">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-primary-700 dark:text-emerald-400" />
                <span className="font-semibold truncate text-gray-800 dark:text-slate-200">
                  {card.storeName}
                </span>
                {card.storeAddress && (
                  <span className="text-gray-400 truncate hidden md:inline">
                    &bull; {card.storeAddress}
                  </span>
                )}
              </div>

              {/* Distance, Rating, Prep Time */}
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-gray-500 dark:text-slate-400">
                {card.distanceKm !== null && (
                  <span className="font-bold text-primary-800 dark:text-emerald-400">
                    📍 {card.distanceKm.toFixed(1)} គ.ម
                  </span>
                )}

                {card.averageRating !== null && (
                  <span className="inline-flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400">
                    <Star className="h-3 w-3 fill-current text-amber-500" />
                    {card.averageRating.toFixed(1)}
                  </span>
                )}

                {card.preparationTimeMinutes !== null && card.preparationTimeMinutes !== undefined && card.preparationTimeMinutes > 0 && (
                  <span className="inline-flex items-center gap-1 text-gray-500">
                    <Clock className="h-3 w-3" />
                    {card.preparationTimeMinutes} នាទី
                  </span>
                )}

                {card.safetyStatus === "SAFE" && (
                  <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-400">
                    <ShieldCheck className="h-3 w-3" />
                    សុវត្ថិភាពខ្ពស់
                  </span>
                )}
              </div>

              {/* Dietary and Allergen Tags */}
              <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100/80 dark:border-slate-800">
                <div className="flex flex-wrap items-center gap-1.5">
                  {card.dietaryTypes.slice(0, 3).map((dietary) => (
                    <span
                      key={`${card.key}-${dietary}`}
                      className="rounded-full bg-secondary-50 px-2 py-0.5 text-[11px] font-bold text-secondary-700 dark:bg-secondary-950/40 dark:text-secondary-300"
                    >
                      {dietary}
                    </span>
                  ))}

                  {card.allergens && card.allergens.slice(0, 2).map((allergen) => (
                    <span
                      key={`${card.key}-allergen-${allergen}`}
                      className="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                    >
                      ⚠️ គ្មាន {allergen}
                    </span>
                  ))}
                </div>

                {/* Map Button & Link to Food Details */}
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectStore(card.storeUuid);
                    }}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition shadow-2xs ${
                      selected
                        ? "bg-primary-800 text-white"
                        : "bg-primary-50 text-primary-800 hover:bg-primary-100 dark:bg-primary-950/50 dark:text-primary-300"
                    }`}
                  >
                    <Navigation className="h-3 w-3" />
                    <span>{selected ? "កំពុងបង្ហាញ" : "មើលលើផែនទី"}</span>
                  </button>

                  <Link
                    href={`/menu/${card.menuItemUuid}`}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 hover:text-gray-900 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition"
                  >
                    <span>លម្អិត</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
