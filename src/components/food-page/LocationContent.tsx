"use client";

import {
  useMemo,
  useState,
} from "react";

import Image from "next/image";
import { motion } from "framer-motion";

import {
  IoLocationOutline,
  IoNavigateOutline,
  IoSearchOutline,
} from "react-icons/io5";

import {
  FaMapMarkerAlt,
  FaStar,
  FaStore,
} from "react-icons/fa";

import type {
  MenuItem,
  Store,
} from "@/types/manu";

type LocationContentProps = {
  menuItems: MenuItem[];
};

type StoreWithMenuCount = Store & {
  menuCount: number;
  nearestDistance: number;
};

export default function LocationContent({
  menuItems,
}: LocationContentProps) {
  const [query, setQuery] =
    useState("");

  const stores = useMemo<
    StoreWithMenuCount[]
  >(() => {
    const storeMap = new Map<
      string,
      StoreWithMenuCount
    >();

    menuItems.forEach((menuItem) => {
      const existingStore =
        storeMap.get(
          menuItem.store.uuid,
        );

      if (existingStore) {
        existingStore.menuCount += 1;

        existingStore.nearestDistance =
          Math.min(
            existingStore.nearestDistance,
            menuItem.distanceKm,
          );

        return;
      }

      storeMap.set(
        menuItem.store.uuid,
        {
          ...menuItem.store,
          menuCount: 1,
          nearestDistance:
            menuItem.distanceKm,
        },
      );
    });

    return Array.from(
      storeMap.values(),
    ).sort(
      (first, second) =>
        first.nearestDistance -
        second.nearestDistance,
    );
  }, [menuItems]);

  const filteredStores = useMemo(() => {
    const normalizedQuery =
      query.trim().toLowerCase();

    if (!normalizedQuery) {
      return stores;
    }

    return stores.filter((store) => {
      const searchableValues = [
        store.name,
        store.localName,
        store.addressLine,
        store.district,
        store.city,
      ];

      return searchableValues.some(
        (value) =>
          value
            .toLowerCase()
            .includes(
              normalizedQuery,
            ),
      );
    });
  }, [stores, query]);

  return (
    <motion.div
      key="location-content"
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
        ease: "easeOut",
      }}
    >
      <section className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 px-6 py-10 text-white sm:px-10">
        <motion.div
          className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-white/10 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <div className="relative z-10 max-w-3xl">
          <p className="text-[16px] font-semibold text-secondary-300">
            FoodHub Location
          </p>

          <h1 className="mt-2 text-[32px] font-bold leading-tight sm:text-[42px]">
            មុខម្ហូប និងហាងអាហារនៅជិតអ្នក
          </h1>

          <p className="mt-4 text-[16px] leading-8 text-white/85">
            ស្វែងរកហាងអាហារតាមទីក្រុង តំបន់ អាសយដ្ឋាន និងចម្ងាយពីទីតាំងរបស់អ្នក។
          </p>
        </div>
      </section>

      <section className="mt-6 rounded-[24px] border border-gray-100 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex min-h-[56px] flex-1 items-center gap-3 rounded-full border border-gray-200 px-5 focus-within:border-primary-700 focus-within:ring-4 focus-within:ring-primary-50">
            <IoSearchOutline className="shrink-0 text-[22px] text-primary-700" />

            <input
              type="text"
              value={query}
              onChange={(event) =>
                setQuery(
                  event.target.value,
                )
              }
              placeholder="ស្វែងរកហាង តំបន់ ឬទីក្រុង..."
              className="w-full bg-transparent text-[16px] text-gray-700 outline-none placeholder:text-gray-400"
            />

            {query && (
              <button
                type="button"
                onClick={() =>
                  setQuery("")
                }
                className="text-[16px] font-medium text-secondary-500"
              >
                សម្អាត
              </button>
            )}
          </div>

          <button
            type="button"
            className="flex min-h-[56px] items-center justify-center gap-2 rounded-full bg-primary-800 px-6 text-[16px] font-semibold text-white transition hover:bg-primary-700 active:scale-95"
          >
            <IoLocationOutline className="text-[22px]" />

            ប្រើទីតាំងខ្ញុំ
          </button>
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[16px] font-semibold text-secondary-500">
              ទីតាំងដែលអាចរកបាន
            </p>

            <h2 className="mt-1 text-[28px] font-bold text-primary-900">
              ហាងអាហារនៅជិតអ្នក
            </h2>
          </div>

          <p className="text-[16px] text-gray-500">
            រកឃើញ{" "}
            <span className="font-semibold text-primary-800">
              {filteredStores.length}
            </span>{" "}
            ហាង
          </p>
        </div>

        {filteredStores.length ===
        0 ? (
          <div className="rounded-[24px] border border-dashed border-gray-200 bg-white px-5 py-16 text-center">
            <IoLocationOutline className="mx-auto text-[46px] text-primary-300" />

            <h3 className="mt-4 text-[20px] font-semibold text-primary-900">
              រកមិនឃើញទីតាំង
            </h3>

            <p className="mt-2 text-[16px] leading-7 text-gray-500">
              សូមសាកល្បងស្វែងរកដោយឈ្មោះហាង តំបន់ ឬទីក្រុងផ្សេងទៀត។
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredStores.map(
              (store) => {
                const mapUrl =
                  `https://www.google.com/maps?q=${store.latitude},${store.longitude}`;

                return (
                  <motion.article
                    key={
                      store.uuid
                    }
                    whileHover={{
                      y: -5,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 22,
                    }}
                    className="overflow-hidden rounded-[24px] border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-lg"
                  >
                    <div className="relative h-[190px] overflow-hidden bg-primary-50">
                      {store.coverImageUrl ? (
                        <Image
                          fill
                          src={
                            store.coverImageUrl
                          }
                          alt={
                            store.localName
                          }
                          sizes="(max-width: 768px) 100vw, 400px"
                          className="object-cover transition-transform duration-500 hover:scale-105"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary-100 to-secondary-100">
                          <FaMapMarkerAlt className="text-[52px] text-primary-700" />
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />

                      <span
                        className={`absolute right-3 top-3 rounded-full px-3 py-1.5 text-[16px] font-semibold shadow ${
                          store.operatingStatus ===
                          "OPEN"
                            ? "bg-green-500 text-white"
                            : "bg-red-500 text-white"
                        }`}
                      >
                        {store.operatingStatus ===
                        "OPEN"
                          ? "កំពុងបើក"
                          : "បានបិទ"}
                      </span>

                      <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 backdrop-blur">
                        <IoNavigateOutline className="text-[19px] text-primary-700" />

                        <span className="text-[16px] font-semibold text-primary-900">
                          {
                            store.nearestDistance
                          }{" "}
                          km
                        </span>
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-50">
                          {store.logoUrl ? (
                            <Image
                              fill
                              src={
                                store.logoUrl
                              }
                              alt={
                                store.localName
                              }
                              sizes="56px"
                              className="object-cover"
                            />
                          ) : (
                            <FaStore className="text-[24px] text-primary-700" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <h3 className="truncate text-[19px] font-semibold text-primary-900">
                            {
                              store.localName
                            }
                          </h3>

                          <p className="truncate text-[16px] text-gray-500">
                            {store.name}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex items-start gap-2 text-[16px] leading-7 text-gray-500">
                        <FaMapMarkerAlt className="mt-1 shrink-0 text-primary-700" />

                        <span>
                          {
                            store.addressLine
                          }
                          ,{" "}
                          {
                            store.district
                          }
                          , {store.city}
                        </span>
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                        <span className="flex items-center gap-2 text-[16px] text-yellow-500">
                          <FaStar />

                          {
                            store.averageRating
                          }
                        </span>

                        <span className="text-[16px] text-gray-500">
                          {
                            store.menuCount
                          }{" "}
                          មុខម្ហូប
                        </span>
                      </div>

                      <a
                        href={mapUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-5 flex items-center justify-center gap-2 rounded-full bg-primary-800 px-5 py-3 text-[16px] font-semibold text-white transition hover:bg-primary-700 active:scale-95"
                      >
                        <IoNavigateOutline className="text-[20px]" />

                        បើកក្នុងផែនទី
                      </a>
                    </div>
                  </motion.article>
                );
              },
            )}
          </div>
        )}
      </section>
    </motion.div>
  );
}