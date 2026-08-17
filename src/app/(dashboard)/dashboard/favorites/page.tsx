"use client";

import { useEffect, useState } from "react";
import { Bookmark } from "lucide-react";
import { useRouter } from "next/navigation";

import FavoriteFoodRow from "@/components/dashboard/favorites/FavoriteFoodRow";

import {
  clearFavorites,
  FAVORITES_UPDATED_EVENT,
  getFavorites,
  removeFavorite,
  type StoredFavoriteFood,
} from "@/lib/favorites/favorites";

export default function FavoritesPage() {
  const router = useRouter();

  const [favorites, setFavorites] = useState<StoredFavoriteFood[]>([]);

  useEffect(() => {
    const updateFavorites = () => {
      const storedFavorites = getFavorites();

      console.log("FAVORITES:", storedFavorites);

      setFavorites(storedFavorites);
    };

    // Load localStorage when page opens
    updateFavorites();

    // Listen when user adds/removes favorite
    window.addEventListener(FAVORITES_UPDATED_EVENT, updateFavorites);

    return () => {
      window.removeEventListener(FAVORITES_UPDATED_EVENT, updateFavorites);
    };
  }, []);

  const handleRemove = (id: string) => {
    removeFavorite(id);
  };

  const handleClearAll = () => {
    clearFavorites();
  };

  const handleViewMore = (id: string) => {
    router.push(`/menu-items/${id}`);
  };

  return (
    <div className="mx-auto max-w-6xl ">
      {/* Title */}
      <h4 className="text-[28px] font-bold text-slate-900">
        ចំណីអាហារចំណូលចិត្ត
      </h4>

      {/* Count + Clear all */}
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-[17px] text-[#F97316]">
          <Bookmark className="h-5 w-5 shrink-0" />
          មុខម្ហូបចំនួន {favorites.length} ត្រូវបានរក្សាទុក
        </p>

        {favorites.length > 0 && (
          <button
            type="button"
            onClick={handleClearAll}
            className="cursor-pointer text-[17px] font-medium text-red-600 transition hover:underline"
          >
            លុបទាំងអស់
          </button>
        )}
      </div>

      {/* Favorites */}
      {favorites.length > 0 ? (
        <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {favorites.map((item) => (
            <FavoriteFoodRow
              key={item.id}
              item={item}
              onRemove={handleRemove}
              onViewMore={handleViewMore}
            />
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
          <p className="text-[18px] font-semibold text-slate-600">
            អ្នកមិនទាន់មានមុខម្ហូបចំណូលចិត្តទេ
          </p>

          <p className="mt-2 text-[17px] text-slate-400">
            ចុចលើរូបបេះដូងនៅលើមុខម្ហូប ដើម្បីរក្សាទុកជាចំណូលចិត្ត។
          </p>
        </div>
      )}
    </div>
  );
}
