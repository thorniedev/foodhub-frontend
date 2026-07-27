"use client";

import { useState } from "react";
import { Heart, Bookmark } from "lucide-react";
import FavoriteFoodRow from "@/components/dashboard/favorites/FavoriteFoodRow";
import type { FavoriteFoodItem } from "@/types/favorite";

const initialFavorites: FavoriteFoodItem[] = Array.from(
  { length: 8 },
  (_, i) => ({
    id: `fav-${i}`,
    imageUrl: "https://placehold.co/160x160?text=Mi",
    dishName: "មីឆាសាច់គោ",
    restaurantName: "Kongfou Kitchen",
    categoryLabel: "ហាន្សាល់",
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
    <div className="mx-auto max-w-6xl px-6 py-6">
      <h1 className="flex items-center gap-2 text-xl font-bold text-emerald-600">
        <Heart className="h-5 w-5 fill-emerald-600" />
        ចំណីអាហារចំណូលចិត្ត
      </h1>
      <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
        <Bookmark className="h-4 w-4 text-slate-400" />
        មុខម្ហូបចំនួន {favorites.length} ត្រូវបានក្សាទុក
      </p>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {favorites.map((item) => (
          <FavoriteFoodRow
            key={item.id}
            item={item}
            onRemove={handleRemove}
            onViewMore={(id) => console.log("view more", id)}
          />
        ))}
      </div>

      {favorites.length === 0 ? (
        <p className="mt-8 text-center text-sm text-slate-400">
          អ្នកមិនទាន់មានមុខម្ហូបចំណូលចិត្តទេ
        </p>
      ) : (
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={handleClearAll}
            className="text-sm font-medium text-emerald-600 hover:underline"
          >
            លុបទាំងអស់
          </button>
        </div>
      )}
    </div>
  );
}
