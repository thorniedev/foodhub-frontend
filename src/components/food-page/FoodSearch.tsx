"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import Image from "next/image";
import Link from "next/link";

import Fuse from "fuse.js";

import { AnimatePresence, motion } from "framer-motion";

import { IoClose, IoSearchOutline } from "react-icons/io5";

import { FaStar, FaStore } from "react-icons/fa";

import type { MenuItem } from "@/types/manu";

type FoodSearchProps = {
  menuItems: MenuItem[];
  value: string;
  onChange: (value: string) => void;
};

export default function FoodSearch({
  menuItems,
  value,
  onChange,
}: FoodSearchProps) {
  const [isFocused, setIsFocused] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);

  const fuse = useMemo(
    () =>
      new Fuse(menuItems, {
        includeScore: true,
        threshold: 0.35,
        ignoreLocation: true,
        minMatchCharLength: 2,

        keys: [
          {
            name: "localName",
            weight: 1,
          },
          {
            name: "name",
            weight: 1,
          },
          {
            name: "store.localName",
            weight: 0.9,
          },
          {
            name: "store.name",
            weight: 0.9,
          },
          {
            name: "food.category.name",
            weight: 0.8,
          },
          {
            name: "food.cuisine.name",
            weight: 0.8,
          },
          {
            name: "ingredients",
            weight: 0.7,
          },
          {
            name: "dietaryTypes.name",
            weight: 0.7,
          },
          {
            name: "mealTypes.name",
            weight: 0.6,
          },
          {
            name: "store.city",
            weight: 0.5,
          },
          {
            name: "store.district",
            weight: 0.5,
          },
          {
            name: "description",
            weight: 0.4,
          },
          {
            name: "localDescription",
            weight: 0.4,
          },
        ],
      }),
    [menuItems],
  );

  const suggestions = useMemo(() => {
    const query = value.trim();

    if (query.length < 2) {
      return [];
    }

    return fuse
      .search(query)
      .slice(0, 6)
      .map((result) => result.item);
  }, [fuse, value]);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  const showSuggestions = isFocused && value.trim().length >= 2;

  return (
    <div ref={wrapperRef} className="relative flex-1">
      <div className="flex min-h-[56px] items-center gap-3 rounded-full border border-gray-200 bg-white px-5 transition focus-within:border-primary-700 focus-within:ring-4 focus-within:ring-primary-50">
        <IoSearchOutline className="shrink-0 text-[22px] text-primary-700" />

        <input
          type="search"
          value={value}
          onFocus={() => setIsFocused(true)}
          onChange={(event) => onChange(event.target.value)}
          placeholder="ស្វែងរកម្ហូប ហាង ប្រភេទ គ្រឿងផ្សំ ឬទីតាំង..."
          aria-label="Search foods and stores"
          autoComplete="off"
          className="w-full bg-transparent text-[16px] text-gray-700 outline-none placeholder:text-gray-400"
        />

        {value && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              onChange("");
              setIsFocused(false);
            }}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-red-50 hover:text-red-500"
          >
            <IoClose className="text-[20px]" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            initial={{
              opacity: 0,
              y: -8,
              scale: 0.98,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: -8,
              scale: 0.98,
            }}
            transition={{
              duration: 0.2,
            }}
            className="absolute left-0 right-0 top-[64px] z-50 overflow-hidden rounded-[22px] border border-gray-100 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.14)]"
          >
            <div className="border-b border-gray-100 px-4 py-3">
              <p className="text-[16px] font-semibold text-primary-900">
                លទ្ធផលស្វែងរក
              </p>

              <p className="mt-1 text-[16px] text-gray-500">
                រកឃើញ {suggestions.length} ជម្រើស
              </p>
            </div>

            {suggestions.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <IoSearchOutline className="mx-auto text-[34px] text-gray-300" />

                <p className="mt-3 text-[16px] font-medium text-gray-600">
                  រកមិនឃើញលទ្ធផល
                </p>

                <p className="mt-1 text-[16px] leading-7 text-gray-400">
                  សូមសាកល្បងពាក្យស្វែងរកផ្សេងទៀត។
                </p>
              </div>
            ) : (
              <div className="max-h-[420px] overflow-y-auto p-2">
                {suggestions.map((food) => (
                  <Link
                    key={food.uuid}
                    href={`/food/${food.uuid}`}
                    onClick={() => setIsFocused(false)}
                    className="flex items-center gap-3 rounded-[16px] p-3 transition hover:bg-primary-50"
                  >
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[14px] bg-gray-100">
                      <Image
                        fill
                        src={food.thumbnail}
                        alt={food.localName || food.name}
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-[16px] font-semibold text-primary-900">
                            {food.localName || food.name}
                          </p>

                          <div className="mt-1 flex items-center gap-2 text-[16px] text-gray-500">
                            <FaStore className="shrink-0 text-secondary-500" />

                            <span className="truncate">
                              {food.store.localName}
                            </span>
                          </div>
                        </div>

                        <p className="shrink-0 text-[16px] font-semibold text-primary-800">
                          ${food.price.toFixed(2)}
                        </p>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-3 text-[16px]">
                        <span className="flex items-center gap-1 text-yellow-500">
                          <FaStar />

                          {food.store.averageRating}
                        </span>

                        <span className="text-gray-500">
                          {food.food.category.name}
                        </span>

                        <span className="text-gray-500">
                          {food.distanceKm} km
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
