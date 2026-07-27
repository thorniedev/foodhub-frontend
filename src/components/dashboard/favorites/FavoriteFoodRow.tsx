"use client";

import { useState } from "react";
import { Bookmark, Store, Star, Clock, Bike } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FavoriteFoodItem } from "@/types/favorite";

interface FavoriteFoodRowProps {
  item: FavoriteFoodItem;
  onRemove?: (id: string) => void;
  onViewMore?: (id: string) => void;
}

export default function FavoriteFoodRow({
  item,
  onRemove,
  onViewMore,
}: FavoriteFoodRowProps) {
  const [saved, setSaved] = useState(true);

  const handleToggleSaved = () => {
    setSaved((s) => !s);
    onRemove?.(item.id);
  };

  return (
    <div className="relative flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.imageUrl}
        alt={item.dishName}
        className="h-20 w-20 shrink-0 rounded-xl object-cover"
      />

      <div className="min-w-0 flex-1">
        <h3 className="font-semibold text-slate-800">{item.dishName}</h3>
        <p className="mt-0.5 flex items-center gap-1.5 text-sm font-medium text-orange-500">
          <Store className="h-3.5 w-3.5" />
          {item.restaurantName}
        </p>
        <span className="mt-1 inline-block rounded-md bg-emerald-700 px-2 py-0.5 text-xs font-medium text-white">
          {item.categoryLabel}
        </span>
        <div className="mt-1.5 flex items-center gap-3 text-sm text-slate-500">
          <span className="flex items-center gap-1 text-amber-500">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            {item.rating}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {item.etaMinutes} min
          </span>
          <span className="flex items-center gap-1 text-emerald-600">
            <Bike className="h-3.5 w-3.5" />
            {item.distanceKm}km
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onViewMore?.(item.id)}
        className="shrink-0 self-start text-sm text-slate-400 hover:text-emerald-600"
      >
        មើលបន្ថែម
      </button>

      <button
        type="button"
        onClick={handleToggleSaved}
        aria-label="ដកចេញពីចំណូលចិត្ត"
        className="absolute right-3 top-3 text-orange-500"
      >
        <Bookmark className={cn("h-5 w-5", saved && "fill-orange-500")} />
      </button>
    </div>
  );
}
