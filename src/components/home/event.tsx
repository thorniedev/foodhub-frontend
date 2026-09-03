"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useGetSeasonBannersQuery } from "@/app/store/bannerApi";
import { resolveBannerImageUrl } from "@/lib/banner-media";

const DEFAULT_SEASON_CARDS = [
  {
    title: "បុណ្យភ្ជុំបិណ្ឌ",
    image: "/Image/food-picture/food-21.webp",
    link: `/menu?event=${encodeURIComponent("បុណ្យភ្ជុំបិណ្ឌ")}`,
    alt: "បុណ្យភ្ជុំបិណ្ឌ",
  },
  {
    title: "បុណ្យចូលឆ្នាំខ្មែរ",
    image: "/Image/food-picture/food-20.jpg",
    link: `/menu?event=${encodeURIComponent("បុណ្យចូលឆ្នាំខ្មែរ")}`,
    alt: "បុណ្យចូលឆ្នាំខ្មែរ",
  },
  {
    title: "បុណ្យអុំទូក",
    image: "/Image/food-picture/food-19.jpg",
    link: `/menu?event=${encodeURIComponent("បុណ្យអុំទូក")}`,
    alt: "បុណ្យអុំទូក",
  },
  {
    title: "រដូវវស្សា",
    image: "/Image/food-picture/food-22.jpg",
    link: `/menu?season=${encodeURIComponent("រដូវវស្សា")}`,
    alt: "រដូវវស្សា",
  },
  {
    title: "រដូវក្តៅ",
    image: "/Image/food-picture/food-25.jpg",
    link: `/menu?season=${encodeURIComponent("រដូវក្តៅ")}`,
    alt: "រដូវក្តៅ",
  },
  {
    title: "រដូវរងា",
    image: "/Image/food-picture/food-24.jpg",
    link: `/menu?season=${encodeURIComponent("រដូវរងា")}`,
    alt: "រដូវរងា",
  },
];

interface SeasonalItemData {
  id: string | number;
  title: string;
  image: string;
  fallbackImage: string;
  link: string;
  alt: string;
}

function SeasonalCard({
  item,
  className = "",
  imgClassName = "",
  titleSize = "text-lg",
}: {
  item?: SeasonalItemData;
  className?: string;
  imgClassName?: string;
  titleSize?: string;
}) {
  const fallback = item?.fallbackImage || "/Image/food-picture/food-21.webp";
  const [imgSrc, setImgSrc] = useState(item?.image || fallback);

  useEffect(() => {
    if (item?.image) {
      setImgSrc(item.image);
    }
  }, [item?.image]);

  if (!item) return null;

  return (
    <Link
      href={item.link || "/menu"}
      className={`group relative block cursor-pointer overflow-hidden rounded-2xl shadow-md transition-all duration-300 hover:shadow-xl ${className}`}
    >
      <Image
        src={imgSrc}
        alt={item.alt || item.title}
        width={400}
        height={400}
        unoptimized
        onError={() => {
          if (imgSrc !== fallback) {
            setImgSrc(fallback);
          }
        }}
        className={`w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 ${imgClassName}`}
      />

      {/* Gradient Overlay on Hover */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      {/* Title Caption */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 translate-y-4 p-4 opacity-0 transition-all duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100">
        <p className={`font-bold text-white ${titleSize}`}>{item.title}</p>
      </div>
    </Link>
  );
}

export default function EventSection() {
  const { data: seasonBanners, isLoading } = useGetSeasonBannersQuery();

  const items = useMemo<SeasonalItemData[]>(() => {
    if (
      seasonBanners &&
      Array.isArray(seasonBanners) &&
      seasonBanners.length > 0
    ) {
      const activeBanners = seasonBanners.filter(
        (b) => b.isPublished !== false,
      );
      const displayBanners =
        activeBanners.length > 0 ? activeBanners : seasonBanners;

      return displayBanners.map((b, idx) => {
        const defaultFallback =
          DEFAULT_SEASON_CARDS[idx % DEFAULT_SEASON_CARDS.length];
        const title = b.title || defaultFallback.title;
        const isEvent =
          title.includes("បុណ្យ") || defaultFallback.title.includes("បុណ្យ");
        const defaultLink = isEvent
          ? `/menu?event=${encodeURIComponent(title)}`
          : `/menu?season=${encodeURIComponent(title)}`;
        const link =
          b.location && b.location !== "/menu" && b.location.trim() !== ""
            ? b.location
            : defaultLink;

        return {
          id: b.id || `season-b-${idx}`,
          title,
          image: resolveBannerImageUrl(b, defaultFallback.image),
          fallbackImage: defaultFallback.image,
          link,
          alt: title || defaultFallback.alt,
        };
      });
    }

    return DEFAULT_SEASON_CARDS.map((c, idx) => ({
      ...c,
      id: `default-season-${idx}`,
      fallbackImage: c.image,
    }));
  }, [seasonBanners]);

  return (
    <div className="py-12.5 max-sm:py-6">
      {isLoading ? (
        /* ============ SKELETON — mirrors 5-col grid ============ */
        <div
          className="
            container mx-auto grid max-w-7xl
            grid-cols-2 items-center gap-4 px-4
            sm:grid-cols-2 md:grid-cols-5 lg:px-0 max-sm:pt-4
            animate-pulse
          "
        >
          {/* Col 1: text block + short card */}
          <div className="flex h-full flex-col justify-between gap-4">
            <div className="mb-6 space-y-3 pl-0.5">
              <div className="h-8 w-3/4 rounded-lg bg-gray-200 dark:bg-gray-700" />
              <div className="h-8 w-1/2 rounded-lg bg-gray-200 dark:bg-gray-700" />
              <div className="mt-2 h-4 w-full rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-4 w-4/5 rounded bg-gray-200 dark:bg-gray-700" />
            </div>
            <div className="h-40 w-full rounded-2xl bg-gray-200 dark:bg-gray-700" />
          </div>

          {/* Col 2: two stacked cards */}
          <div className="flex flex-col gap-4">
            <div className="h-40 w-full rounded-2xl bg-gray-200 dark:bg-gray-700" />
            <div className="h-[160px] w-full rounded-2xl bg-gray-200 dark:bg-gray-700" />
          </div>

          {/* Col 3: tall card */}
          <div className="h-full">
            <div className="h-40 sm:h-[340px] w-full rounded-2xl bg-gray-200 dark:bg-gray-700" />
          </div>

          {/* Col 4: tall card */}
          <div className="h-full">
            <div className="h-40 sm:h-[340px] w-full rounded-2xl bg-gray-200 dark:bg-gray-700" />
          </div>

          {/* Col 5: tall card (spans 2 cols on mobile) */}
          <div className="md:h-[340px] max-sm:col-span-2">
            <div className="h-40 sm:h-[340px] w-full rounded-2xl bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
      ) : (
        /* ============ REAL GRID ============ */
        <div
          data-aos="fade-up"
          data-aos-delay="150"
          className="
            container mx-auto grid max-w-7xl
            grid-cols-2 items-center gap-4 px-4
            sm:grid-cols-2 md:grid-cols-5 lg:px-0 max-sm:pt-4
          "
        >
          <div data-aos="fade-right" data-aos-delay="150" className="flex h-full flex-col justify-between">
            <div className="mb-6 pl-0.5">
              <p className="mb-4 text-[26px]​  max-sm:text-2xl font-bold leading-tight text-primary-800 dark:text-primary-dark md:text-[20px] lg:text-[30px]  ">
                ចំណីអាហារស្រប
                <br />
                <span className="text-secondary-500">តាមរដូវកាលខ្មែរ</span>
              </p>
              <p className="text-xl text-gray-500 dark:text-gray-300 max-lg:text-[16px]">
                ស្វែងរកមុខម្ហូបដែលសមស្របនឹងរដូវកាលនីមួយៗ
              </p>
            </div>
            <SeasonalCard item={items[0]} imgClassName="h-40" titleSize="text-lg" />
          </div>

          <div data-aos="fade-up" data-aos-delay="250">
            <div className="flex flex-col justify-between gap-4 overflow-hidden rounded-2xl">
              <SeasonalCard item={items[1]} imgClassName="h-40" titleSize="text-lg" />
              <SeasonalCard item={items[2]} imgClassName="h-[160px]" titleSize="text-lg" />
            </div>
          </div>

          <div data-aos="zoom-in" data-aos-delay="300" className="h-full">
            <SeasonalCard item={items[3]} imgClassName="sm:h-[340px] max-sm:h-40" titleSize="text-xl" />
          </div>

          <div data-aos="zoom-in" data-aos-delay="400" className="h-full">
            <SeasonalCard item={items[4]} imgClassName="sm:h-[340px] max-sm:h-40" titleSize="text-xl" />
          </div>

          <div data-aos="zoom-in" data-aos-delay="400" className="md:h-[340px] max-sm:col-span-2">
            <SeasonalCard item={items[5]} imgClassName="sm:h-[340px] max-sm:h-40" titleSize="text-xl" />
          </div>
        </div>
      )}
    </div>
  );
}
