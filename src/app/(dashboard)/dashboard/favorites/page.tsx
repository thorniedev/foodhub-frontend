"use client";

import React, { useState, useMemo, useRef, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bookmark,
  Utensils,
  Store,
  Trash2,
  ExternalLink,
  Shield,
  Loader2,
  Calendar,
  Layers,
  ArrowLeft,
  ChevronDown,
  Check,
  Users,
} from "lucide-react";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useActiveProfile } from "@/hooks/useActiveProfile";
import {
  ProfileAvatar,
  RELATIONSHIP_LABELS,
} from "@/components/profile/ProfileMultiSelect";
import {
  useGetMenuItemsQuery,
  useGetMenuItemByUuidQuery,
} from "@/app/store/menuApi";
import { useGetStoresQuery } from "@/app/store/locationApi";
import { DEFAULT_FOOD_IMAGE, toFrontendApiAssetUrl } from "@/lib/catalog-media";
import type { BookmarkResponse } from "@/types/interaction";
import type { CatalogMenuItem } from "@/types/catalog-menu-item";
import type { FoodStore } from "@/types/store-page";

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "ថ្មីៗនេះ";
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat("km-KH", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(d);
  } catch {
    return "ថ្មីៗនេះ";
  }
}

function DishBookmarkCard({
  bookmark,
  onRemove,
  allMenuItems,
}: {
  bookmark: BookmarkResponse;
  onRemove: (uuid: string) => void;
  allMenuItems: CatalogMenuItem[];
}) {
  const menuItemUuid = bookmark.menuItemUuid || bookmark.foodUuid || "";
  const { data: itemDetail } = useGetMenuItemByUuidQuery(menuItemUuid, {
    skip: !menuItemUuid,
  });

  const cachedItem = allMenuItems.find(
    (m) =>
      m.uuid === menuItemUuid ||
      m.food?.uuid === menuItemUuid ||
      m.name === menuItemUuid ||
      m.localName === menuItemUuid,
  );

  const title =
    itemDetail?.localName ||
    itemDetail?.name ||
    cachedItem?.localName ||
    cachedItem?.name ||
    "មុខម្ហូប";

  const rawPrice = itemDetail?.price ?? cachedItem?.price;
  const price = rawPrice != null ? `$${Number(rawPrice).toFixed(2)}` : null;

  const storeName = itemDetail?.store?.name || cachedItem?.store?.name || null;

  const rawThumbnail =
    itemDetail?.thumbnail || cachedItem?.thumbnail || "/Image/default-food.png";
  const thumbnail = toFrontendApiAssetUrl(rawThumbnail, DEFAULT_FOOD_IMAGE);

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-500/40 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:gap-5 sm:p-6">
      <div className="flex items-center gap-4 sm:gap-5">
        <div className="relative h-22 w-22 shrink-0 overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800 sm:h-24 sm:w-24">
          <Image
            src={thumbnail}
            alt={title}
            fill
            sizes="96px"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        </div>

        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-sm font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
              <Utensils className="h-3.5 w-3.5" /> មុខម្ហូប
            </span>
            <span className="flex items-center gap-1 text-base text-slate-400">
              <Calendar className="h-3.5 w-3.5" />{" "}
              {formatDate(bookmark.createdAt)}
            </span>
          </div>

          <h3 className="truncate text-lg font-bold text-slate-900 dark:text-white sm:text-xl">
            {title}
          </h3>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-base text-slate-500 dark:text-slate-400">
            {storeName && <span className="truncate">📍 {storeName}</span>}
            {price && (
              <span className="font-extrabold text-emerald-700 dark:text-emerald-400">
                {price}
              </span>
            )}
            {bookmark.notes && (
              <span className="italic text-slate-400">📝 {bookmark.notes}</span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end gap-2.5 border-t border-slate-100 pt-3 dark:border-slate-800 sm:mt-0 sm:border-0 sm:pt-0">
        {menuItemUuid && (
          <Link
            href={`/menu/${menuItemUuid}`}
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-2.5 text-base font-bold text-emerald-700 transition hover:bg-emerald-600 hover:text-white dark:bg-emerald-950/60 dark:text-emerald-400 dark:hover:bg-emerald-600 dark:hover:text-white"
          >
            <ExternalLink className="h-4 w-4" />
            <span>មើល</span>
          </Link>
        )}

        <button
          type="button"
          onClick={() => onRemove(bookmark.uuid)}
          title="ដកចេញពីចំណូលចិត្ត"
          className="rounded-2xl border border-slate-200 p-2.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:border-slate-800 dark:hover:bg-rose-950/40"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

function StoreBookmarkCard({
  bookmark,
  onRemove,
  allStores,
}: {
  bookmark: BookmarkResponse;
  onRemove: (uuid: string) => void;
  allStores: FoodStore[];
}) {
  const storeUuid = bookmark.storeUuid || "";
  const store = allStores.find((s) => s.uuid === storeUuid);
  const storeName = store?.storeName || "ហាង";
  const storeLogo = toFrontendApiAssetUrl(
    store?.logoMediaUuid ? `/api/v1/media/${store.logoMediaUuid}` : undefined,
    "/Image/default-food.png",
  );

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-500/40 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:gap-5 sm:p-6">
      <div className="flex items-center gap-4 sm:gap-5">
        <div className="relative flex h-22 w-22 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-amber-50 dark:bg-slate-800 sm:h-24 sm:w-24">
          {store?.logoMediaUuid ? (
            <Image
              src={storeLogo}
              alt={storeName}
              fill
              sizes="96px"
              className="object-cover transition duration-300 group-hover:scale-105"
            />
          ) : (
            <Store className="h-10 w-10 text-amber-600 dark:text-amber-400" />
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1 text-sm font-bold text-amber-700 dark:bg-amber-950 dark:text-amber-400">
              <Store className="h-3.5 w-3.5" /> ហាង
            </span>
            <span className="flex items-center gap-1 text-base text-slate-400">
              <Calendar className="h-3.5 w-3.5" />{" "}
              {formatDate(bookmark.createdAt)}
            </span>
          </div>

          <h3 className="truncate text-lg font-bold text-slate-900 dark:text-white sm:text-xl">
            {storeName}
          </h3>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-base text-slate-500 dark:text-slate-400">
            {(store?.addressLine || store?.city) && (
              <span className="truncate">
                📍 {store?.addressLine || store?.city}
              </span>
            )}
            {/* {store?.averageRating != null && (
              <span className="font-bold text-amber-600">
                ⭐ {store.averageRating}
              </span>
            )} */}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end gap-2.5 border-t border-slate-100 pt-3 dark:border-slate-800 sm:mt-0 sm:border-0 sm:pt-0">
        {storeUuid && (
          <Link
            href={`/stores/${storeUuid}`}
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-2.5 text-base font-bold text-emerald-700 transition hover:bg-emerald-600 hover:text-white dark:bg-emerald-950/60 dark:text-emerald-400 dark:hover:bg-emerald-600 dark:hover:text-white"
          >
            <ExternalLink className="h-4 w-4" />
            <span>មើល</span>
          </Link>
        )}

        <button
          type="button"
          onClick={() => onRemove(bookmark.uuid)}
          title="ដកចេញពីចំណូលចិត្ត"
          className="rounded-2xl border border-slate-200 p-2.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:border-slate-800 dark:hover:bg-rose-950/40"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

function FavoritesContent() {
  const { profiles, activeProfile, selectAll } = useActiveProfile();
  const [selectedProfileUuid, setSelectedProfileUuid] = useState<string | null>(
    null,
  );
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isProfileMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(e.target as Node)
      ) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isProfileMenuOpen]);

  const currentProfile = useMemo(() => {
    if (selectedProfileUuid) {
      const found = profiles.find((p) => p.uuid === selectedProfileUuid);
      if (found) return found;
    }
    return activeProfile || profiles[0] || null;
  }, [selectedProfileUuid, profiles, activeProfile]);

  const currentProfileUuid = currentProfile?.uuid;

  const { bookmarks, loading, removeBookmark } = useBookmarks(
    0,
    50,
    currentProfileUuid,
  );

  const handleSwitchProfile = (uuid: string) => {
    setSelectedProfileUuid(uuid);
    selectAll([uuid]);
    setIsProfileMenuOpen(false);
  };

  const [filterTab, setFilterTab] = useState<"all" | "dishes" | "stores">(
    "all",
  );
  const { data: allMenuItems = [] } = useGetMenuItemsQuery();
  const { data: allStores = [] } = useGetStoresQuery();

  const dishes = useMemo(
    () => bookmarks.filter((b) => Boolean(b.menuItemUuid || b.foodUuid)),
    [bookmarks],
  );

  const stores = useMemo(
    () =>
      bookmarks.filter((b) =>
        Boolean(b.storeUuid && !b.menuItemUuid && !b.foodUuid),
      ),
    [bookmarks],
  );

  const displayedBookmarks = useMemo(() => {
    if (filterTab === "dishes") return dishes;
    if (filterTab === "stores") return stores;
    return bookmarks;
  }, [filterTab, dishes, stores, bookmarks]);

  const handleRemove = async (bookmarkUuid: string) => {
    try {
      await removeBookmark(bookmarkUuid);
    } catch (err) {
      console.error("Failed to remove bookmark:", err);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-20">
      {/* Clean Dashboard Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3.5 pt-5">
          <Link
            href="/dashboard"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 transition hover:bg-slate-200 active:scale-95 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            title="ត្រឡប់ក្រោយ"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              ចំណូលចិត្ត
            </h1>
            <p className="truncate text-sm font-medium text-slate-500 dark:text-slate-400 sm:text-base">
              {bookmarks.length} មុខម្ហូប និងហាងដែលអ្នកបានរក្សាទុក
            </p>
          </div>
        </div>

        {/* Profile Switcher Dropdown */}
        {currentProfile && (
          <div ref={profileMenuRef} className="relative self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setIsProfileMenuOpen((prev) => !prev)}
              aria-haspopup="listbox"
              aria-expanded={isProfileMenuOpen}
              className="group inline-flex items-center gap-2 rounded-2xl border border-emerald-300/80 bg-emerald-50/50 px-3.5 py-2 text-sm font-semibold text-emerald-950 shadow-xs transition-all hover:border-emerald-400 hover:bg-emerald-100/60 active:scale-[0.98] dark:border-emerald-800/80 dark:bg-slate-900 dark:text-emerald-200 dark:hover:bg-emerald-950/50 cursor-pointer"
              title="ចុចដើម្បីប្តូរប្រវត្តិរូប"
            >
              <ProfileAvatar
                name={currentProfile.profileName}
                avatarMediaUuid={currentProfile.avatarMediaUuid}
                size={26}
              />
              <span className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="text-slate-600 dark:text-slate-400 font-medium">
                  ប្រវត្តិរូប៖
                </span>
                <strong className="font-bold text-slate-900 dark:text-white">
                  {currentProfile.profileName}
                </strong>
              </span>
              <span className="ml-1 inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white shadow-2xs transition group-hover:bg-emerald-700">
                ប្តូរប្រវត្តិរូប
                <ChevronDown
                  className={`h-3.5 w-3.5 text-white transition-transform duration-200 ${
                    isProfileMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </span>
            </button>

            {/* Dropdown Popover */}
            <AnimatePresence>
              {isProfileMenuOpen && profiles.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full z-40 mt-2 w-72 origin-top-right overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-1.5 shadow-xl dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="border-b border-slate-100 px-3 py-2 dark:border-slate-800">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      ប្តូរប្រវត្តិរូប (Switch Profile)
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      មើលមុខម្ហូបចំណូលចិត្តតាមគណនីគ្រួសារ
                    </p>
                  </div>

                  <div className="max-h-64 overflow-y-auto py-1 space-y-0.5">
                    {profiles.map((profile) => {
                      const isSelected = profile.uuid === currentProfileUuid;
                      const relationshipLabel =
                        RELATIONSHIP_LABELS[profile.relationship] ??
                        profile.relationship;

                      return (
                        <button
                          key={profile.uuid}
                          type="button"
                          onClick={() => handleSwitchProfile(profile.uuid)}
                          className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all ${
                            isSelected
                              ? "bg-emerald-50 font-bold text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200"
                              : "text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <ProfileAvatar
                              name={profile.profileName}
                              avatarMediaUuid={profile.avatarMediaUuid}
                              size={32}
                            />
                            <div className="min-w-0">
                              <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                                {profile.profileName}
                              </p>
                              <p className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                                <span>{relationshipLabel}</span>
                                {profile.isDefault && (
                                  <span className="rounded-full bg-slate-100 px-1.5 py-0.2 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                    មេគ្រួសារ
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>

                          {isSelected && (
                            <Check className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="border-t border-slate-100 p-1.5 dark:border-slate-800">
                    <Link
                      href="/dashboard"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/40"
                    >
                      <Users className="h-3.5 w-3.5" />
                      <span>គ្រប់គ្រងគណនីគ្រួសារ</span>
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Quick Profile Chips (When more than 1 profile) */}
      {profiles.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 scrollbar-none">
          <span className="flex shrink-0 items-center gap-1.5 pl-1 text-xs font-bold text-slate-400 dark:text-slate-500">
            <Users className="h-3.5 w-3.5" />
            <span>ប្រវត្តិរូប៖</span>
          </span>
          <div className="flex items-center gap-1.5">
            {profiles.map((p) => {
              const isSelected = p.uuid === currentProfileUuid;
              return (
                <button
                  key={p.uuid}
                  type="button"
                  onClick={() => handleSwitchProfile(p.uuid)}
                  className={`inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all active:scale-[0.98] ${
                    isSelected
                      ? "bg-emerald-600 text-white shadow-xs shadow-emerald-600/25 ring-2 ring-emerald-600/30"
                      : "border border-slate-200/90 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                >
                  <ProfileAvatar
                    name={p.profileName}
                    avatarMediaUuid={p.avatarMediaUuid}
                    size={20}
                  />
                  <span>{p.profileName}</span>
                  {p.isDefault && !isSelected && (
                    <span className="text-[10px] opacity-70">(មេ)</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter Tabs (Mobile Responsive with no line-breaking) */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setFilterTab("all")}
          className={`flex flex-1 items-center justify-center gap-2 border-b-2 px-3 py-3 text-sm font-bold whitespace-nowrap transition sm:flex-initial sm:px-5 sm:py-3.5 sm:text-base md:text-lg ${
            filterTab === "all"
              ? "border-emerald-600 text-emerald-700 dark:border-emerald-400 dark:text-emerald-400"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          <Layers className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
          <span>ទាំងអស់</span>
          <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            {bookmarks.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setFilterTab("dishes")}
          className={`flex flex-1 items-center justify-center gap-2 border-b-2 px-3 py-3 text-sm font-bold whitespace-nowrap transition sm:flex-initial sm:px-5 sm:py-3.5 sm:text-base md:text-lg ${
            filterTab === "dishes"
              ? "border-emerald-600 text-emerald-700 dark:border-emerald-400 dark:text-emerald-400"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          <Utensils className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
          <span>មុខម្ហូប</span>
          <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            {dishes.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setFilterTab("stores")}
          className={`flex flex-1 items-center justify-center gap-2 border-b-2 px-3 py-3 text-sm font-bold whitespace-nowrap transition sm:flex-initial sm:px-5 sm:py-3.5 sm:text-base md:text-lg ${
            filterTab === "stores"
              ? "border-emerald-600 text-emerald-700 dark:border-emerald-400 dark:text-emerald-400"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          <Store className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
          <span>ហាង</span>
          <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            {stores.length}
          </span>
        </button>
      </div>

      {/* Bookmarks List */}
      {loading && bookmarks.length === 0 ? (
        <div className="flex h-56 flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <p className="text-base text-slate-400 sm:text-lg">
            កំពុងទាញយកចំណូលចិត្ត...
          </p>
        </div>
      ) : displayedBookmarks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white p-8 py-12 text-center shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:p-16">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 sm:h-20 sm:w-20">
            <Bookmark className="h-8 w-8 sm:h-10 sm:w-10" />
          </div>
          <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white sm:mt-5 sm:text-2xl">
            {currentProfile
              ? `មិនទាន់មានចំណូលចិត្តសម្រាប់ ${currentProfile.profileName}`
              : filterTab === "all"
              ? "មិនទាន់មានចំណូលចិត្ត"
              : filterTab === "dishes"
                ? "មិនទាន់មានមុខម្ហូបចំណូលចិត្ត"
                : "មិនទាន់មានហាងចំណូលចិត្ត"}
          </h3>
          <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-slate-500 dark:text-slate-400 sm:mt-2 sm:text-base">
            ចុចរូបបេះដូងលើមុខម្ហូប ឬហាង ដើម្បីរក្សាទុកនៅទីនេះ។
          </p>
          <div className="mt-6 flex gap-4 sm:mt-8">
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 text-base font-bold text-white shadow-md transition hover:bg-emerald-700 active:scale-95 sm:text-lg"
            >
              <Utensils className="h-5 w-5" />
              <span>មើលមុខម្ហូប</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {displayedBookmarks.map((bookmark) =>
            bookmark.storeUuid && !bookmark.menuItemUuid ? (
              <StoreBookmarkCard
                key={bookmark.uuid}
                bookmark={bookmark}
                onRemove={handleRemove}
                allStores={allStores}
              />
            ) : (
              <DishBookmarkCard
                key={bookmark.uuid}
                bookmark={bookmark}
                onRemove={handleRemove}
                allMenuItems={allMenuItems}
              />
            ),
          )}
        </div>
      )}
    </div>
  );
}

export default function FavoritesPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex h-64 max-w-5xl items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      }
    >
      <FavoritesContent />
    </Suspense>
  );
}
