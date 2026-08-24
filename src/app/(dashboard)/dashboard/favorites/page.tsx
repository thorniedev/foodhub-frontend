"use client";

import React, { useState, useMemo, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
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
} from "lucide-react";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useGetMenuItemByUuidQuery } from "@/app/store/menuApi";
import type { BookmarkResponse } from "@/types/interaction";

function getMediaUrl(value: string | null | undefined): string {
  if (!value) return "/Image/default-food.png";
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  if (value.startsWith("/api/v1/")) return `/api/${value.slice("/api/v1/".length)}`;
  if (value.startsWith("/")) return value;
  return `/${value}`;
}

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
}: {
  bookmark: BookmarkResponse;
  onRemove: (uuid: string) => void;
}) {
  const menuItemUuid = bookmark.menuItemUuid || bookmark.foodUuid || "";
  const { data: itemDetail, isLoading } = useGetMenuItemByUuidQuery(menuItemUuid, {
    skip: !menuItemUuid,
  });

  const title =
    itemDetail?.localName || itemDetail?.name || "មុខម្ហូប";
  const price = itemDetail?.price != null ? `$${Number(itemDetail.price).toFixed(2)}` : null;
  const storeName = itemDetail?.store?.name || null;
  const thumbnail = itemDetail?.thumbnail || "/Image/default-food.png";

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-4 shadow-xs transition hover:border-emerald-500/40 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:gap-4 sm:p-5">
      <div className="flex items-center gap-4">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800">
          <Image
            src={getMediaUrl(thumbnail)}
            alt={title}
            fill
            sizes="80px"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
              <Utensils className="h-3 w-3" /> មុខម្ហូប
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <Calendar className="h-3 w-3" /> {formatDate(bookmark.createdAt)}
            </span>
          </div>

          <h3 className="mt-1 truncate text-base font-bold text-slate-900 dark:text-white">
            {isLoading ? "កំពុងផ្ទុកមុខម្ហូប..." : title}
          </h3>

          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
            {storeName && <span>📍 {storeName}</span>}
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

      <div className="mt-4 flex items-center justify-end gap-2 border-t border-slate-100 pt-3 dark:border-slate-800 sm:mt-0 sm:border-0 sm:pt-0">
        {menuItemUuid && (
          <Link
            href={`/menu-items/${menuItemUuid}`}
            className="inline-flex items-center gap-1.5 rounded-2xl bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-600 hover:text-white dark:bg-emerald-950/60 dark:text-emerald-400 dark:hover:bg-emerald-600 dark:hover:text-white"
          >
            <ExternalLink className="h-3.5 w-3.5" /> មើល
          </Link>
        )}

        <button
          type="button"
          onClick={() => onRemove(bookmark.uuid)}
          title="ដកចេញពីចំណូលចិត្ត"
          className="rounded-2xl border border-slate-200 p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:border-slate-800 dark:hover:bg-rose-950/40"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function StoreBookmarkCard({
  bookmark,
  onRemove,
}: {
  bookmark: BookmarkResponse;
  onRemove: (uuid: string) => void;
}) {
  const storeUuid = bookmark.storeUuid || "";

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-4 shadow-xs transition hover:border-emerald-500/40 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:gap-4 sm:p-5">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
          <Store className="h-8 w-8" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
              <Store className="h-3 w-3" /> ហាង
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <Calendar className="h-3 w-3" /> {formatDate(bookmark.createdAt)}
            </span>
          </div>

          <h3 className="mt-1 truncate text-base font-bold text-slate-900 dark:text-white">
            ហាង
          </h3>

          {bookmark.notes && (
            <p className="mt-1 text-xs italic text-slate-400">
              📝 {bookmark.notes}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end gap-2 border-t border-slate-100 pt-3 dark:border-slate-800 sm:mt-0 sm:border-0 sm:pt-0">
        {storeUuid && (
          <Link
            href={`/stores/${storeUuid}`}
            className="inline-flex items-center gap-1.5 rounded-2xl bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-600 hover:text-white dark:bg-emerald-950/60 dark:text-emerald-400 dark:hover:bg-emerald-600 dark:hover:text-white"
          >
            <ExternalLink className="h-3.5 w-3.5" /> មើលហាង
          </Link>
        )}

        <button
          type="button"
          onClick={() => onRemove(bookmark.uuid)}
          title="ដកចេញពីចំណូលចិត្ត"
          className="rounded-2xl border border-slate-200 p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:border-slate-800 dark:hover:bg-rose-950/40"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function FavoritesContent() {
  const [filterTab, setFilterTab] = useState<"all" | "dishes" | "stores">("all");
  const { bookmarks, loading, activeProfile, removeBookmark } = useBookmarks();

  const dishes = useMemo(
    () => bookmarks.filter((b) => b.menuItemUuid || b.foodUuid),
    [bookmarks]
  );
  const stores = useMemo(() => bookmarks.filter((b) => b.storeUuid), [bookmarks]);

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
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col gap-4 rounded-3xl bg-linear-to-r from-emerald-800 to-teal-950 p-6 text-white shadow-xl sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Bookmark className="h-6 w-6 fill-current text-emerald-300" />
            <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
              ចំណូលចិត្ត
            </h2>
          </div>
          <p className="text-sm text-emerald-100/90">
            មុខម្ហូប និងហាងដែលអ្នកបានរក្សាទុកសម្រាប់ប្រវត្តិរូបរបស់អ្នក។
          </p>
        </div>

        {activeProfile && (
          <div className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2.5 text-xs font-semibold text-white backdrop-blur-sm">
            <Shield className="h-4 w-4 text-emerald-300" />
            <span>ប្រវត្តិរូប៖ <strong>{activeProfile.profileName}</strong></span>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setFilterTab("all")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3.5 text-sm font-bold transition ${
            filterTab === "all"
              ? "border-emerald-600 text-emerald-700 dark:border-emerald-400 dark:text-emerald-400"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>ទាំងអស់</span>
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            {bookmarks.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setFilterTab("dishes")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3.5 text-sm font-bold transition ${
            filterTab === "dishes"
              ? "border-emerald-600 text-emerald-700 dark:border-emerald-400 dark:text-emerald-400"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          <Utensils className="h-4 w-4" />
          <span>មុខម្ហូប</span>
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            {dishes.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setFilterTab("stores")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3.5 text-sm font-bold transition ${
            filterTab === "stores"
              ? "border-emerald-600 text-emerald-700 dark:border-emerald-400 dark:text-emerald-400"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          <Store className="h-4 w-4" />
          <span>ហាង</span>
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            {stores.length}
          </span>
        </button>
      </div>

      {/* Bookmarks List */}
      {loading && bookmarks.length === 0 ? (
        <div className="flex h-56 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : displayedBookmarks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-800">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50">
            <Bookmark className="h-8 w-8" />
          </div>
          <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
            {filterTab === "all"
              ? "មិនទាន់មានចំណូលចិត្ត"
              : filterTab === "dishes"
              ? "មិនទាន់មានមុខម្ហូបចំណូលចិត្ត"
              : "មិនទាន់មានហាងចំណូលចិត្ត"}
          </h3>
          <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
            ចុចរូបបេះដូងលើមុខម្ហូប ឬហាង ដើម្បីរក្សាទុកនៅទីនេះ។
          </p>
          <div className="mt-6 flex gap-3">
            <Link
              href="/menu"
              className="rounded-2xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-emerald-700 transition"
            >
              មើលមុខម្ហូប
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
              />
            ) : (
              <DishBookmarkCard
                key={bookmark.uuid}
                bookmark={bookmark}
                onRemove={handleRemove}
              />
            )
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
