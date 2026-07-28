"use client";

import Link from "next/link";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import { useMemo } from "react";
import { FaStar, FaStore } from "react-icons/fa";
import { IoLocationOutline } from "react-icons/io5";
import { useGetMenuItemsQuery } from "@/redux/api/fooodApi";

type StoreInfo = {
  uuid: string;
  name: string;
  localName?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  addressLine?: string;
  district?: string;
  city?: string;
  latitude: number;
  longitude: number;
  operatingStatus?: "OPEN" | "CLOSED" | string;
  averageRating?: number;
  totalReviews?: number;
};

type MenuItem = {
  uuid: string;
  name: string;
  localName?: string;
  store: StoreInfo;
};

type StoreWithItems = StoreInfo & { itemCount: number; sample?: MenuItem };

const DEFAULT_CENTER = { lat: 11.5564, lng: 104.9282 };

export default function StorePanel() {
  const { data, isLoading, isError } = useGetMenuItemsQuery();
  const foods: MenuItem[] = data?.data ?? [];

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAP_KEY!,
  });

  // group menu items by store.uuid -> one entry per unique store
  const stores: StoreWithItems[] = useMemo(() => {
    const map = new Map<string, StoreWithItems>();
    for (const item of foods) {
      const s = item.store;
      if (!s?.uuid) continue;
      const existing = map.get(s.uuid);
      if (existing) {
        existing.itemCount += 1;
      } else {
        map.set(s.uuid, { ...s, itemCount: 1, sample: item });
      }
    }
    return Array.from(map.values());
  }, [foods]);

  // center the map on the first store we have coords for
  const center = useMemo(() => {
    const withCoords = stores.find((s) => s.latitude && s.longitude);
    return withCoords
      ? { lat: Number(withCoords.latitude), lng: Number(withCoords.longitude) }
      : DEFAULT_CENTER;
  }, [stores]);

  if (isLoading) return <p className="px-6 text-gray-500">កំពុងផ្ទុក...</p>;
  if (isError) return <p className="px-6 text-red-500">ផ្ទុកមិនបានជោគជ័យ</p>;

  return (
    <section className="px-6">
      <h2 className="mb-6 text-center text-lg font-semibold text-primary-800 underline decoration-2 underline-offset-8">
        ហាងអាហារ
      </h2>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[420px_1fr]">
        {/* ================= LEFT: STORE LIST ================= */}
        <div className="max-h-[750px] space-y-5 overflow-y-auto pr-2">
          {stores.length === 0 && (
            <p className="text-sm text-gray-400">មិនមានហាងអាហារទេ</p>
          )}

          {stores.map((store) => (
            <Link
              key={store.uuid}
              href={`/store/${store.uuid}`}
              className="block overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              {/* cover */}
              <div className="relative h-36 w-full bg-gray-100">
                {store.coverImageUrl && (
                  <img
                    src={store.coverImageUrl}
                    alt={store.localName ?? store.name}
                    className="h-full w-full object-cover"
                  />
                )}
                {store.operatingStatus && (
                  <span
                    className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-medium ${
                      store.operatingStatus === "OPEN"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {store.operatingStatus === "OPEN" ? "បើក" : "បិទ"}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-1.5 p-4">
                <div className="flex items-center gap-2 text-primary-900">
                  <FaStore className="shrink-0 text-sm text-secondary-500" />
                  <h3 className="truncate font-medium">
                    {store.localName ?? store.name}
                  </h3>
                </div>

                <div className="flex items-center gap-3 text-xs text-primary-400">
                  <span className="flex items-center gap-1 text-accent-400">
                    <FaStar className="text-[10px]" />
                    {store.averageRating ?? "-"}
                    {store.totalReviews != null && (
                      <span className="text-gray-400">
                        ({store.totalReviews})
                      </span>
                    )}
                  </span>
                  <span>{store.itemCount} មុខម្ហូប</span>
                </div>

                {(store.district || store.city) && (
                  <p className="flex items-center gap-1 truncate text-xs text-gray-400">
                    <IoLocationOutline className="shrink-0" />
                    {[store.district, store.city].filter(Boolean).join(", ")}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>

        {/* ================= RIGHT: MAP ================= */}
        <div className="h-[750px] overflow-hidden rounded-3xl border">
          {isLoaded && (
            <GoogleMap
              zoom={13}
              center={center}
              mapContainerClassName="w-full h-full"
            >
              {stores.map((store) => (
                <Marker
                  key={store.uuid}
                  position={{
                    lat: Number(store.latitude) || DEFAULT_CENTER.lat,
                    lng: Number(store.longitude) || DEFAULT_CENTER.lng,
                  }}
                  title={store.localName ?? store.name}
                />
              ))}
            </GoogleMap>
          )}
        </div>
      </div>
    </section>
  );
}