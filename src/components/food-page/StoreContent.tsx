"use client";

import { useMemo, useState } from "react";

import Image from "next/image";
import { motion } from "framer-motion";

import { FaStar, FaStore } from "react-icons/fa";

import { IoSearchOutline, IoStorefrontOutline } from "react-icons/io5";

import type { MenuItem, Store } from "@/types/manu";

type StoreContentProps = {
  menuItems: MenuItem[];
};

type StoreSummary = Store & {
  menuItems: MenuItem[];
};

export default function StoreContent({ menuItems }: StoreContentProps) {
  const [query, setQuery] = useState("");

  const stores = useMemo<StoreSummary[]>(() => {
    const storeMap = new Map<string, StoreSummary>();

    menuItems.forEach((item) => {
      const existing = storeMap.get(item.store.uuid);

      if (existing) {
        existing.menuItems.push(item);

        return;
      }

      storeMap.set(item.store.uuid, {
        ...item.store,
        menuItems: [item],
      });
    });

    return Array.from(storeMap.values()).sort(
      (first, second) => second.averageRating - first.averageRating,
    );
  }, [menuItems]);

  const filteredStores = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return stores;
    }

    return stores.filter((store) =>
      [
        store.name,
        store.localName,
        store.addressLine,
        store.district,
        store.city,
      ].some((value) => value.toLowerCase().includes(normalizedQuery)),
    );
  }, [stores, query]);

  return (
    <motion.div
      key="store-content"
      initial={{
        opacity: 0,
        x: 30,
      }}
      animate={{
        opacity: 1,
        x: 0,
      }}
      exit={{
        opacity: 0,
        x: -30,
      }}
      transition={{
        duration: 0.28,
      }}
    >
      <section className="rounded-[30px] bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-500 px-6 py-10 text-white sm:px-10">
        <p className="text-[16px] font-semibold text-secondary-200">
          FoodHub Stores
        </p>

        <h1 className="mt-2 text-[32px] font-bold sm:text-[42px]">
          ស្វែងរកហាងអាហារដែលអ្នកចូលចិត្ត
        </h1>

        <p className="mt-4 max-w-3xl text-[16px] leading-8 text-white/85">
          មើលព័ត៌មានហាង ចំណាត់ថ្នាក់ ស្ថានភាពបើកបិទ និងមុខម្ហូបដែលមានលក់។
        </p>
      </section>

      <div className="mt-6 flex min-h-[56px] items-center gap-3 rounded-full border border-gray-200 bg-white px-5 shadow-sm focus-within:border-primary-700 focus-within:ring-4 focus-within:ring-primary-50">
        <IoSearchOutline className="text-[22px] text-primary-700" />

        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="ស្វែងរកហាងអាហារ..."
          className="w-full bg-transparent text-[16px] text-gray-700 outline-none placeholder:text-gray-400"
        />
      </div>

      <section className="mt-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-[16px] font-semibold text-secondary-500">
              ហាងអាហារទាំងអស់
            </p>

            <h2 className="mt-1 text-[28px] font-bold text-primary-900">
              ជ្រើសរើសតាមហាង
            </h2>
          </div>

          <p className="text-[16px] text-gray-500">
            {filteredStores.length} ហាង
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filteredStores.map((store) => (
            <motion.article
              key={store.uuid}
              whileHover={{
                y: -5,
              }}
              className="overflow-hidden rounded-[24px] border border-gray-200 bg-white shadow-sm hover:shadow-lg"
            >
              <div className="relative h-[190px] overflow-hidden bg-primary-50">
                {store.coverImageUrl ? (
                  <Image
                    fill
                    src={store.coverImageUrl}
                    alt={store.localName}
                    sizes="400px"
                    className="object-cover transition-transform duration-500 hover:scale-105"
                  />
                ) : (
                  <IoStorefrontOutline className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[52px] text-primary-700" />
                )}

                <span
                  className={`absolute right-3 top-3 rounded-full px-3 py-1.5 text-[16px] font-semibold ${
                    store.operatingStatus === "OPEN"
                      ? "bg-green-500 text-white"
                      : "bg-red-500 text-white"
                  }`}
                >
                  {store.operatingStatus === "OPEN" ? "កំពុងបើក" : "បានបិទ"}
                </span>
              </div>

              <div className="p-5">
                <div className="flex items-center gap-3">
                  <div className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-primary-50">
                    {store.logoUrl ? (
                      <Image
                        fill
                        src={store.logoUrl}
                        alt={store.localName}
                        sizes="56px"
                        className="object-cover"
                      />
                    ) : (
                      <FaStore className="text-[23px] text-primary-700" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <h3 className="truncate text-[19px] font-semibold text-primary-900">
                      {store.localName}
                    </h3>

                    <p className="truncate text-[16px] text-gray-500">
                      {store.name}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                  <span className="flex items-center gap-2 text-[16px] text-yellow-500">
                    <FaStar />
                    {store.averageRating}
                  </span>

                  <span className="text-[16px] text-gray-500">
                    {store.menuItems.length} មុខម្ហូប
                  </span>
                </div>

                <div className="scrollbar-hide mt-4 flex gap-2 overflow-x-auto">
                  {store.menuItems.slice(0, 3).map((item) => (
                    <span
                      key={item.uuid}
                      className="shrink-0 rounded-full bg-primary-50 px-3 py-1.5 text-[16px] text-primary-700"
                    >
                      {item.localName}
                    </span>
                  ))}
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </section>
    </motion.div>
  );
}
