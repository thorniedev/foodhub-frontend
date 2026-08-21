"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import type { PublicBannerResponse } from "@/types/banner";
import { bannerApi } from "@/services/bannerApi";
import { resolveImageUrl } from "@/utils/image";
import { SeasonalBannerSkeleton } from "./BannerSkeleton";

export interface SeasonalBannerSectionProps {
  banners?: PublicBannerResponse[];
  title?: string;
  subtitle?: string;
}

export default function SeasonalBannerSection({
  banners: initialBanners,
  title = "កម្មវិធីពិសេសតាមរដូវកាល / Seasonal Specials",
  subtitle = "ការផ្តល់ជូនពិសេស និងម្ហូបប្រពៃណីតាមពិធីបុណ្យជាតិ",
}: SeasonalBannerSectionProps) {
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
      .getSeasonBanners()
      .then((data) => {
        if (isMounted) {
          setBanners(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("[SeasonalBannerSection] Error fetching season banners:", err);
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
    return <SeasonalBannerSkeleton />;
  }

  if (error || banners.length === 0) {
    return null;
  }

  const isSingle = banners.length === 1;

  return (
    <section
      aria-labelledby="seasonal-banners-heading"
      className="container mx-auto max-w-7xl px-4 py-8 md:py-10"
    >
      {/* Section Header */}
      <div className="mb-6">
        <h2
          id="seasonal-banners-heading"
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

      {/* Grid of Seasonal Banners */}
      <div
        className={`grid gap-6 ${
          isSingle ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"
        }`}
      >
        {banners.map((banner) => (
          <div
            key={banner.id}
            className="group relative overflow-hidden rounded-3xl bg-neutral-900 shadow-lg transition-all duration-300 hover:shadow-2xl"
          >
            <div
              className={`relative w-full ${
                isSingle ? "h-64 sm:h-80 md:h-96" : "h-60 sm:h-72 md:h-80"
              }`}
            >
              <Image
                src={resolveImageUrl(banner.image)}
                alt={banner.title}
                fill
                sizes={isSingle ? "100vw" : "(min-width: 768px) 50vw, 100vw"}
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />

              {/* Gradient Scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

              {/* Festive Badge */}
              <div className="absolute left-4 top-4 z-10">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/90 px-3 py-1 text-xs font-bold text-white shadow-md backdrop-blur-md">
                  <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                  <span>ពិធីបុណ្យ & រដូវកាល</span>
                </span>
              </div>

              {/* Content Overlay */}
              <div className="absolute inset-x-0 bottom-0 z-10 p-5 md:p-8">
                <h3 className="text-xl font-bold text-white sm:text-2xl md:text-3xl">
                  {banner.title}
                </h3>

                {banner.description && (
                  <p className="mt-2 line-clamp-2 text-sm text-white/90 sm:text-base">
                    {banner.description}
                  </p>
                )}

                <div className="mt-4">
                  <Link
                    href="/food-page"
                    className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-xs sm:text-sm font-semibold text-white backdrop-blur-md transition-all duration-200 hover:bg-white hover:text-neutral-900"
                  >
                    <span>ស្វែងរកការបញ្ចុះតម្លៃ</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
