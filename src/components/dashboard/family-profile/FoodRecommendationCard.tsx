"use client";

import { useState } from "react";
import { Heart, Store, Star, Clock, Bike, Clock3 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FoodRecommendation } from "@/types/family-profile";
import Image from "next/image";
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
    <div className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="relative h-44 w-full overflow-hidden">
        <Image
          width={285}
          height={370}
          src={item.imageUrl}
          alt={item.dishName}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <button
          type="button"
          onClick={handleFavoriteClick}
          aria-label="ចំណូលចិត្ត"
          aria-pressed={favorite}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur transition-transform hover:bg-white active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          <Heart
            className={cn(
              "h-4 w-4 transition-colors",
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

        <div className="flex items-center justify-between gap-2">
          <h3 className="truncate font-semibold text-slate-800">
            {item.dishName}
          </h3>
          <span className="shrink-0 font-semibold text-emerald-600">
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

        <span className="mt-3 inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
          {item.badgeLabel}
        </span>
      </div>
    </div>
  );
}