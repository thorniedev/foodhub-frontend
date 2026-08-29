"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { EASE_SOFT, VIEWPORT, group, riseReveal } from "@/lib/reveal";
import { useGetPopularBannersQuery } from "@/app/store/bannerApi";
import { normalizeArrayPayload } from "@/app/store/utils/normalize";
import { resolveBannerImageUrl } from "@/lib/banner-media";
import type { BannerItem } from "@/types/banner";

/* =========================================================
   THE STACK CONFIGURATION & ORIGINAL FALLBACKS
========================================================= */

const DEFAULT_CARDS = [
  {
    src: "/Image/food-picture/card 4.jpg",
    rotate: -10,
    fit: "object-cover",
    layout: "z-7 sm:mt-6 max-sm:mt-3",
    title: "ការស្វែងរកអាហារ 1",
    href: "/menu",
  },
  {
    src: "/Image/food-picture/drink 1.jpg",
    rotate: -3,
    fit: "object-cover",
    layout: "z-6 sm:-mt-6 max-sm:-mt-3 -ml-10",
    title: "ភេសជ្ជៈពេញនិយម 1",
  },
  {
    src: "/Image/food-picture/card 2.jpg",
    fit: "object-fill",
    layout: "z-5 -ml-10",
    title: "ការស្វែងរកអាហារ 2",
    href: "/menu",
  },
  {
    src: "/Image/food-picture/card 3.jpg",
    rotate: 2,
    fit: "object-cover",
    layout: "z-4 sm:-mt-6 max-sm:-mt-3 -ml-10",
    title: "ការស្វែងរកអាហារ 3",
    href: "/menu",
  },
  {
    src: "/Image/food-picture/drink 2.jpg",
    rotate: 5,
    fit: "object-cover",
    layout: "z-2 sm:mt-4 max-sm:mt-2 -ml-10",
    title: "ភេសជ្ជៈពេញនិយម 2",
    href: "/menu",
  },
  {
    src: "/Image/food-picture/card 6.jpg",
    rotate: 10,
    fit: "object-cover",
    layout: "z-1 -ml-10",
    title: "ការស្វែងរកអាហារ 4",
    href: "/menu",
  },
];

const LAYOUT_PRESETS = [
  { rotate: -10, layout: "z-7 sm:mt-6 max-sm:mt-3", fit: "object-cover" },
  {
    rotate: -3,
    layout: "z-6 sm:-mt-6 max-sm:-mt-3 -ml-10",
    fit: "object-cover",
  },
  { rotate: -1, layout: "z-5 -ml-10", fit: "object-fill" },
  {
    rotate: 2,
    layout: "z-4 sm:-mt-6 max-sm:-mt-3 -ml-10",
    fit: "object-cover",
  },
  { rotate: 5, layout: "z-2 sm:mt-4 max-sm:mt-2 -ml-10", fit: "object-cover" },
  { rotate: 10, layout: "z-1 -ml-10", fit: "object-cover" },
];

type CardCustom = { rotate: number; from: number };

const cardReveal: Variants = {
  hidden: (card: CardCustom) => ({
    y: 80,
    x: card.from,
    rotate: 0,
    scale: 0.9,
  }),
  show: (card: CardCustom) => ({
    y: 0,
    x: 0,
    rotate: card.rotate,
    scale: 1,
    transition: { duration: 0.9, ease: EASE_SOFT },
  }),
};

interface PopularCardItemProps {
  card: {
    id: string;
    src: string;
    fallbackSrc: string;
    href?: string;
    rotate: number;
    fit: string;
    layout: string;
    title: string;
  };
  from: number;
  reduceMotion: boolean | null;
}

function PopularCardItem({ card, from, reduceMotion }: PopularCardItemProps) {
  const [imgSrc, setImgSrc] = useState(card.src);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    setImgSrc(card.src);
  }, [card.src]);

  return (
    <motion.div
      key={card.id}
      custom={{ rotate: card.rotate, from }}
      variants={cardReveal}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={
        reduceMotion
          ? undefined
          : {
              y: -18,
              scale: 1.08,
              transition: {
                duration: 0.3,
                ease: EASE_SOFT,
              },
            }
      }
      style={{
        willChange: "transform",
        zIndex: isHovered ? 50 : undefined,
      }}
      className={`relative shrink-0 cursor-pointer ${card.layout}`}
    >
      <Link href={card.href || "/menu"}>
        <Image
          width={235}
          height={285}
          className={`
            sm:border-6
            ${card.fit}
            lg:w-[235px]
            lg:h-[285px]
            md:w-[170px]
            md:h-[220px]
            max-md:h-[130px]
            max-md:w-[100px]
            border-white
            shadow-md
            max-sm:rounded-md
            sm:rounded-[24px]
            transition-transform
            duration-200
          `}
          src={imgSrc}
          alt={card.title}
          unoptimized
          onError={() => {
            if (imgSrc !== card.fallbackSrc) {
              setImgSrc(card.fallbackSrc);
            }
          }}
        />
      </Link>
    </motion.div>
  );
}

export default function PopularSection() {
  const reduceMotion = useReducedMotion();
  const { data: bannerData } = useGetPopularBannersQuery();

  const cards = useMemo(() => {
    const list = Array.isArray(bannerData)
      ? bannerData
      : normalizeArrayPayload<BannerItem>(bannerData);

    if (list && list.length > 0) {
      const activeBanners = list.filter((b) => b.isPublished !== false);
      const displayBanners = activeBanners.length > 0 ? activeBanners : list;
      const sliced = displayBanners.slice(0, 6);

      return sliced.map((banner, index) => {
        const preset = LAYOUT_PRESETS[index % LAYOUT_PRESETS.length];
        const defaultFallback = DEFAULT_CARDS[index % DEFAULT_CARDS.length].src;
        const resolvedUrl = resolveBannerImageUrl(banner, defaultFallback);

        return {
          id: String(banner.id || `popular-banner-${index}`),
          src: resolvedUrl,
          fallbackSrc: defaultFallback,
          href: banner.location || "/menu",
          rotate: preset.rotate,
          fit: preset.fit,
          layout: preset.layout,
          title:
            banner.title || banner.description || `Popular item ${index + 1}`,
        };
      });
    }

    return DEFAULT_CARDS.map((card, idx) => ({
      ...card,
      id: `default-popular-${idx}`,
      fallbackSrc: card.src,
      href: "/menu",
    }));
  }, [bannerData]);

  const gather = (index: number) => ((cards.length - 1) / 2 - index) * 26;

  return (
    <div className="sm:my-15 max-sm:my-10 ">
      <motion.section
        initial={reduceMotion ? false : "hidden"}
        whileInView="show"
        viewport={VIEWPORT}
        variants={group()}
        className="  max-sm:px-2.5 flex flex-col items-center justify-center md:gap-12.5 max-md:gap-6 container  max-7-xl mx-auto   relative z-20   w-full"
      >
        <motion.p
          variants={riseReveal}
          className="
       text-center
        font-semibold
        text-primary-800

        lg:text-6xl  py-2
        md:text-5xl
        max-md:text-3xl dark:text-[#22a447] dark:text-primary-dark 
      "
        >
          មុខម្ហូបនិងភេសជ្ជៈ
          <br className="sm:hidden max-sm:block" />
          <motion.span className="text-secondary-500">ពេញនិយម</motion.span>
        </motion.p>

        {/* =====================================================
        DESCRIPTION
    ====================================================== */}

        <motion.p
          variants={riseReveal}
          className="
        text-center
        font-light
        text-accent-50

        lg:text-[24px]
        md:text-[20px] text-gray-700 dark:text-gray-100
      "
        >
          ស្វែងរកមុខម្ហូប និងហាងអាហារដែលសមនឹងអ្នក តាមរយៈ
          <br className="md:block hidden" />
          ប្រព័ន្ធណែនាំឆ្លាតវៃ ដែលគិតគូរពីចំណូលចិត្ត អាឡែស៊ី របបអាហារ ជំនឿសាសនា
          និងទីតាំងរបស់អ្នក
        </motion.p>
      </motion.section>

      <motion.div
        initial={reduceMotion ? false : "hidden"}
        whileInView="show"
        viewport={VIEWPORT}
        variants={group(0.09, 0.06)}
        className="flex max-sm:pt-12 sm:pt-20 justify-center lg:max-w-7xl  max-sm:w-fit px-3 mx-auto"
      >
        {cards.map((card, index) => (
          <PopularCardItem
            key={card.id}
            card={card}
            from={gather(index)}
            reduceMotion={reduceMotion}
          />
        ))}
      </motion.div>
    </div>
  );
}
