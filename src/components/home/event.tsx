"use client";

import React, { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useGetSeasonBannersQuery } from "@/app/store/bannerApi";
import { resolveBannerImageUrl } from "@/lib/banner-media";

const DEFAULT_SEASON_CARDS = [
  {
    title: "បុណ្យភ្ជុំបិណ្ឌ",
    image: "/Image/food-picture/food-21.webp",
    link: "/food-page?event=pchum-ben",
    alt: "Fish Amok",
  },
  {
    title: "បុណ្យចូលឆ្នាំខ្មែរ",
    image: "/Image/food-picture/food-20.jpg",
    link: "/food-page?event=khmer-new-year",
    alt: "Khmer Seasonal Dish",
  },
  {
    title: "បុណ្យអុំទូក",
    image: "/Image/food-picture/food-19.jpg",
    link: "/food-page?event=water-festival",
    alt: "Khmer Snack",
  },
  {
    title: "រដូវវស្សា",
    image: "/Image/food-picture/food-22.jpg",
    link: "/food-page?season=rainy",
    alt: "Khmer Dumpling",
  },
  {
    title: "រដូវក្តៅ",
    image: "/Image/food-picture/food-25.jpg",
    link: "/food-page?season=dry",
    alt: "Seasonal Pasta",
  },
  {
    title: "រដូវរងា",
    image: "/Image/food-picture/food-24.jpg",
    link: "/food-page?season=cool",
    alt: "Seasonal Penne",
  },
];

interface EventCardItemProps {
  item: {
    id: string;
    title: string;
    image: string;
    fallbackImage: string;
    link: string;
    alt: string;
  };
  heightClass: string;
}

function EventCardItem({ item, heightClass }: EventCardItemProps) {
  const [imgSrc, setImgSrc] = useState(item.image);

  useEffect(() => {
    setImgSrc(item.image);
  }, [item.image]);

  return (
    <Link
      href={item.link || "/food-page"}
      className={`group relative block w-full cursor-pointer overflow-hidden rounded-2xl shadow-md transition hover:shadow-xl ${heightClass}`}
    >
      <img
        src={imgSrc}
        alt={item.alt}
        className={`w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 ${heightClass}`}
        onError={() => {
          if (imgSrc !== item.fallbackImage) {
            setImgSrc(item.fallbackImage);
          }
        }}
      />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 translate-y-4 p-4 opacity-0 transition-all duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100">
        <p className="text-lg font-bold text-white md:text-xl">{item.title}</p>
      </div>
    </Link>
  );
}

export default function EventSection() {
  const { data: seasonBanners } = useGetSeasonBannersQuery();

  const items = useMemo(() => {
    if (seasonBanners && seasonBanners.length > 0) {
      return seasonBanners.map((b, idx) => {
        const fallback =
          DEFAULT_SEASON_CARDS[idx % DEFAULT_SEASON_CARDS.length];
        return {
          id: String(b.id || `season-b-${idx}`),
          title: b.title || fallback.title,
          image: resolveBannerImageUrl(b, fallback.image),
          fallbackImage: fallback.image,
          link: fallback.link,
          alt: b.title || fallback.alt,
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
      {/* =========================================
          SECTION HEADER
      ========================================== */}
      <section className="container max-sm:px-3 relative z-20 mx-auto flex w-full max-w-7xl flex-col items-center justify-center max-md:gap-6 md:gap-12.5 md:pb-12.5">
        <p className="lg:text-6xl py-2 md:text-4xl max-md:text-2xl text-center dark:text-[#22a447] font-semibold text-primary-800 dark:text-primary-dark">
          បទពិសោធន៍ថ្មីក្នុង
          <span className="text-secondary-500">ការស្វែងរកអាហារ</span>
        </p>
        <p className="lg:text-[24px] md:text-[20px] text-center font-light text-gray-700 dark:text-gray-100 max-md:text-[16px]">
          ស្វែងរកមុខម្ហូប និងហាងអាហារដែលសមនឹងអ្នក តាមរយៈ <br />
          ប្រព័ន្ធណែនាំឆ្លាតវៃ ដែលគិតគូរពីចំណូលចិត្ត អាឡែស៊ី របបអាហារ ជំនឿសាសនា
          និងទីតាំងរបស់អ្នក
        </p>
      </section>

      {/* =========================================
          SEASONAL FOOD GRID
      ========================================== */}
      <div
        data-aos="fade-up"
        data-aos-delay="150"
        className="
          container
          mx-auto
          grid
          max-w-7xl
          grid-cols-2
          items-center
          gap-4
          px-4
          sm:grid-cols-2
          md:grid-cols-5
          lg:px-0
          max-sm:pt-8
        "
      >
        {/* ======================================
            LEFT CONTENT (COLUMN 1)
        ======================================= */}
        <div
          data-aos="fade-right"
          data-aos-delay="150"
          className="flex h-full flex-col justify-between"
        >
          <div className="mb-6 pl-0.5">
            <p className="mb-4 text-[26px] font-bold leading-tight text-primary-800 dark:text-primary-dark md:text-[22px] lg:text-[36px]">
              ចំណីអាហារស្រប <br />
              <span className="text-secondary-500">តាមរដូវកាលខ្មែរ</span>
            </p>

            <p className="text-xl text-gray-500 dark:text-white max-lg:text-[16px]">
              ស្វែងរកមុខម្ហូបដែលសមស្របនឹងរដូវកាលនីមួយៗ
            </p>
          </div>

          {/* ITEM 0 */}
          {items[0] && (
            <EventCardItem item={items[0]} heightClass="h-40" />
          )}
        </div>

        {/* ======================================
            COLUMN 2 (ITEMS 1 & 2)
        ======================================= */}
        <div data-aos="fade-up" data-aos-delay="250">
          <div className="flex flex-col justify-between gap-4 overflow-hidden rounded-2xl">
            {/* ITEM 1 */}
            {items[1] && (
              <EventCardItem item={items[1]} heightClass="h-40" />
            )}

            {/* ITEM 2 */}
            {items[2] && (
              <EventCardItem item={items[2]} heightClass="h-[160px]" />
            )}
          </div>
        </div>

        {/* ======================================
            COLUMN 3 (ITEM 3)
        ======================================= */}
        <div data-aos="zoom-in" data-aos-delay="300" className="h-full">
          {items[3] && (
            <EventCardItem
              item={items[3]}
              heightClass="sm:h-[340px] max-sm:h-40"
            />
          )}
        </div>

        {/* ======================================
            COLUMN 4 (ITEM 4)
        ======================================= */}
        <div data-aos="zoom-in" data-aos-delay="400" className="h-full">
          {items[4] && (
            <EventCardItem
              item={items[4]}
              heightClass="sm:h-[340px] max-sm:h-40"
            />
          )}
        </div>

        {/* ======================================
            COLUMN 5 (ITEM 5)
        ======================================= */}
        <div
          data-aos="zoom-in"
          data-aos-delay="400"
          className="md:h-[340px] max-sm:col-span-2"
        >
          {items[5] && (
            <EventCardItem
              item={items[5]}
              heightClass="sm:h-[340px] max-sm:h-40"
            />
          )}
        </div>
      </div>
    </div>
  );
}
