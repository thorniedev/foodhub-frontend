"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Flame, ChevronRight } from "lucide-react";
import type { PublicBannerResponse } from "@/types/banner";
import { bannerApi } from "@/services/bannerApi";
import { resolveImageUrl } from "@/utils/image";
import { PopularBannerSkeleton } from "./BannerSkeleton";

export interface PopularBannerGridProps {
  banners?: PublicBannerResponse[];
  title?: string;
  subtitle?: string;
}

export default function PopularBannerGrid({
  banners: initialBanners,
  title = "ពេញនិយម / Popular Picks",
  subtitle = "មុខម្ហូប និងការផ្តល់ជូនពិសេសដែលទទួលបានការចាប់អារម្មណ៍ច្រើនបំផុត",
}: PopularBannerGridProps) {
  const [banners, setBanners] = useState<PublicBannerResponse[]>(
    initialBanners || [],
  );
  const [loading, setLoading] = useState(!initialBanners);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (initialBanners) {
      setBanners(initialBanners);
      setLoading(false);
      return;
    }

    let isMounted = true;
    bannerApi
      .getPopularBanners()
      .then((data) => {
        if (isMounted) {
          setBanners(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("[PopularBannerGrid] Error fetching popular banners:", err);
        if (isMounted) {
          setError(true);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [initialBanners]);

  if (loading) {
    return <PopularBannerSkeleton />;
  }

  if (error || banners.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="popular-banners-heading"
      className="container mx-auto max-w-7xl px-4 py-8 md:py-10"
    >
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-950/60 dark:text-orange-400">
              <Flame className="h-4 w-4 fill-current" />
            </span>
            <h2
              id="popular-banners-heading"
              className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl dark:text-white"
            >
              {title}
            </h2>
          </div>
          {subtitle && (
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {subtitle}
            </p>
          )}
        </div>

        <Link
          href="/food-page"
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary-700 transition hover:text-primary-800 dark:text-primary-400"
        >
          <span>មើលទាំងអស់</span>
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Grid of Popular Banners */}
      <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
        {banners.map((banner, index) => (
          <Link
            key={banner.id}
            href="/food-page"
            className="
              group relative block aspect-4/3
              overflow-hidden rounded-2xl
              bg-neutral-900 shadow-md
              transition-all duration-300
              hover:-translate-y-1.5 hover:shadow-xl
              focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700
            "
          >
            <Image
              src={resolveImageUrl(banner.image)}
              alt={banner.title}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
              priority={index < 2}
              className="object-cover transition-transform duration-500 group-hover:scale-108"
            />

            {/* Scrim Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

            {/* Popular Pill Badge */}
            <div className="absolute left-3 top-3 z-10">
              <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/90 px-2 py-0.5 text-[11px] font-bold text-white shadow-sm backdrop-blur-md">
                <Flame className="h-3 w-3 fill-current" />
                <span>Trending</span>
              </span>
            </div>

            {/* Content */}
            <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
              <h3 className="line-clamp-1 text-sm font-bold text-white sm:text-base md:text-lg">
                {banner.title}
              </h3>

              {banner.description && (
                <p className="mt-0.5 line-clamp-1 text-xs text-white/85">
                  {banner.description}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
