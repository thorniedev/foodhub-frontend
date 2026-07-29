"use client";

import Link from "next/link";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import { useMemo } from "react";
import { useGetMenuItemsQuery } from "@/api/menuApi";
import FoodCard from "./FoodCard";

type StorePanelProps = {
  storeId?: string;
};

export default function StorePanel({ storeId }: StorePanelProps) {
  const { data, isLoading, isError } = useGetMenuItemsQuery();

  const foods = data?.data ?? [];

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAP_KEY!,
  });

  // map center
  const center = useMemo(
    () => ({
      lat: 11.5564,
      lng: 104.9282,
    }),
    [],
  );

  if (isLoading) return <p>Loading foods...</p>;

  if (isError) return <p>Failed loading food</p>;

  return (
    <section className="px-6">
      <h2
        className="
        mb-6
        text-center
        text-lg
        font-semibold
        text-primary-800
        underline
        decoration-2
        underline-offset-8
        "
      >
        ហាងអាហារ
      </h2>

      <div
        className="
        grid
        grid-cols-1
        lg:grid-cols-[420px_1fr]
        gap-6
        "
      >
        {/* ================= LEFT FOOD LIST ================= */}

        <div
          className="
          space-y-5
          max-h-[750px]
          overflow-y-auto
          pr-2
          "
        >
          {foods.map((food: any) => (
            <Link key={food.uuid} href={`/food/${food.uuid}`}>
              <FoodCard food={food} />
            </Link>
          ))}
        </div>

        {/* ================= GOOGLE MAP ================= */}

        <div
          className="
          h-[750px]
          overflow-hidden
          rounded-3xl
          border
          "
        >
          {isLoaded && (
            <GoogleMap
              zoom={14}
              center={center}
              mapContainerClassName="
                w-full
                h-full
                "
            >
              {foods.map((food: any) => (
                <Marker
                  key={food.uuid}
                  position={{
                    lat: Number(food.latitude) || 11.5564,

                    lng: Number(food.longitude) || 104.9282,
                  }}
                  title={food.name}
                />
              ))}
            </GoogleMap>
          )}
        </div>
      </div>
    </section>
  );
}
