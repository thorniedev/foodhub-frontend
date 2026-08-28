"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useGetMenuItemsQuery } from "@/app/store/menuApi";
import { toFrontendApiAssetUrl } from "@/lib/catalog-media";
import type { CatalogMenuItem } from "@/types/catalog-menu-item";

interface AgeGroupConfig {
  id: string;
  code: string;
  name: string;
  label: string;
  fallbackImage: string;
  keywords: string[];
}

const STANDARD_AGE_GROUPS: AgeGroupConfig[] = [
  {
    id: "toddler",
    code: "TODDLER",
    name: "កុមារតូច",
    label: "កុមារតូច (0-2)",
    fallbackImage: "/Image/food-picture/food 31.jpg",
    keywords: ["កុមារតូច", "toddler", "infant", "0-2"],
  },
  {
    id: "children",
    code: "CHILDREN",
    name: "កុមារ",
    label: "កុមារ (3-12)",
    fallbackImage: "/Image/food-picture/food-20.jpg",
    keywords: ["កុមារ", "child", "children", "kid", "3-12"],
  },
  {
    id: "youth",
    code: "YOUTH",
    name: "យុវវ័យ",
    label: "យុវវ័យ (13-17)",
    fallbackImage: "/Image/food-picture/drink 1.jpg",
    keywords: ["យុវវ័យ", "យុវជន", "youth", "teen", "teenager", "13-17"],
  },
  {
    id: "adults",
    code: "ADULT",
    name: "មនុស្សពេញវ័យ",
    label: "មនុស្សពេញវ័យ (18-59)",
    fallbackImage: "/Image/food-picture/food-21.webp",
    keywords: ["មនុស្សពេញវ័យ", "adult", "adults", "18-59"],
  },
  {
    id: "elderly",
    code: "SENIOR",
    name: "មនុស្សវ័យចំណាស់",
    label: "មនុស្សវ័យចំណាស់ (60+)",
    fallbackImage: "/Image/food-picture/card 2.jpg",
    keywords: ["មនុស្សវ័យចំណាស់", "វ័យចំណាស់", "senior", "elderly", "60+"],
  },
];

interface AgeCardDisplay {
  id: string;
  name: string;
  label: string;
  dishCount: number;
  image: string;
  fallbackImage: string;
  dishName?: string;
  href: string;
}

export default function MealsByAgeSection() {
  const { data: menuItems = [], isLoading } = useGetMenuItemsQuery();
  const [randomSeed, setRandomSeed] = useState<number>(() => Date.now());

  // Randomize selected dishes on mount/update
  useEffect(() => {
    setRandomSeed(Date.now());
  }, [menuItems.length]);

  const ageCards = useMemo<AgeCardDisplay[]>(() => {
    return STANDARD_AGE_GROUPS.map((group) => {
      // Find all dishes matching this age group
      const matchingFoods = menuItems.filter((item: CatalogMenuItem) => {
        const itemAgeGroups = Array.isArray(item.food?.ageGroups)
          ? item.food.ageGroups
          : [];

        if (itemAgeGroups.length === 0) return false;

        return itemAgeGroups.some((ag) => {
          const agCode = String(ag.code || "").trim().toLowerCase();
          const agName = String(ag.name || "").trim().toLowerCase();

          return group.keywords.some(
            (k) => agCode.includes(k) || agName.includes(k),
          );
        });
      });

      const dishCount = matchingFoods.length;

      // Select a random dish from matching items if available
      let selectedDish: CatalogMenuItem | null = null;
      if (matchingFoods.length > 0) {
        // Use seed or Math.random
        const randomIndex = Math.floor(Math.random() * matchingFoods.length);
        selectedDish = matchingFoods[randomIndex] || matchingFoods[0];
      }

      const rawImg =
        selectedDish?.thumbnail ||
        selectedDish?.food?.category?.code ||
        group.fallbackImage;

      const image = toFrontendApiAssetUrl(
        typeof rawImg === "string" ? rawImg : group.fallbackImage,
        group.fallbackImage,
      );

      return {
        id: group.id,
        name: group.name,
        label: group.label,
        dishCount,
        image,
        fallbackImage: group.fallbackImage,
        dishName: selectedDish?.localName || selectedDish?.name,
        href: `/menu?ageGroups=${encodeURIComponent(group.name)}`,
      };
    });
  }, [menuItems, randomSeed]);

  return (
    <section className="relative w-full py-12 sm:py-16">
      <div className="container relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <section className="container mx-auto flex max-w-7xl flex-col items-center justify-center max-md:gap-6 md:gap-12.5">
          <p className="py-2 text-center text-2xl font-semibold text-primary-800 dark:text-primary-dark max-md:text-2xl md:text-4xl lg:text-6xl">
            ចំណីអាហារ
            <span className="text-secondary-500">ទៅតាមវ័យ</span>
          </p>

          <p className="text-center text-[16px] font-light text-gray-700 dark:text-gray-100 md:text-[20px] lg:text-[24px]">
            ណែនាំមុខម្ហូបដែលសាកសមនឹងតម្រូវការអាហារូបត្ថម្ភ
            <br className="max-md:hidden lg:block" />
            និងរបៀបរស់នៅរបស់មនុស្សគ្រប់វ័យ ចាប់ពីកុមារ មនុស្សពេញវ័យ
            រហូតដល់មនុស្សវ័យចំណាស់
          </p>
        </section>

        {/* 5 Cards Grid */}
        <div className="mt-10 grid grid-cols-2 gap-4 py-0.5 sm:mt-14 sm:grid-cols-2 sm:gap-6 md:grid-cols-3 lg:grid-cols-5 lg:gap-6">
          {ageCards.map((group, i) => (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: "easeOut" }}
              whileHover={{ y: -6 }}
              className="group flex cursor-pointer flex-col items-center justify-between rounded-[2rem] border border-slate-200/80 bg-white p-5 text-center shadow-sm transition-all duration-300 hover:border-primary-600/40 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900 sm:p-6"
            >
              <Link href={group.href} className="flex h-full w-full flex-col items-center">
                {/* Dynamic Image in Circle */}
                <div
                  className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-[3px] border-emerald-100 bg-emerald-50/80 shadow-inner transition-transform duration-500 group-hover:scale-105 dark:border-emerald-900/50 dark:bg-slate-800 sm:h-32 sm:w-32 lg:h-36 lg:w-36"
                >
                  <Image
                    src={group.image}
                    alt={group.dishName || group.label}
                    fill
                    unoptimized
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (target.src !== group.fallbackImage) {
                        target.src = group.fallbackImage;
                      }
                    }}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                </div>

                {/* Age Group Label */}
                <h3 className="mt-5 text-base font-bold text-primary-800 transition-colors group-hover:text-secondary-500 dark:text-primary-dark sm:text-lg">
                  {group.label}
                </h3>

                {/* Real Dishes Count */}
                <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400 sm:text-base">
                  ({isLoading ? "..." : group.dishCount} មុខម្ហូប)
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

