"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  IoCheckmarkCircle,
  IoLocationOutline,
  IoNavigateOutline,
  IoRestaurantOutline,
  IoSparklesOutline,
} from "react-icons/io5";
import { FaStar, FaStore } from "react-icons/fa";

import type { GroupRecommendedStore } from "@/types/group-location";

interface GroupRecommendationStoreCardProps {
  store: GroupRecommendedStore;
  selected: boolean;
  onSelect: () => void;
}

function formatDistance(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return `${value.toFixed(value < 10 ? 1 : 0)} km`;
}

export default function GroupRecommendationStoreCard({
  store,
  selected,
  onSelect,
}: GroupRecommendationStoreCardProps) {
  const imageUrl = store.coverImageUrl || store.logoUrl || null;

  return (
    <motion.article
      layout
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className={`overflow-hidden rounded-[24px] border bg-white shadow-sm transition ${
        selected
          ? "border-primary-500 ring-4 ring-primary-50"
          : "border-gray-100 hover:border-primary-200 hover:shadow-md"
      }`}
    >
      <button
        type="button"
        onClick={onSelect}
        className="grid w-full min-w-0 text-left sm:grid-cols-[210px_minmax(0,1fr)] xl:grid-cols-[230px_minmax(0,1fr)]"
      >
        <div className="relative aspect-[16/9] min-h-[185px] w-full overflow-hidden bg-primary-50 sm:aspect-auto sm:h-full">
          {imageUrl ? (
            <Image
              fill
              src={imageUrl}
              alt={store.localName || store.name}
              sizes="(max-width: 640px) 100vw, 230px"
              className="object-cover transition-transform duration-500 hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary-100 to-secondary-100">
              <FaStore className="text-[52px] text-primary-700" />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          <span className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full bg-white/95 px-3 py-2 text-[16px] font-bold text-primary-900 backdrop-blur">
            <IoNavigateOutline className="text-[19px] text-primary-700" />
            {formatDistance(store.distanceKm)}
          </span>

          {selected && (
            <span className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary-800 text-white shadow">
              <IoCheckmarkCircle className="text-[22px]" />
            </span>
          )}
        </div>

        <div className="flex min-w-0 flex-col p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="line-clamp-2 text-[21px] font-bold leading-7 text-primary-900">
                {store.localName || store.name}
              </h3>

              <p className="mt-1 flex items-start gap-2 text-[16px] leading-7 text-gray-500">
                <IoLocationOutline className="mt-1 shrink-0 text-[19px] text-primary-700" />
                <span className="line-clamp-2">
                  {store.addressLine}
                  {store.district ? `, ${store.district}` : ""}
                  {store.city ? `, ${store.city}` : ""}
                </span>
              </p>
            </div>

            <span className="flex items-center gap-1.5 rounded-full bg-secondary-50 px-3 py-1.5 text-[16px] font-bold text-secondary-600">
              <IoSparklesOutline />
              {store.recommendationScore}%
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-4">
            <MetricChip
              icon={<IoNavigateOutline />}
              label="ចំណុចកណ្ដាល"
              value={formatDistance(store.distanceKm)}
            />
            <MetricChip
              icon={<PeopleIcon />}
              label="ឆ្ងាយបំផុត"
              value={formatDistance(store.maximumMemberDistanceKm)}
            />
            <MetricChip
              icon={<FaStar />}
              label="វាយតម្លៃ"
              value={
                store.averageRating > 0
                  ? store.averageRating.toFixed(1)
                  : "ថ្មី"
              }
            />
            <MetricChip
              icon={<IoRestaurantOutline />}
              label="មុខម្ហូប"
              value={String(store.menuCount)}
            />
          </div>

          <p className="mt-4 border-t border-gray-100 pt-4 text-[16px] leading-7 text-gray-500">
            ជ្រើសរើសជាបេក្ខភាពសម្រាប់ Vote Party។
            មិត្តភក្តិនឹងឃើញហាងនេះនៅក្នុងតំណបោះឆ្នោត។
          </p>
        </div>
      </button>
    </motion.article>
  );
}

function PeopleIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-[19px] w-[19px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function MetricChip({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-gray-50 px-3 py-2.5">
      <div className="flex items-center gap-2 text-[16px] text-gray-400">
        <span className="text-primary-700">{icon}</span>
        <span className="truncate">{label}</span>
      </div>
      <p className="mt-1 text-[16px] font-bold text-primary-900">{value}</p>
    </div>
  );
}
