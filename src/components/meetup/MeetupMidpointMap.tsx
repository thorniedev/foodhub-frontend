"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  Circle,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  ZoomControl,
} from "react-leaflet";
import { divIcon, latLngBounds, type DivIcon, type Map as LeafletMap } from "leaflet";
import {
  Compass,
  ExternalLink,
  Layers,
  MapPin,
  Maximize2,
  Minimize2,
  Navigation,
  RefreshCw,
  Sparkles,
  Star,
  Store,
  Users,
} from "lucide-react";

import type { Coordinates } from "@/types/location";
import type { GroupLocationMember, GroupRecommendedStore } from "@/types/group-location";

type SafeLatLng = [number, number];

const MEMBER_COLORS = [
  "#16a34a", // primary green
  "#ea580c", // orange
  "#7c3aed", // violet
  "#0891b2", // cyan
  "#db2777", // pink
  "#2563eb", // blue
  "#ca8a04", // yellow
  "#059669", // emerald
] as const;

function isSafeCoordinate(lat?: unknown, lng?: unknown): boolean {
  const latitude = typeof lat === "number" ? lat : Number(lat);
  const longitude = typeof lng === "number" ? lng : Number(lng);

  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

function createMeetingPointMarker(): DivIcon {
  return divIcon({
    className: "foodhub-leaflet-div-icon",
    html: `
      <div class="foodhub-meeting-marker">
        <span class="foodhub-meeting-marker__pulse"></span>
        <span class="foodhub-meeting-marker__body">
          <svg viewBox="0 0 24 24" aria-hidden="true" class="foodhub-meeting-marker__icon">
            <path fill="currentColor" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4Zm-6 8v-1c0-2.76 2.69-5 6-5s6 2.24 6 5v1H6Zm11.5-7.5a3 3 0 1 0 0-6 5.46 5.46 0 0 1 0 6Zm-11 0a5.46 5.46 0 0 1 0-6 3 3 0 1 0 0 6Z"/>
          </svg>
        </span>
        <span class="foodhub-meeting-marker__tip"></span>
      </div>
    `,
    iconSize: [58, 66],
    iconAnchor: [29, 62],
    popupAnchor: [0, -58],
  });
}

function createMemberMarker(name: string, index: number): DivIcon {
  const initial = Array.from(name.trim() || String(index + 1))[0]?.toUpperCase() || "M";
  const color = MEMBER_COLORS[index % MEMBER_COLORS.length];

  return divIcon({
    className: "foodhub-leaflet-div-icon",
    html: `
      <div class="foodhub-member-marker" style="--foodhub-member-color: ${color}">
        <span class="foodhub-member-marker__ring"></span>
        <span class="foodhub-member-marker__avatar">${initial}</span>
      </div>
    `,
    iconSize: [46, 46],
    iconAnchor: [23, 23],
    popupAnchor: [0, -22],
  });
}

function createStoreMarker(): DivIcon {
  return divIcon({
    className: "foodhub-leaflet-div-icon",
    html: `
      <div class="foodhub-store-pin">
        <span class="foodhub-store-pin__pulse"></span>
        <span class="foodhub-store-pin__body">
          <svg viewBox="0 0 24 24" aria-hidden="true" class="foodhub-store-pin__icon">
            <path fill="currentColor" d="M8.1 13.34 6.91 12.15c-1.13-1.13-1.75-2.64-1.75-4.24V2h1.5v5.91c0 .39.05.78.14 1.15h.86V2h1.5v7.06h.86c.09-.37.14-.76.14-1.15V2h1.5v5.91c0 1.6-.62 3.11-1.75 4.24L8.72 13.34V22H8.1v-8.66Zm8.24-1.03V22h-1.5v-8.31c-1.55-.62-2.68-2.42-2.68-4.55 0-2.67 1.77-4.84 3.94-4.84s3.94 2.17 3.94 4.84c0 2.13-1.13 3.93-2.7 4.55v-1.38Z" />
          </svg>
        </span>
        <span class="foodhub-store-pin__tip"></span>
      </div>
    `,
    iconSize: [48, 58],
    iconAnchor: [24, 54],
    popupAnchor: [0, -50],
  });
}

function MapViewController({
  center,
  allPositions,
}: {
  center: SafeLatLng;
  allPositions: SafeLatLng[];
}) {
  const map = useMap();
  const initialFitDone = useRef(false);

  useEffect(() => {
    if (!map) return;

    map.invalidateSize();

    if (!initialFitDone.current) {
      if (allPositions.length > 1) {
        try {
          const bounds = latLngBounds(allPositions);
          map.fitBounds(bounds, {
            padding: [40, 40],
            maxZoom: 15,
            animate: false,
          });
        } catch {
          map.setView(center, 14, { animate: false });
        }
      } else {
        map.setView(center, 14, { animate: false });
      }
      initialFitDone.current = true;
    }
  }, [map, center, allPositions]);

  return null;
}

function MapControls({
  center,
  allPositions,
}: {
  center: SafeLatLng;
  allPositions: SafeLatLng[];
}) {
  const map = useMap();

  const handleCenter = () => {
    map.flyTo(center, 15, { animate: true, duration: 0.6 });
  };

  const handleFitAll = () => {
    if (allPositions.length === 0) return;
    if (allPositions.length === 1) {
      map.flyTo(allPositions[0], 15, { animate: true, duration: 0.6 });
      return;
    }
    const bounds = latLngBounds(allPositions);
    map.fitBounds(bounds, {
      padding: [40, 40],
      maxZoom: 15,
      animate: true,
      duration: 0.6,
    });
  };

  return (
    <div className="leaflet-top leaflet-right foodhub-map-action-position">
      <div className="leaflet-control foodhub-map-action-control flex gap-1 rounded-2xl border border-slate-200 bg-white/95 p-1 shadow-md backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95">
        <button
          type="button"
          title="ទៅចំណុចកណ្ដាល"
          onClick={handleCenter}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <Navigation className="h-4 w-4 text-primary-600 dark:text-primary-400" />
        </button>
        <button
          type="button"
          title="មើលសមាជិកទាំងអស់"
          onClick={handleFitAll}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

interface InnerMidpointMapProps {
  midpoint: Coordinates;
  members: GroupLocationMember[];
  stores?: GroupRecommendedStore[];
  radiusKm: number;
}

function InnerMidpointMap({
  midpoint,
  members,
  stores = [],
  radiusKm,
}: InnerMidpointMapProps) {
  const safeMidpoint: SafeLatLng = [midpoint.latitude, midpoint.longitude];
  const meetingMarkerIcon = useMemo(() => createMeetingPointMarker(), []);
  const storeMarkerIcon = useMemo(() => createStoreMarker(), []);

  const validMemberEntries = useMemo(() => {
    return members.flatMap((member, index) => {
      if (
        member.coordinates &&
        isSafeCoordinate(member.coordinates.latitude, member.coordinates.longitude)
      ) {
        return [
          {
            member,
            position: [member.coordinates.latitude, member.coordinates.longitude] as SafeLatLng,
            index,
          },
        ];
      }
      return [];
    });
  }, [members]);

  const validStoreEntries = useMemo(() => {
    return stores.flatMap((store) => {
      if (isSafeCoordinate(store.latitude, store.longitude)) {
        return [
          {
            store,
            position: [store.latitude, store.longitude] as SafeLatLng,
          },
        ];
      }
      return [];
    });
  }, [stores]);

  const allPositions = useMemo(() => {
    const list: SafeLatLng[] = [safeMidpoint];
    for (const entry of validMemberEntries) {
      list.push(entry.position);
    }
    for (const entry of validStoreEntries) {
      list.push(entry.position);
    }
    return list;
  }, [safeMidpoint, validMemberEntries, validStoreEntries]);

  const radiusMeters = Math.max(radiusKm, 0.5) * 1000;

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl">
      <MapContainer
        center={safeMidpoint}
        zoom={14}
        minZoom={5}
        maxZoom={19}
        zoomControl={false}
        scrollWheelZoom
        className="h-full w-full min-h-[360px] sm:min-h-[420px]"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        <MapViewController center={safeMidpoint} allPositions={allPositions} />
        <MapControls center={safeMidpoint} allPositions={allPositions} />
        <ZoomControl position="bottomright" />

        {/* Search radius circle around midpoint */}
        <Circle
          center={safeMidpoint}
          radius={radiusMeters}
          pathOptions={{
            color: "#16a34a",
            fillColor: "#22c55e",
            fillOpacity: 0.08,
            weight: 2,
            dashArray: "6 8",
          }}
        />

        {/* Group Midpoint Marker */}
        <Marker position={safeMidpoint} icon={meetingMarkerIcon} zIndexOffset={1200}>
          <Popup className="foodhub-map-popup" closeButton={false} minWidth={220}>
            <div className="p-1">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-primary-700">
                  <Compass className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-black text-slate-900">ចំណុចកណ្ដាលរបស់ក្រុម</p>
                  <p className="text-xs text-slate-500">Group Midpoint</p>
                </div>
              </div>
              <p className="mt-2 text-xs font-mono text-slate-600">
                {midpoint.latitude.toFixed(5)}, {midpoint.longitude.toFixed(5)}
              </p>
            </div>
          </Popup>
        </Marker>

        {/* Members Markers */}
        {validMemberEntries.map(({ member, position, index }) => (
          <Marker
            key={member.uuid}
            position={position}
            icon={createMemberMarker(member.name, index)}
            zIndexOffset={900 + index}
          >
            <Popup className="foodhub-map-popup" closeButton={false} minWidth={200}>
              <div className="flex items-center gap-2.5 p-1">
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{
                    backgroundColor: MEMBER_COLORS[index % MEMBER_COLORS.length],
                  }}
                >
                  {Array.from(member.name.trim() || String(index + 1))[0]?.toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-900">{member.name}</p>
                  <p className="text-xs text-slate-500">ទីតាំងសមាជិក</p>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Store Markers */}
        {validStoreEntries.map(({ store, position }) => (
          <Marker
            key={store.uuid}
            position={position}
            icon={storeMarkerIcon}
            zIndexOffset={600}
          >
            <Popup className="foodhub-map-popup" closeButton={false} minWidth={220}>
              <div className="p-1">
                <p className="text-sm font-black text-slate-900 line-clamp-1">
                  {store.localName || store.name}
                </p>
                <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                  <span className="flex items-center gap-1 font-bold text-amber-600">
                    <Star className="h-3 w-3 fill-current" />
                    {store.averageRating ? store.averageRating.toFixed(1) : "ថ្មី"}
                  </span>
                  <span>·</span>
                  <span>{store.distanceKm.toFixed(1)} គ.ម ពីចំណុចកណ្ដាល</span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

const DynamicMidpointMap = dynamic(
  () => Promise.resolve(InnerMidpointMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[360px] sm:h-[420px] w-full items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
        <div className="flex flex-col items-center gap-2 text-slate-400">
          <RefreshCw className="h-6 w-6 animate-spin text-primary-600" />
          <span className="text-xs font-bold">កំពុងផ្ទុកផែនទី...</span>
        </div>
      </div>
    ),
  },
);

export interface MeetupMidpointMapProps {
  midpoint: Coordinates | null;
  members: GroupLocationMember[];
  stores?: GroupRecommendedStore[];
  radiusKm?: number;
  isCalculatedFromMembers?: boolean;
}

export default function MeetupMidpointMap({
  midpoint,
  members,
  stores = [],
  radiusKm = 5,
  isCalculatedFromMembers = false,
}: MeetupMidpointMapProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const readyMemberCount = useMemo(
    () =>
      members.filter(
        (member) =>
          member.locationStatus === "ready" &&
          member.coordinates &&
          isSafeCoordinate(member.coordinates.latitude, member.coordinates.longitude),
      ).length,
    [members],
  );

  if (!midpoint || !isSafeCoordinate(midpoint.latitude, midpoint.longitude)) {
    return null;
  }

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${midpoint.latitude},${midpoint.longitude}`;

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition dark:border-slate-800 dark:bg-slate-900">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4 sm:px-6 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
            <Compass className="h-5 w-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                ផែនទីចំណុចកណ្ដាលរបស់ក្រុម
              </h2>
              {isCalculatedFromMembers && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  <Sparkles className="h-3 w-3" />
                  គណនាស្វ័យប្រវត្តិ
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              រកហាងដែលស្ថិតនៅចំណុចកណ្ដាលងាយស្រួលសម្រាប់សមាជិកគ្រប់គ្នា
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Google Maps
          </a>
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            {isExpanded ? (
              <>
                <Minimize2 className="h-3.5 w-3.5" />
                បង្រួម
              </>
            ) : (
              <>
                <Maximize2 className="h-3.5 w-3.5" />
                ពង្រីក
              </>
            )}
          </button>
        </div>
      </div>

      {/* Info Pills */}
      <div className="grid grid-cols-2 gap-2 border-b border-slate-100 bg-slate-50/50 p-3 text-xs sm:grid-cols-4 sm:px-6 dark:border-slate-800 dark:bg-slate-950/30">
        <div className="flex items-center gap-2 font-semibold text-slate-600 dark:text-slate-300">
          <MapPin className="h-4 w-4 shrink-0 text-primary-600 dark:text-primary-400" />
          <span className="truncate">
            {midpoint.latitude.toFixed(4)}, {midpoint.longitude.toFixed(4)}
          </span>
        </div>
        <div className="flex items-center gap-2 font-semibold text-slate-600 dark:text-slate-300">
          <Users className="h-4 w-4 shrink-0 text-primary-600 dark:text-primary-400" />
          <span>{readyMemberCount}/{members.length} បានចែករំលែកទីតាំង</span>
        </div>
        <div className="flex items-center gap-2 font-semibold text-slate-600 dark:text-slate-300">
          <Store className="h-4 w-4 shrink-0 text-primary-600 dark:text-primary-400" />
          <span>{stores.length} ហាងដែលរកឃើញ</span>
        </div>
        <div className="flex items-center gap-2 font-semibold text-slate-600 dark:text-slate-300">
          <Navigation className="h-4 w-4 shrink-0 text-primary-600 dark:text-primary-400" />
          <span>កាំស្វែងរក {radiusKm} គ.ម</span>
        </div>
      </div>

      {/* Interactive Map */}
      {isExpanded && (
        <div className="p-3 sm:p-5">
          <div className="h-[340px] sm:h-[400px] w-full overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
            <DynamicMidpointMap
              midpoint={midpoint}
              members={members}
              stores={stores}
              radiusKm={radiusKm}
            />
          </div>
        </div>
      )}
    </section>
  );
}
