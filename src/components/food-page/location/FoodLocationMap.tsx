"use client";

import { useEffect, useMemo } from "react";
import {
  Circle,
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";

import type { GroupMember } from "@/types/group-recommendation";
import type {
  Coordinates,
  RecommendationMode,
  RecommendedStore,
} from "@/types/location";

interface FoodLocationMapProps {
  mode: RecommendationMode;
  userLocation: Coordinates | null;
  groupMembers?: GroupMember[];
  meetingPoint?: Coordinates | null;
  stores: RecommendedStore[];
  selectedStoreId: string | null;
  radiusKm: number;
  onSelectStore: (storeId: string) => void;
}

function MapController({
  center,
  selectedStore,
}: {
  center: Coordinates;
  selectedStore: RecommendedStore | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const target = selectedStore ?? center;

    if (
      !Number.isFinite(target.latitude) ||
      !Number.isFinite(target.longitude)
    ) {
      return;
    }

    // map.flyTo([target.latitude, target.longitude], selectedStore ? 16 : 14, {
    //   duration: 0.8,
    // });
  }, [center, map, selectedStore]);

  return null;
}

export default function FoodLocationMap({
  mode,
  userLocation,
  groupMembers = [],
  meetingPoint,
  stores,
  selectedStoreId,
  radiusKm,
  onSelectStore,
}: FoodLocationMapProps) {
  const fallbackStore = stores[0];

  const center = useMemo<Coordinates>(() => {
    if (mode === "group" && meetingPoint) return meetingPoint;
    if (userLocation) return userLocation;

    return {
      latitude: fallbackStore?.latitude ?? 11.5564,
      longitude: fallbackStore?.longitude ?? 104.9282,
    };
  }, [fallbackStore, meetingPoint, mode, userLocation]);

  const selectedStore =
    stores.find((store) => store.uuid === selectedStoreId) ?? null;

  return (
    <div className="overflow-hidden rounded-[26px] border border-gray-200 bg-white shadow-sm">
      <MapContainer
        center={[center.latitude, center.longitude]}
        zoom={14}
        scrollWheelZoom
        className="h-[62dvh] min-h-[480px] w-full md:h-[680px] 2xl:h-[calc(100vh-250px)]"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController center={center} selectedStore={selectedStore} />

        <Circle
          center={[center.latitude, center.longitude]}
          radius={radiusKm * 1000}
          pathOptions={{
            color: "#166534",
            fillColor: "#22c55e",
            fillOpacity: 0.06,
            weight: 1,
          }}
        />

        {userLocation && (
          <CircleMarker
            center={[userLocation.latitude, userLocation.longitude]}
            radius={10}
            pathOptions={{
              color: "#ffffff",
              fillColor: "#2563eb",
              fillOpacity: 1,
              weight: 4,
            }}
          >
            <Popup>
              <div className="min-w-44">
                <p className="text-[16px] font-semibold">Your live location</p>
                {userLocation.accuracy && (
                  <p className="mt-1 text-[14px] text-gray-500">
                    Accuracy about {Math.round(userLocation.accuracy)} m
                  </p>
                )}
              </div>
            </Popup>
          </CircleMarker>
        )}

        {mode === "group" &&
          groupMembers.map((member, index) => {
            if (!member.coordinates) return null;

            const colors = ["#7c3aed", "#ea580c", "#0891b2", "#db2777"];

            return (
              <CircleMarker
                key={member.uuid}
                center={[
                  member.coordinates.latitude,
                  member.coordinates.longitude,
                ]}
                radius={9}
                pathOptions={{
                  color: "#ffffff",
                  fillColor: colors[index % colors.length],
                  fillOpacity: 1,
                  weight: 3,
                }}
              >
                <Popup>
                  <p className="text-[16px] font-semibold">{member.name}</p>
                </Popup>
              </CircleMarker>
            );
          })}

        {mode === "group" && meetingPoint && (
          <CircleMarker
            center={[meetingPoint.latitude, meetingPoint.longitude]}
            radius={13}
            pathOptions={{
              color: "#ffffff",
              fillColor: "#eab308",
              fillOpacity: 1,
              weight: 4,
            }}
          >
            <Popup>
              <p className="text-[16px] font-semibold">Group midpoint</p>
            </Popup>
          </CircleMarker>
        )}

        {stores.map((store) => {
          const selected = selectedStoreId === store.uuid;

          return (
            <CircleMarker
              key={store.uuid}
              center={[store.latitude, store.longitude]}
              radius={selected ? 13 : 9}
              pathOptions={{
                color: "#ffffff",
                fillColor: selected ? "#f97316" : "#166534",
                fillOpacity: 1,
                weight: selected ? 4 : 3,
              }}
              eventHandlers={{
                click: () => onSelectStore(store.uuid),
              }}
            >
              <Popup>
                <div className="min-w-56">
                  <p className="text-[16px] font-semibold text-gray-900">
                    {store.localName || store.name}
                  </p>
                  <p className="mt-1 text-[14px] text-gray-500">
                    {store.addressLine}, {store.district}
                  </p>
                  <p className="mt-2 text-[14px]">
                    ⭐ {store.averageRating} · {store.distanceKm.toFixed(1)} km
                  </p>
                  <button
                    type="button"
                    onClick={() => onSelectStore(store.uuid)}
                    className="mt-3 rounded-full bg-primary-800 px-4 py-2 text-[14px] font-semibold text-white"
                  >
                    Select store
                  </button>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
