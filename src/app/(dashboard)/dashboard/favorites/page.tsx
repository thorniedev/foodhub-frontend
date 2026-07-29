"use client";

import { useState } from "react";
import { Heart, Bookmark } from "lucide-react";
import FavoriteFoodRow from "@/components/dashboard/favorites/FavoriteFoodRow";
import type { FavoriteFoodItem } from "@/types/favorite";

const initialFavorites: FavoriteFoodItem[] = Array.from(
  { length: 8 },
  (_, i) => ({
    id: `fav-${i}`,
    imageUrl: `/Image/food/food${(i % 10) + 1}.png`,
    dishName: "មីឆាសាច់គោ",
    restaurantName: "Kongfou Kitchen",
    categoryLabel: "ហាឡាល់",
    rating: 4.3,
    etaMinutes: 15,
    distanceKm: 2,
  }),
);

export default function FavoritesPage() {
  const [favorites, setFavorites] =
    useState<FavoriteFoodItem[]>(initialFavorites);

  const handleRemove = (id: string) => {
    setFavorites((items) => items.filter((item) => item.id !== id));
  };

  const handleClearAll = () => {
    setFavorites([]);
  };

  return (
    <div className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-6">
      {/* Title */}
      <p className="flex items-center gap-2 text-2xl font-bold text-[#136C34] sm:text-4xl">
        <Heart className="h-4 w-4 shrink-0 fill-[#136C34] sm:h-5 sm:w-5" />
        ចំណីអាហារចំណូលចិត្ត
      </p>

      {/* Count + Clear All */}
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-sm text-[#F97316] sm:text-md">
          <Bookmark className="h-4 w-4 shrink-0 text-[#F97316]" />
          មុខម្ហូបចំនួន {favorites.length} ត្រូវបានក្សាទុក
        </p>

        {favorites.length > 0 && (
          <button
            type="button"
            onClick={handleClearAll}
            className="text-sm font-medium text-red-600 hover:underline sm:text-md"
          >
            លុបទាំងអស់
          </button>
        )}
      </div>

      {/* Favorite Cards */}
      {favorites.length > 0 ? (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:mt-5 sm:gap-4 lg:grid-cols-2">
          {favorites.map((item) => (
            <FavoriteFoodRow
              key={item.id}
              item={item}
              onRemove={handleRemove}
              onViewMore={(id) => console.log("view more", id)}
            />
          ))}
        </div>
      ) : (
        <p className="mt-8 text-center text-sm text-slate-400">
          អ្នកមិនទាន់មានមុខម្ហូបចំណូលចិត្តទេ
        </p>
      )}
    </div>
  );
}