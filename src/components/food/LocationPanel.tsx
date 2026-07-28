"use client";

import Link from "next/link";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import { useMemo } from "react";
import { IoLocationOutline } from "react-icons/io5";
import FoodCard from "../FoodCard";
import { useGetMenuItemsQuery } from "@/redux/api/fooodApi";

type MenuItem = {
  uuid: string;
  name: string;
  localName?: string;
  store?: { latitude?: number; longitude?: number; name?: string };
};

const DEFAULT_CENTER = { lat: 11.5564, lng: 104.9282 }; // Phnom Penh

export default function LocationPanel() {
  const { data, isLoading, isError } = useGetMenuItemsQuery();
  const foods: MenuItem[] = data?.data ?? [];

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAP_KEY!,
  });

  // center the map on the first item that has store coordinates
  const center = useMemo(() => {
    const withCoords = foods.find(
      (f) => f.store?.latitude && f.store?.longitude,
    );
    return withCoords
      ? {
          lat: Number(withCoords.store!.latitude),
          lng: Number(withCoords.store!.longitude),
        }
      : DEFAULT_CENTER;
  }, [foods]);

  if (isLoading) return <p className="px-6 text-gray-500">កំពុងផ្ទុក...</p>;
  if (isError) return <p className="px-6 text-red-500">ផ្ទុកមិនបានជោគជ័យ</p>;

  return (
    <section className="px-6">
      <h2 className="mb-6 text-center text-lg font-semibold text-primary-800 underline decoration-2 underline-offset-8">
        ទីតាំងជិតអ្នក
      </h2>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* ================= LEFT: FOOD CARD GRID ================= */}
        <div className="lg:flex-1">
          {foods.length === 0 ? (
            <p className="text-sm text-gray-400">មិនមានលទ្ធផលទេ</p>
          ) : (
            <div className="grid max-w-5xl grid-cols-1 place-content-center gap-2 pt-2 sm:grid-cols-2 xl:grid-cols-3">
              {foods.map((food) => (
                <Link key={food.uuid} href={`/food/${food.uuid}`}>
                  <FoodCard food={food} />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* ================= RIGHT: GOOGLE MAP ================= */}
        <div className="lg:w-[46%]">
          <div className="sticky top-32 h-[70vh] overflow-hidden rounded-3xl border border-gray-200 bg-white">
            {isLoaded ? (
              <GoogleMap
                zoom={13}
                center={center}
                mapContainerClassName="w-full h-full"
              >
                {foods.map((food) =>
                  food.store?.latitude && food.store?.longitude ? (
                    <Marker
                      key={food.uuid}
                      position={{
                        lat: Number(food.store.latitude),
                        lng: Number(food.store.longitude),
                      }}
                      title={food.localName ?? food.name}
                    />
                  ) : null,
                )}
              </GoogleMap>
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-gray-400">
                <IoLocationOutline className="text-3xl text-primary-700" />
                <p className="text-sm">កំពុងផ្ទុកផែនទី...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
