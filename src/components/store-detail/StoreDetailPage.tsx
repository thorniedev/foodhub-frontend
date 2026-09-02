"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

import Link from "next/link";

import { AnimatePresence, motion } from "framer-motion";

import {
  IoArrowBack,
  IoCallOutline,
  IoFilterOutline,
  IoLocationOutline,
  IoMailOutline,
  IoRefreshOutline,
  IoSearchOutline,
  IoShieldCheckmarkOutline,
  IoTimeOutline,
  IoChevronDownOutline,
  IoChevronUpOutline,
  IoNavigateOutline,
  IoMapOutline,
  IoCopyOutline,
  IoCheckmarkOutline,
  IoStar,
} from "react-icons/io5";

import { FaStore, FaDirections } from "react-icons/fa";

import { useGetStoreByUuidQuery } from "@/app/store/locationApi";
import { useGetMenuItemsQuery } from "@/app/store/menuApi";
import { BookmarkButton } from "@/components/common/BookmarkButton";

import FoodCard from "@/components/dynamic-card/FoodCard";

import { resolveStoreMediaUrl } from "@/components/food-page/store/store-page-utils";

import {
  DEFAULT_STORE_MENU_FILTERS,
  applyStoreMenuFilters,
  buildStoreMenuFilterOptions,
  countActiveStoreMenuFilters,
  getStoreMenuItems,
} from "@/lib/store-menu-filter";

import type { FoodStoreDetail, StoreOpeningHour } from "@/types/store-page";

import type { StoreMenuFilterState } from "@/types/store-menu-filter";

import StoreMenuFilterSidebar from "./StoreMenuFilterSidebar";

type StoreDetailPageProps = {
  storeUuid: string;
};

function getStoreAddress(store: FoodStoreDetail): string {
  const values = [
    store.addressLine,
    store.commune,
    store.district,
    store.city,
    store.province,
  ]
    .map((value) => (typeof value === "string" ? value.trim() : ""))
    .filter(Boolean);

  return Array.from(new Set(values)).join(", ") || "មិនមានអាសយដ្ឋាន";
}

function formatPriceLevel(value: FoodStoreDetail["priceLevel"]): string | null {
  if (value === null || value === undefined || String(value).trim() === "") {
    return null;
  }

  if (typeof value === "number") {
    if (value <= 0) {
      return null;
    }

    return "$".repeat(Math.min(Math.max(Math.round(value), 1), 4));
  }

  return String(value);
}

function getCurrentStatusLabel(store: FoodStoreDetail): string {
  if (store.isOpenNow) {
    return "បើកឥឡូវនេះ";
  }

  return "បានបិទឥឡូវនេះ";
}

function getOperatingStatusLabel(value: string): string {
  switch (value.trim().toUpperCase()) {
    case "OPEN":
      return "កំពុងដំណើរការ";

    case "CLOSED":
      return "បានបិទ";

    case "TEMPORARILY_CLOSED":
      return "បិទជាបណ្ដោះអាសន្ន";

    case "PERMANENTLY_CLOSED":
      return "បិទជាអចិន្ត្រៃយ៍";

    default:
      return value;
  }
}

function formatHour(value: string | null): string {
  if (!value) {
    return "—";
  }

  const [hours, minutes] = value.split(":");

  if (hours === undefined || minutes === undefined) {
    return value;
  }

  return `${hours}:${minutes}`;
}

function getWeekdayLabel(dayOfWeek: number | null): string {
  switch (dayOfWeek) {
    case 1:
      return "ចន្ទ";
    case 2:
      return "អង្គារ";
    case 3:
      return "ពុធ";
    case 4:
      return "ព្រហស្បតិ៍";
    case 5:
      return "សុក្រ";
    case 6:
      return "សៅរ៍";
    case 7:
      return "អាទិត្យ";
    default:
      return "—";
  }
}

function groupOpeningHours(
  openingHours: StoreOpeningHour[],
): StoreOpeningHour[] {
  return [...openingHours].sort(
    (first, second) =>
      (first.dayOfWeek ?? 99) - (second.dayOfWeek ?? 99) ||
      first.intervalOrder - second.intervalOrder,
  );
}

function StoreMediaImage({
  mediaUuid,
  fallbackMediaUuid,
  alt,
  className,
}: {
  mediaUuid?: string | null;
  fallbackMediaUuid?: string | null;
  alt: string;
  className?: string;
}) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    setImageUrl(null);
    setFailed(false);

    async function load() {
      let resolved = await resolveStoreMediaUrl(mediaUuid);

      if (!resolved && fallbackMediaUuid && fallbackMediaUuid !== mediaUuid) {
        resolved = await resolveStoreMediaUrl(fallbackMediaUuid);
      }

      if (!cancelled) {
        setImageUrl(resolved);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [mediaUuid, fallbackMediaUuid]);

  if (!imageUrl || failed) {
    return (
      <div
        className={`flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100/50 ${
          className || ""
        }`}
      >
        <FaStore className="text-[46px] text-primary-300" />
      </div>
    );
  }

  return (
    <Image
      src={imageUrl}
      alt={alt}
      fill
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 1200px"
      draggable={false}
      onError={() => setFailed(true)}
      className={className}
    />
  );
}

function StoreHero({ store }: { store: FoodStoreDetail }) {
  const address = getStoreAddress(store);
  const priceLevel = formatPriceLevel(store.priceLevel);
  const [copied, setCopied] = useState(false);

  const hasCoords =
    store.latitude !== null &&
    store.latitude !== undefined &&
    store.longitude !== null &&
    store.longitude !== undefined &&
    Number.isFinite(Number(store.latitude)) &&
    Number.isFinite(Number(store.longitude));

  const directionsUrl = hasCoords
    ? `https://www.google.com/maps/dir/?api=1&destination=${store.latitude},${store.longitude}`
    : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;

  const googleMapsUrl = hasCoords
    ? `https://www.google.com/maps/search/?api=1&query=${store.latitude},${store.longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  const hygiene =
    store.hygieneRating !== null && Number.isFinite(Number(store.hygieneRating))
      ? Number(store.hygieneRating).toFixed(1)
      : null;

  const handleCopyAddress = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <section className="relative rounded-[32px] border border-gray-100/50 bg-white p-3 shadow-sm ring-1 ring-black/5 sm:p-4">
      {/* Cover Image & Overlay */}
      <div className="relative h-[280px] w-full overflow-hidden rounded-[24px] sm:h-[360px] lg:h-[420px]">
        <StoreMediaImage
          mediaUuid={store.coverMediaUuid}
          fallbackMediaUuid={store.logoMediaUuid}
          alt={`${store.storeName} cover`}
          className="h-full w-full object-cover"
        />

        {/* Subtle, modern gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/15 to-transparent" />

        {/* Top-Right Bookmark & Directions Buttons (Glassmorphism style) */}
        <div className="absolute right-4 top-4 z-10 flex items-center gap-2 sm:right-6 sm:top-6">
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-11 items-center gap-2 rounded-full border border-white/30 bg-white/20 px-4 text-sm font-semibold text-white shadow-md backdrop-blur-md transition-all hover:bg-white hover:text-primary-800 sm:h-12"
            title="ទិសដៅទៅហាងនៅលើ Google Maps"
          >
            <FaDirections className="text-base" />
            <span className="hidden sm:inline">ទិសដៅ</span>
          </a>

          <BookmarkButton
            storeUuid={store.uuid}
            showText={false}
            className="h-11 w-11 border border-white/30 bg-white/20 text-white shadow-md backdrop-blur-md transition-all hover:bg-white hover:text-primary-700 sm:h-12 sm:w-12"
          />
        </div>

        {/* Hero Content inside the image */}
        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
            {/* Logo */}
            <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full border-[3px] border-white/90 bg-white shadow-xl sm:h-36 sm:w-36">
              <StoreMediaImage
                mediaUuid={store.logoMediaUuid}
                alt={`${store.storeName} logo`}
                className="h-full w-full object-cover"
              />
            </div>

            {/* Title & Badges */}
            <div className="min-w-0 flex-1">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full border px-4 py-1.5 text-sm font-bold tracking-wide backdrop-blur-md ${
                    store.isOpenNow
                      ? "border-emerald-400/40 bg-emerald-500/20 text-emerald-300"
                      : "border-red-400/40 bg-red-500/20 text-red-300"
                  }`}
                >
                  {getCurrentStatusLabel(store)}
                </span>
                <span className="rounded-full border border-white/30 bg-white/20 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-md">
                  {getOperatingStatusLabel(store.operatingStatus)}
                </span>
                {store.averageRating > 0 && (
                  <span className="flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-500/20 px-4 py-1.5 text-sm font-bold text-amber-300 backdrop-blur-md">
                    <IoStar className="text-amber-300" />
                    {Number(store.averageRating).toFixed(1)}
                    {store.totalReviews > 0 && (
                      <span className="font-normal text-white/80">
                        ({store.totalReviews})
                      </span>
                    )}
                  </span>
                )}
              </div>

              <h1 className="truncate text-2xl font-extrabold leading-tight text-white drop-shadow-sm sm:text-3xl lg:text-4xl">
                {store.storeName}
              </h1>

              <div className="mt-3 flex min-w-0 items-center gap-2 text-white/90">
                <IoLocationOutline className="shrink-0 text-xl text-primary-300" />
                <p className="truncate text-base sm:text-lg">{address}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Section under Hero */}
      <div className="px-3 pt-6 sm:px-4 sm:pt-8 lg:px-6">
        {store.description && (
          <p className="mb-6 max-w-4xl text-lg leading-relaxed text-slate-600">
            {store.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3 text-base font-medium text-slate-600">
          {/* Google Maps Directions Action */}
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-primary-800 px-5 py-2.5 font-semibold text-white shadow-sm transition hover:bg-primary-700 active:scale-95"
          >
            <IoNavigateOutline className="text-xl" />
            ទិសដៅទៅហាង
          </a>

          <button
            type="button"
            onClick={handleCopyAddress}
            className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-5 py-2.5 text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-100"
            title="ចម្លងអាសយដ្ឋាន"
          >
            {copied ? (
              <>
                <IoCheckmarkOutline className="text-xl text-emerald-600" />
                <span className="text-emerald-700 font-semibold">បានចម្លងអាសយដ្ឋាន</span>
              </>
            ) : (
              <>
                <IoCopyOutline className="text-lg text-slate-500" />
                <span>ចម្លងអាសយដ្ឋាន</span>
              </>
            )}
          </button>

          {store.province && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-4 py-2.5 font-semibold text-primary-800 ring-1 ring-primary-100">
              <IoLocationOutline className="text-lg text-primary-600" />
              {store.province}
            </span>
          )}

          {hygiene && (
            <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-5 py-2.5 ring-1 ring-slate-100">
              <IoShieldCheckmarkOutline className="text-xl text-primary-600" />
              អនាម័យ {hygiene}
            </span>
          )}

          {store.phoneNumber && (
            <a
              href={`tel:${store.phoneNumber}`}
              className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-5 py-2.5 ring-1 ring-slate-100 transition hover:bg-primary-50 hover:text-primary-700"
            >
              <IoCallOutline className="text-xl" />
              {store.phoneNumber}
            </a>
          )}

          {store.email && (
            <a
              href={`mailto:${store.email}`}
              className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-5 py-2.5 ring-1 ring-slate-100 transition hover:bg-primary-50 hover:text-primary-700"
            >
              <IoMailOutline className="text-xl" />
              {store.email}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

function StoreLocationMapCard({ store }: { store: FoodStoreDetail }) {
  const address = getStoreAddress(store);
  const [copied, setCopied] = useState(false);

  const hasCoords =
    store.latitude !== null &&
    store.latitude !== undefined &&
    store.longitude !== null &&
    store.longitude !== undefined &&
    Number.isFinite(Number(store.latitude)) &&
    Number.isFinite(Number(store.longitude));

  const embedSrc = hasCoords
    ? `https://www.google.com/maps?q=${store.latitude},${store.longitude}&hl=km&z=15&output=embed`
    : `https://www.google.com/maps?q=${encodeURIComponent(address)}&hl=km&z=15&output=embed`;

  const directionsUrl = hasCoords
    ? `https://www.google.com/maps/dir/?api=1&destination=${store.latitude},${store.longitude}`
    : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;

  const handleCopyAddress = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <section className="rounded-[32px] border border-gray-100/50 bg-white p-6 shadow-sm ring-1 ring-black/5 sm:p-7">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-50 text-primary-700">
          <IoMapOutline className="text-[23px]" />
        </span>

        <div>
          <p className="text-[20px] font-bold text-primary-900">ទីតាំងនៅលើផែនទី</p>
          <p className="text-[15px] text-gray-400">Google Maps</p>
        </div>
      </div>

      {/* Embedded Map */}
      <div className="mt-5 relative h-[220px] w-full overflow-hidden rounded-[20px] border border-gray-200 shadow-inner">
        <iframe
          title={`ទីតាំង ${store.storeName} នៅលើ Google Maps`}
          src={embedSrc}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="h-full w-full border-0"
        />
      </div>

      {/* Address & Actions */}
      <div className="mt-4 space-y-3">
        <div className="flex items-start gap-2.5 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
          <IoLocationOutline className="mt-0.5 shrink-0 text-lg text-primary-600" />
          <p className="flex-1 font-medium leading-relaxed">{address}</p>
        </div>

        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl bg-primary-800 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 active:scale-95 shadow-sm"
          >
            <FaDirections className="text-base" />
            ទិសដៅ
          </a>

          <button
            type="button"
            onClick={handleCopyAddress}
            className="flex items-center justify-center gap-2 rounded-xl bg-slate-100 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 active:scale-95"
          >
            {copied ? (
              <>
                <IoCheckmarkOutline className="text-lg text-emerald-600" />
                <span className="text-emerald-700">បានចម្លង</span>
              </>
            ) : (
              <>
                <IoCopyOutline className="text-base text-slate-500" />
                <span>ចម្លងអាសយដ្ឋាន</span>
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}

function StoreOpeningHoursCard({ store }: { store: FoodStoreDetail }) {
  const [expanded, setExpanded] = useState(false);
  const schedules = groupOpeningHours(store.openingHours);

  // JavaScript getDay(): 0 is Sunday, 1 is Monday... Map to 1 (Monday) - 7 (Sunday)
  const currentDayOfWeek = typeof window !== "undefined"
    ? (new Date().getDay() === 0 ? 7 : new Date().getDay())
    : 1;

  if (schedules.length === 0) {
    return null;
  }

  const MAX_VISIBLE = 4;
  const visibleSchedules = expanded
    ? schedules
    : schedules.slice(0, MAX_VISIBLE);
  const hasMore = schedules.length > MAX_VISIBLE;

  return (
    <section className="rounded-[32px] border border-gray-100/50 bg-white p-6 shadow-sm ring-1 ring-black/5 sm:p-7">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-50 text-primary-700">
            <IoTimeOutline className="text-[23px]" />
          </span>

          <div>
            <p className="text-[20px] font-bold text-primary-900">ម៉ោងបើកបិទ</p>
            <p className="text-[15px] text-gray-400">កាលវិភាគប្រចាំសប្ដាហ៍</p>
          </div>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${
            store.isOpenNow
              ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
              : "bg-red-50 text-red-700 ring-1 ring-red-200"
          }`}
        >
          {store.isOpenNow ? "កំពុងបើក" : "បានបិទ"}
        </span>
      </div>

      <div className="mt-5 flex flex-col gap-2.5">
        {visibleSchedules.map((schedule, index) => {
          const isToday = schedule.dayOfWeek === currentDayOfWeek;

          return (
            <div
              key={`${schedule.dayOfWeek}-${schedule.intervalOrder}-${index}`}
              className={`flex items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-sm transition-all ${
                isToday
                  ? "bg-primary-50/80 font-semibold ring-1 ring-primary-200 text-primary-900"
                  : "bg-gray-50 text-gray-600"
              }`}
            >
              <div className="flex items-center gap-2">
                <span>{getWeekdayLabel(schedule.dayOfWeek)}</span>
                {isToday && (
                  <span className="rounded-full bg-primary-700 px-2 py-0.5 text-[11px] font-bold text-white">
                    ថ្ងៃនេះ
                  </span>
                )}
              </div>

              <span
                className={
                  schedule.isClosed
                    ? "font-medium text-red-500"
                    : isToday
                    ? "font-bold text-primary-800"
                    : "text-gray-700"
                }
              >
                {schedule.isClosed
                  ? "បិទ"
                  : `${formatHour(schedule.openingTime)}–${formatHour(
                      schedule.closingTime,
                    )}`}
              </span>
            </div>
          );
        })}
      </div>

      {hasMore && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gray-50 py-2.5 text-sm font-semibold text-primary-700 transition hover:bg-primary-50"
        >
          {expanded ? (
            <>
              បង្រួម <IoChevronUpOutline className="text-base" />
            </>
          ) : (
            <>
              បង្ហាញបន្ថែម <IoChevronDownOutline className="text-lg" />
            </>
          )}
        </button>
      )}
    </section>
  );
}

function LoadingPage() {
  return (
    <main className="min-h-screen bg-slate-50 pb-14">
      <div className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:py-8">
        {/* Back Link Skeleton */}
        <div className="mb-5 h-6 w-32 animate-pulse rounded-md bg-gray-200" />

        {/* Top Profile Section Skeleton */}
        <div className="mb-8 grid items-start gap-6 lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px]">
          {/* Hero Skeleton */}
          <div className="h-[320px] animate-pulse rounded-[32px] border border-gray-100 bg-white p-3 shadow-sm ring-1 ring-black/5 sm:h-[390px] sm:p-4 lg:h-[450px]">
            <div className="h-full w-full rounded-[24px] bg-gray-100/80"></div>
          </div>

          {/* Schedule Sidebar Skeleton */}
          <div className="animate-pulse rounded-[32px] border border-gray-100/50 bg-white p-6 shadow-sm ring-1 ring-black/5 sm:p-8">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 shrink-0 rounded-full bg-gray-100"></div>
              <div className="space-y-2">
                <div className="h-5 w-24 rounded-md bg-gray-200"></div>
                <div className="h-4 w-32 rounded-md bg-gray-100"></div>
              </div>
            </div>
            <div className="mt-6 flex flex-col gap-3">
              <div className="h-11 w-full rounded-xl bg-gray-50"></div>
              <div className="h-11 w-full rounded-xl bg-gray-50"></div>
              <div className="h-11 w-full rounded-xl bg-gray-50"></div>
              <div className="h-11 w-full rounded-xl bg-gray-50"></div>
            </div>
          </div>
        </div>

        {/* Menu Section Header Skeleton */}
        <div className="space-y-6">
          <div className="flex flex-col gap-6 border-b border-gray-100 pb-8 pt-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-3">
              <div className="h-8 w-48 animate-pulse rounded-md bg-gray-200"></div>
              <div className="h-5 w-64 animate-pulse rounded-md bg-gray-100"></div>
            </div>

            <div className="flex w-full items-center gap-3 sm:min-w-[400px]">
              <div className="h-[56px] flex-1 animate-pulse rounded-[20px] bg-gray-100/80"></div>
              <div className="h-[56px] w-[56px] shrink-0 animate-pulse rounded-[20px] bg-gray-100 xl:hidden"></div>
            </div>
          </div>

          {/* Grid Layout Skeleton */}
          <div className="flex gap-7">
            {/* Desktop Filters Skeleton */}
            <div className="hidden w-[280px] shrink-0 xl:block">
              <div className="h-[600px] w-full animate-pulse rounded-[24px] border border-gray-100 bg-white shadow-sm ring-1 ring-black/5"></div>
            </div>

            {/* Menu Items Skeleton Grid */}
            <div className="grid flex-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
              {Array.from({ length: 9 }).map((_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-[24px] border border-gray-100 bg-white shadow-sm ring-1 ring-black/5"
                >
                  <div className="h-[220px] w-full animate-pulse bg-gray-100/80" />
                  <div className="p-5">
                    <div className="mb-3 h-6 w-3/4 animate-pulse rounded-md bg-gray-200" />
                    <div className="mb-5 h-4 w-1/2 animate-pulse rounded-md bg-gray-100" />
                    <div className="flex items-center justify-between pt-2">
                      <div className="h-6 w-20 animate-pulse rounded-md bg-gray-200" />
                      <div className="h-10 w-10 animate-pulse rounded-full bg-gray-100" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function StoreDetailPage({ storeUuid }: StoreDetailPageProps) {
  const [filters, setFilters] = useState<StoreMenuFilterState>(
    DEFAULT_STORE_MENU_FILTERS,
  );

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const {
    data: store,
    isLoading: storeLoading,
    isFetching: storeFetching,
    isError: storeError,
    refetch: refetchStore,
  } = useGetStoreByUuidQuery(storeUuid, {
    skip: !storeUuid,
  });

  const {
    data: allMenuItems = [],
    isLoading: menuLoading,
    isFetching: menuFetching,
    isError: menuError,
    refetch: refetchMenu,
  } = useGetMenuItemsQuery();

  const storeMenuItems = useMemo(() => {
    const canonicalStoreUuid = store?.uuid?.trim() || storeUuid.trim();

    return getStoreMenuItems(
      allMenuItems,
      canonicalStoreUuid,
      store?.storeName,
    );
  }, [allMenuItems, store?.uuid, store?.storeName, storeUuid]);

  const filterOptions = useMemo(
    () => buildStoreMenuFilterOptions(storeMenuItems),
    [storeMenuItems],
  );

  const filteredMenuItems = useMemo(
    () => applyStoreMenuFilters(storeMenuItems, filters),
    [storeMenuItems, filters],
  );

  const activeFilterCount = countActiveStoreMenuFilters(filters);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") {
      return;
    }

    const loadedStoreUuids = Array.from(
      new Set(
        allMenuItems
          .map((item) => item.store?.uuid?.trim())
          .filter((value): value is string => Boolean(value)),
      ),
    );

    console.log("[STORE DETAIL MENU DEBUG]", {
      routeStoreUuid: storeUuid,
      detailStoreUuid: store?.uuid,
      detailStoreName: store?.storeName,
      allMenuItemsCount: allMenuItems.length,
      storeMenuItemsCount: storeMenuItems.length,
      filteredMenuItemsCount: filteredMenuItems.length,
      loadedStoreUuids,
    });
  }, [
    allMenuItems,
    filteredMenuItems.length,
    store?.storeName,
    store?.uuid,
    storeMenuItems.length,
    storeUuid,
  ]);

  useEffect(() => {
    if (!mobileFiltersOpen) {
      return;
    }

    const previous = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileFiltersOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previous;

      window.removeEventListener("keydown", handleEscape);
    };
  }, [mobileFiltersOpen]);

  if (storeLoading || menuLoading) {
    return <LoadingPage />;
  }

  if (storeError || menuError || !store) {
    return (
      <main className="min-h-screen bg-white ">
        <div className="mx-auto flex min-h-[650px] max-w-3xl flex-col items-center justify-center px-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500">
            <FaStore className="text-[30px]" />
          </div>

          <h4 className="mt-5 text-[28px] font-bold text-primary-900">
            មិនអាចបង្ហាញព័ត៌មានហាងបានទេ
          </h4>

          <p className="mt-2 text-[18px] leading-8 text-gray-500">
            សូមព្យាយាមទាញយកព័ត៌មានហាង និងមុខម្ហូបម្តងទៀត។
          </p>

          <button
            type="button"
            onClick={() => {
              void refetchStore();
              void refetchMenu();
            }}
            className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-full bg-primary-800 px-6 text-[18px] font-semibold text-white transition hover:bg-primary-700"
          >
            <IoRefreshOutline className="text-[21px]" />
            ព្យាយាមម្តងទៀត
          </button>
        </div>
      </main>
    );
  }

  const busy = storeFetching || menuFetching;

  return (
    <main className="min-h-screen  pb-14">
      <div className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:py-8">
        {/* Back */}

        <Link
          href="/store"
          className="mb-5 inline-flex items-center gap-2 text-[18px] font-medium text-gray-500 transition hover:text-primary-800"
        >
          <IoArrowBack className="text-[21px]" />
          ត្រឡប់ទៅរកហាង
        </Link>

        <div className="mb-8 grid items-start gap-6 lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px]">
          <StoreHero store={store} />

          <div className="flex flex-col gap-6">
            <StoreLocationMapCard store={store} />
            <StoreOpeningHoursCard store={store} />
          </div>
        </div>

        {/* Menu Section Header */}
        <div className="space-y-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between border-b border-gray-100 pb-8 pt-4">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900">
              មុខម្ហូបប្រចាំហាង
            </h2>
            <p className="mt-2 text-lg text-slate-500">
              ស្វែងរកមុខម្ហូបដែលអ្នកចូលចិត្តក្នុងចំណោម <span className="font-semibold text-primary-700">{storeMenuItems.length}</span> ជម្រើស
            </p>
          </div>

          <div className="flex w-full min-w-0 sm:w-auto sm:min-w-[400px] items-center gap-3">
            <div className="flex min-h-[56px] flex-1 items-center gap-3 rounded-[20px] bg-slate-100/80 px-5 transition-all focus-within:bg-white focus-within:ring-2 focus-within:ring-primary-500 focus-within:shadow-md hover:bg-slate-100">
              <IoSearchOutline className="shrink-0 text-2xl text-slate-400" />
              <input
                type="search"
                value={filters.query}
                onChange={(event) =>
                  setFilters({
                    ...filters,
                    query: event.target.value,
                  })
                }
                placeholder="ស្វែងរកម្ហូប..."
                className="w-full bg-transparent text-lg text-slate-900 outline-none placeholder:text-slate-400"
              />
            </div>

            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className="relative flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-[20px] bg-primary-50 text-primary-700 transition-colors hover:bg-primary-100 xl:hidden"
              aria-label="Open menu filters"
            >
              <IoFilterOutline className="text-2xl" />

              {activeFilterCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-6 min-w-[24px] items-center justify-center rounded-full bg-secondary-500 px-1.5 text-sm font-bold text-white shadow-sm ring-2 ring-white">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

          {/* Filter + menu cards */}

          <div className="flex min-w-0 items-start gap-7">
            <StoreMenuFilterSidebar
              filters={filters}
              options={filterOptions}
              onChange={setFilters}
            />

            <section className="min-w-0 flex-1">
              {busy && (
                <div className="mb-4 rounded-xl bg-primary-50 px-4 py-3 text-[18px] text-primary-700">
                  កំពុងធ្វើបច្ចុប្បន្នភាពទិន្នន័យ...
                </div>
              )}

              {storeMenuItems.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-gray-200 bg-white px-5 py-14 text-center shadow-sm">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 text-primary-700">
                    <FaStore className="text-[27px]" />
                  </div>

                  <h3 className="mt-4 text-[22px] font-bold text-primary-900">
                    ហាងនេះមិនទាន់មានមុខម្ហូប
                  </h3>

                  <p className="mx-auto mt-2 max-w-xl text-[18px] leading-8 text-gray-500">
                    មិនមាន Menu Item ណាមួយក្នុងទិន្នន័យដែលភ្ជាប់ជាមួយហាងនេះទេ។
                  </p>

                  {process.env.NODE_ENV === "development" && (
                    <div className="mx-auto mt-5 max-w-2xl rounded-2xl bg-gray-50 p-4 text-left text-[16px] leading-7 text-gray-500">
                      <p>Store UUID: {store.uuid}</p>
                      <p>Loaded menu items: {allMenuItems.length}</p>
                      <p>Check Console: [STORE DETAIL MENU DEBUG]</p>
                    </div>
                  )}
                </div>
              ) : filteredMenuItems.length > 0 ? (
                <motion.div
                  layout
                  className="grid gap-5 sm:grid-cols-2 2xl:grid-cols-3"
                >
                  <AnimatePresence>
                    {filteredMenuItems.map((food) => (
                      <motion.div
                        layout
                        key={food.uuid}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                      >
                        <FoodCard food={food} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <div className="rounded-[24px] border border-dashed border-gray-200 bg-white px-5 py-14 text-center shadow-sm">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 text-primary-700">
                    <IoSearchOutline className="text-[28px]" />
                  </div>

                  <h3 className="mt-4 text-[22px] font-bold text-primary-900">
                    មិនមានមុខម្ហូបត្រូវនឹងតម្រង
                  </h3>

                  <p className="mx-auto mt-2 max-w-xl text-[18px] leading-8 text-gray-500">
                    ហាងនេះមាន {storeMenuItems.length} មុខម្ហូប
                    ប៉ុន្តែតម្រងបច្ចុប្បន្នបានដកលទ្ធផលទាំងអស់ចេញ។
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      setFilters({
                        ...DEFAULT_STORE_MENU_FILTERS,
                        query: "",
                      })
                    }
                    className="mt-5 rounded-full bg-primary-800 px-5 py-3 text-[18px] font-semibold text-white transition hover:bg-primary-700"
                  >
                    សម្អាតតម្រងទាំងអស់
                  </button>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}

      <AnimatePresence>
        {mobileFiltersOpen && (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            className="fixed inset-0 z-[120] xl:hidden"
          >
            <button
              type="button"
              aria-label="Close menu filters"
              onClick={() => setMobileFiltersOpen(false)}
              className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
            />

            <motion.div
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
              className="absolute inset-x-0 bottom-0 h-[90dvh] overflow-hidden rounded-t-[28px] bg-white sm:left-auto sm:h-full sm:w-[390px] sm:rounded-none sm:rounded-l-[28px]"
            >
              <StoreMenuFilterSidebar
                mobile
                filters={filters}
                options={filterOptions}
                onChange={setFilters}
                onClose={() => setMobileFiltersOpen(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
