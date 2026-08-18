"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { IoCheckmarkCircle, IoSparklesOutline } from "react-icons/io5";

import type { GroupRecommendedStore } from "@/types/group-location";
import type { FoodStore } from "@/types/store-page";
import StoreCard from "@/components/food-page/store/StoreCard";

interface GroupRecommendationStoreCardProps {
  store: GroupRecommendedStore;
  selected: boolean;
  onSelect: () => void;
}

export default function GroupRecommendationStoreCard({
  store,
  selected,
  onSelect,
}: GroupRecommendationStoreCardProps) {
  const foodStore = useMemo<FoodStore>(() => {
    const raw = store as unknown as Record<string, unknown>;
    return {
      uuid: store.uuid,
      storeName: store.localName || store.name,
      description: store.description || null,
      addressLine: store.addressLine || "",
      commune: store.commune || null,
      district: store.district || null,
      city: store.city || "",
      province: store.province || "",
      countryCode: typeof raw.countryCode === "string" ? raw.countryCode : "KH",
      postalCode: typeof raw.postalCode === "string" ? raw.postalCode : null,
      timezone: typeof raw.timezone === "string" ? raw.timezone : "Asia/Phnom_Penh",
      latitude: store.latitude,
      longitude: store.longitude,
      phoneNumber: store.phoneNumber || null,
      email: store.email || null,
      logoMediaUuid: typeof raw.logoMediaUuid === "string" ? raw.logoMediaUuid : null,
      coverMediaUuid: typeof raw.coverMediaUuid === "string" ? raw.coverMediaUuid : null,
      priceLevel: store.priceLevel || null,
      hygieneRating: typeof raw.hygieneRating === "string" ? raw.hygieneRating : null,
      averageRating: store.averageRating || 0,
      totalReviews: store.totalReviews || 0,
      reviewStatus: "APPROVED",
      operatingStatus: store.operatingStatus || "OPEN",
      accountStatus: "ACTIVE",
      isOpenNow: store.isOpenNow ?? false,
      socialLinks: [],
      openingHours: [],
      distanceMeters: Math.round(store.distanceKm * 1000),
    };
  }, [store]);

  return (
    <motion.div
      layout
      whileTap={{ scale: 0.99 }}
      onClick={onSelect}
      className={`relative cursor-pointer rounded-[26px] p-1 transition ${
        selected
          ? "ring-4 ring-primary-500 shadow-lg"
          : "hover:shadow-md"
      }`}
    >
      {/* Recommendation match score badge */}
      <div className="absolute right-4 top-4 z-20 flex items-center gap-1.5 rounded-full bg-secondary-500/95 px-3.5 py-1.5 text-[16px] font-bold text-white shadow-md backdrop-blur">
        <IoSparklesOutline />
        <span>{store.recommendationScore}% សាកសម</span>
      </div>

      {selected && (
        <div className="absolute left-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-primary-800 text-white shadow-lg">
          <IoCheckmarkCircle className="text-[24px]" />
        </div>
      )}

      <StoreCard store={foodStore} distanceKm={store.distanceKm} variant="grid" />
    </motion.div>
  );
}
