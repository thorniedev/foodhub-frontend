"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Heart, X, MapPin, Star } from "lucide-react";
import { useTrackInteraction } from "@/hooks/useTrackInteraction";
import { BookmarkButton } from "@/components/common/BookmarkButton";

interface MenuItemDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: {
    uuid: string;
    name: string;
    localName?: string;
    thumbnail?: string | null;
    price: number;
    currencyCode?: string;
    description?: string;
    store?: {
      uuid: string;
      name: string;
      addressLine?: string;
      averageRating?: number;
    };
  };
}

function getMediaUrl(value: string | null | undefined): string {
  if (!value) return "/Image/default-food.png";
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  if (value.startsWith("/api/v1/")) return `/api/${value.slice("/api/v1/".length)}`;
  if (value.startsWith("/")) return value;
  return `/${value}`;
}

export const MenuItemDetailModal: React.FC<MenuItemDetailModalProps> = ({
  isOpen,
  onClose,
  item,
}) => {
  const { track } = useTrackInteraction();
  const [liked, setLiked] = useState(false);

  // 1. Automatically fire VIEW telemetry event on modal mount/open
  useEffect(() => {
    if (isOpen && item) {
      const startTime = Date.now();
      track({
        eventType: "VIEW",
        menuItemUuid: item.uuid,
        storeUuid: item.store?.uuid,
      });

      return () => {
        const dwellTimeMs = Date.now() - startTime;
        if (dwellTimeMs > 1500) {
          track({
            eventType: "VIEW",
            menuItemUuid: item.uuid,
            storeUuid: item.store?.uuid,
            dwellTimeMs,
          });
        }
      };
    }
  }, [isOpen, item, track]);

  // 2. Handle Like reaction
  const handleLike = () => {
    const nextLiked = !liked;
    setLiked(nextLiked);
    track({
      eventType: nextLiked ? "LIKE" : "DISLIKE",
      menuItemUuid: item.uuid,
      storeUuid: item.store?.uuid,
    });
  };

  if (!isOpen || !item) return null;

  const displayPrice = `$${Number(item.price ?? 0).toFixed(2)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative bg-white dark:bg-neutral-900 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-neutral-200 dark:border-neutral-800">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60 transition active:scale-95"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Thumbnail Image */}
        <div className="relative h-64 w-full bg-slate-100 dark:bg-slate-800">
          <Image
            src={getMediaUrl(item.thumbnail)}
            alt={item.localName || item.name}
            fill
            sizes="450px"
            priority
            className="object-cover"
          />
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-start gap-3">
            <div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                {item.localName || item.name}
              </h2>
              {item.localName && item.name !== item.localName && (
                <p className="text-sm text-neutral-500">{item.name}</p>
              )}
              {item.store && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-medium mt-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{item.store.name}</span>
                  {item.store.averageRating != null && (
                    <span className="flex items-center gap-0.5 text-amber-500 ml-1">
                      <Star className="w-3 h-3 fill-current" />
                      {Number(item.store.averageRating).toFixed(1)}
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="text-right shrink-0">
              <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
                {displayPrice}
              </span>
            </div>
          </div>

          {item.description && (
            <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
              {item.description}
            </p>
          )}

          {/* Action Row */}
          <div className="flex items-center gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
            {/* Bookmark Action */}
            <BookmarkButton
              menuItemUuid={item.uuid}
              storeUuid={item.store?.uuid}
              showText={true}
              className="flex-1 py-2.5 rounded-2xl border border-neutral-200 dark:border-neutral-700"
            />

            {/* Like Action */}
            <button
              type="button"
              onClick={handleLike}
              className={`flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-2xl font-medium transition active:scale-95 ${
                liked
                  ? "bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400"
                  : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200"
              }`}
            >
              <Heart className={`w-5 h-5 ${liked ? "fill-current" : ""}`} />
              <span>{liked ? "Liked" : "Like"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
