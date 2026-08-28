// "use client";

// import React from "react";
// import LocationBannerRow from "@/components/banners/LocationBannerRow";

// /**
//  * Regional Food Section ("ចំណីអាហារប្រចាំតំបន់")
//  * Powered by backend LOCATION banners (/api/v1/banners/public/locations).
//  */
// export default function SeasonSection() {
//   return <LocationBannerRow />;
// }

"use client";

import Carousel, { slides, type CarouselItem } from "@/components/ui/Carosel";
import React, { useMemo } from "react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { EASE_SOFT, VIEWPORT, group, riseReveal } from "@/lib/reveal";
import { useGetLocationBannersQuery } from "@/app/store/bannerApi";
import { resolveBannerImageUrl } from "@/lib/banner-media";

/*
 * The carousel gets a plain rise — no clip-path here.
 * Clipping an ancestor would cut the arrows that sit at
 * -left-5 / -right-5 on wide screens.
 */
const carouselReveal: Variants = {
  hidden: { y: 56, scale: 0.97 },
  show: {
    y: 0,
    scale: 1,
    transition: { duration: 0.9, ease: EASE_SOFT },
  },
};

export default function SeasonSection() {
  const reduceMotion = useReducedMotion();
  const { data: locationBanners } = useGetLocationBannersQuery();

  const items = useMemo<CarouselItem[]>(() => {
    if (locationBanners && locationBanners.length > 0) {
      return locationBanners.map((banner, idx) => {
        const fallback =
          slides[idx % slides.length]?.image || "/Image/carousel/food1.jpeg";
        return {
          id: banner.id || `location-banner-${idx}`,
          image: resolveBannerImageUrl(banner, fallback),
          alt: banner.title || "FoodHub Regional Banner",
          name: banner.title || banner.location || "មុខម្ហូបប្រចាំតំបន់",
          description:
            banner.description ||
            "ស្វែងយល់ពីរសជាតិពេញនិយមប្រចាំតំបន់ដែលអ្នកមិនគួររំលង",
          origin: banner.location || "កម្ពុជា",
        };
      });
    }
    return slides;
  }, [locationBanners]);

  return (
    <section className="lg:pt-8 lg:px-8">
      <motion.div
        initial={reduceMotion ? false : "hidden"}
        whileInView="show"
        viewport={VIEWPORT}
        variants={group()}
        className=" z-0 flex pt-8  flex-col items-center justify-center md:gap-12.5 max-md:gap-6 container  max-7-xl mx-auto   relative z-20   w-full"
      >
        <motion.p
          variants={riseReveal}
          className="lg:text-6xl  py-2 md:text-4xl max-md:text-2xl text-center dark:text-[#22a447] font-semibold text-primary-800 dark:text-primary-dark"
        >
          ចំណីអាហារ
          <span className="text-secondary-500">ប្រចាំតំបន់</span>
        </motion.p>
        <motion.p
          variants={riseReveal}
          className="lg:text-[24px] md:text-[20px] text-center  font-light text-gray-700 dark:text-gray-100 max-md:text-[16px]"
        >
          ស្វែងរកមុខម្ហូប និងភេសជ្ជៈល្បីៗពីភ្នំពេញ សៀមរាប និងតំបន់ផ្សេងៗ
          <br className="md:block max-md:hidden" />
          ដើម្បីស្វែងយល់ពីរសជាតិពេញនិយមដែលអ្នកមិនគួររំលង។
        </motion.p>
        <motion.div
          variants={carouselReveal}
          style={{ willChange: "transform" }}
          className="w-full max-sm:px-4 "
        >
          <Carousel
            items={items}
            autoPlay
            autoPlayInterval={3000}
            autoPlayResumeDelay={1000}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
