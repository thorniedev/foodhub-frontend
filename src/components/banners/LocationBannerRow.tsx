"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, ChevronRight } from "lucide-react";
import type { PublicBannerResponse } from "@/types/banner";
import { bannerApi } from "@/services/bannerApi";
import { resolveImageUrl } from "@/utils/image";
import { LocationBannerSkeleton } from "./BannerSkeleton";

export interface LocationBannerRowProps {
  banners?: PublicBannerResponse[];
  title?: string;
  subtitle?: string;
}

export default function LocationBannerRow({
  banners: initialBanners,
  title = "ស្វែងរកតាមទីតាំង / Explore by Region",
  subtitle = "ស្វែងយល់ពីមុខម្ហូបពិសេសប្រចាំតំបន់នីមួយៗ",
}: LocationBannerRowProps) {
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
      .getLocationBanners()
      .then((data) => {
        if (isMounted) {
          setBanners(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("[LocationBannerRow] Error fetching location banners:", err);
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
    return <LocationBannerSkeleton />;
  }

  if (error || banners.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="location-banners-heading"
      className="container mx-auto max-w-7xl px-4 py-8 md:py-10"
    >
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2
            id="location-banners-heading"
            className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl dark:text-white"
          >
            {title}
          </h2>
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

      {/* Horizontally scrollable row with snap scrolling */}
      <div className="scrollbar-hide -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:-mx-0 sm:px-0">
        {banners.map((banner) => {
          const locationQuery = banner.location
            ? `?location=${encodeURIComponent(banner.location)}`
            : "";
          const targetHref = `/food-page${locationQuery}`;

          return (
            <div
              key={banner.id}
              className="w-64 shrink-0 snap-start sm:w-72 md:w-80"
            >
              <Link
                href={targetHref}
                className="
                  group relative block h-48 sm:h-52 md:h-56
                  overflow-hidden rounded-2xl
                  bg-neutral-900 shadow-md
                  transition-all duration-300
                  hover:-translate-y-1 hover:shadow-xl
                  focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700
                "
              >
                <Image
                  src={resolveImageUrl(banner.image)}
                  alt={banner.title}
                  fill
                  sizes="(min-width: 768px) 320px, 280px"
                  className="object-cover transition-transform duration-500 group-hover:scale-108"
                />

                {/* Dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                {/* Content */}
                <div className="absolute inset-x-0 bottom-0 p-4">
                  {banner.location && (
                    <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-md">
                      <MapPin className="h-3.5 w-3.5 text-primary-300" />
                      <span>{banner.location}</span>
                    </span>
                  )}

                  <h3 className="line-clamp-1 text-base font-bold text-white sm:text-lg">
                    {banner.title}
                  </h3>

                  {banner.description && (
                    <p className="mt-1 line-clamp-1 text-xs text-white/85">
                      {banner.description}
                    </p>
                  )}
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}
