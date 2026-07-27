"use client";

import { useState } from "react";
import { Heart, Store, Star, Clock, Bike, Clock3 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FoodRecommendation } from "@/types/family-profile";

interface FoodRecommendationCardProps {
  item: FoodRecommendation;
  onToggleFavorite?: (id: string) => void;
}

export default function FoodRecommendationCard({
  item,
  onToggleFavorite,
}: FoodRecommendationCardProps) {
  const [favorite, setFavorite] = useState(item.isFavorite);

  const handleFavoriteClick = () => {
    setFavorite((f) => !f);
    onToggleFavorite?.(item.id);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="relative h-44 w-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.imageUrl}
          alt={item.dishName}
          className="h-full w-full object-cover"
        />
        <button
          type="button"
          onClick={handleFavoriteClick}
          aria-label="ចំណូលចិត្ត"
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm"
        >
          <Heart
            className={cn(
              "h-4 w-4",
              favorite ? "fill-emerald-600 text-emerald-600" : "text-slate-400",
            )}
          />
        </button>
      </div>

      <div className="p-4">
        <div className="mb-1 flex items-center gap-1.5 text-sm font-medium text-orange-500">
          <Store className="h-3.5 w-3.5" />
          {item.restaurantName}
        </div>

        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">{item.dishName}</h3>
          <span className="font-semibold text-emerald-600">
            {item.priceLabel}
          </span>
        </div>

        <p className="mt-1 line-clamp-1 text-sm text-slate-400">
          {item.description}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-500">
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

        <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
          <Clock3 className="h-3.5 w-3.5" />
          {item.openHours}
        </p>

        <span className="mt-3 inline-block rounded-full bg-emerald-600 px-3 py-1 text-xs font-medium text-white">
          {item.badgeLabel}
        </span>
      </div>
    </div>
  );
}
