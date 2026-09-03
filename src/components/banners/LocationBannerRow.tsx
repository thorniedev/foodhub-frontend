"use client";

import React, { useEffect, useState } from "react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import Carousel, { type CarouselItem, slides as defaultSlides } from "@/components/ui/Carosel";
import type { PublicBannerResponse } from "@/types/banner";
import { bannerApi } from "@/services/bannerApi";
import { resolveImageUrl } from "@/utils/image";
import { EASE_SOFT, VIEWPORT, group, riseReveal } from "@/lib/reveal";

const carouselReveal: Variants = {
  hidden: { y: 56, scale: 0.97 },
  show: {
    y: 0,
    scale: 1,
    transition: { duration: 0.9, ease: EASE_SOFT },
  },
};

export interface LocationBannerRowProps {
  banners?: PublicBannerResponse[];
  fallbackToDefault?: boolean;
}

export default function LocationBannerRow({
  banners: initialBanners,
  fallbackToDefault = true,
}: LocationBannerRowProps) {
  const reduceMotion = useReducedMotion();
  const [banners, setBanners] = useState<PublicBannerResponse[]>(
    initialBanners || [],
  );
  const [loading, setLoading] = useState(!initialBanners);

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
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [initialBanners]);

  const carouselItems: CarouselItem[] =
    banners.length > 0
      ? banners.map((banner) => ({
          id: banner.id,
          image: resolveImageUrl(banner.image),
          alt: banner.title,
          name: banner.title,
          description: banner.description || "",
          origin: banner.location || "កម្ពុជា",
          link: banner.location
            ? `/menu?province=${encodeURIComponent(banner.location)}`
            : `/menu?province=${encodeURIComponent(banner.title)}`,
        }))
      : fallbackToDefault
        ? defaultSlides
        : [];

  if (!loading && carouselItems.length === 0) {
    return null;
  }

  return (
    <section className="lg:pt-8" aria-labelledby="regional-food-heading">
      <motion.div
        initial={reduceMotion ? false : "hidden"}
        whileInView="show"
        viewport={VIEWPORT}
        variants={group()}
        className="relative z-20 mx-auto flex w-full max-w-7xl flex-col items-center justify-center pt-8 md:gap-12.5 max-md:gap-6"
      >
        <motion.p
          id="regional-food-heading"
          variants={riseReveal}
          className="py-2 text-center text-2xl font-semibold text-primary-800 sm:text-3xl md:text-4xl lg:text-6xl dark:text-primary-dark"
        >
          ចំណីអាហារ
          <span className="text-secondary-500">ប្រចាំតំបន់</span>
        </motion.p>

        <motion.p
          variants={riseReveal}
          className="text-center text-base font-light text-gray-700 sm:text-lg md:text-[20px] lg:text-[24px] dark:text-gray-100"
        >
          ស្វែងរកមុខម្ហូប និងភេសជ្ជៈល្បីៗពីភ្នំពេញ សៀមរាប និងតំបន់ផ្សេងៗ
          <br className="max-lg:hidden lg:block" />
          ដើម្បីស្វែងយល់ពីរសជាតិពេញនិយមដែលអ្នកមិនគួររំលង។
        </motion.p>

        <motion.div
          variants={carouselReveal}
          style={{ willChange: "transform" }}
          className="w-full"
        >
          {loading ? (
            <div className="mx-auto h-72 w-full max-w-7xl animate-pulse rounded-2xl bg-neutral-200 dark:bg-neutral-800" />
          ) : (
            <Carousel
              items={carouselItems}
              autoPlay
              autoPlayInterval={3500}
              autoPlayResumeDelay={1000}
            />
          )}
        </motion.div>
      </motion.div>
    </section>
  );
}
