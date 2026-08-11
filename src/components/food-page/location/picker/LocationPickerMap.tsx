"use client";

import { useEffect, useMemo, useRef } from "react";

import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
  ZoomControl,
} from "react-leaflet";

import { divIcon, type DivIcon, type Marker as LeafletMarker } from "leaflet";

import type { Coordinates } from "@/types/location";

import type { LocationSearchResult } from "@/types/location-search";

interface LocationPickerMapProps {
  value: Coordinates;

  selectedPlace: LocationSearchResult | null;

  onChange: (location: Coordinates) => void;
}

type SafeLatLng = [number, number];

const DEFAULT_LOCATION: SafeLatLng = [11.5564, 104.9282];

function getSafePosition(value: Coordinates): SafeLatLng {
  const latitude = Number(value.latitude);

  const longitude = Number(value.longitude);

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return DEFAULT_LOCATION;
  }

  return [latitude, longitude];
}

function createLocationMarker(): DivIcon {
  return divIcon({
    className: "foodhub-location-picker-div-icon",

    html: `
      <div
        style="
          position: relative;
          width: 66px;
          height: 72px;
          display: flex;
          justify-content: center;
          align-items: flex-start;
        "
      >
        <span
          style="
            position: absolute;
            top: 2px;
            width: 58px;
            height: 58px;
            border-radius: 9999px;
            background: rgba(22, 101, 52, 0.18);
          "
        ></span>

        <span
          style="
            position: relative;
            display: flex;
            width: 54px;
            height: 54px;
            align-items: center;
            justify-content: center;
            border-radius: 9999px;
            background: #166534;
            border: 5px solid white;
            color: white;
            box-shadow:
              0 12px 28px
              rgba(15, 23, 42, 0.28);
          "
        >
          <svg
            viewBox="0 0 24 24"
            width="25"
            height="25"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              d="
                M12 2
                C8.13 2 5 5.13 5 9
                c0 5.25 7 13 7 13
                s7-7.75 7-13
                c0-3.87-3.13-7-7-7
                Z

                M12 11.5
                A2.5 2.5 0 1 1 12 6
                a2.5 2.5 0 0 1 0 5.5
                Z
              "
            />
          </svg>
        </span>

        <span
          style="
            position: absolute;
            bottom: 3px;
            width: 20px;
            height: 7px;
            border-radius: 9999px;
            background: rgba(15, 23, 42, 0.24);
            filter: blur(2px);
          "
        ></span>
      </div>
    `,

    iconSize: [66, 72],

    iconAnchor: [33, 63],

    popupAnchor: [0, -58],
  });
}

function MapViewportController({ position }: { position: SafeLatLng }) {
  const map = useMap();

  const latitude = position[0];

  const longitude = position[1];

  useEffect(() => {
    map.stop();

    map.flyTo([latitude, longitude], 16, {
      animate: true,

      duration: 0.9,

      easeLinearity: 0.25,
    });
  }, [latitude, longitude, map]);

  return null;
}

function MapClickController({
  onChange,
}: {
  onChange: (location: Coordinates) => void;
}) {
  useMapEvents({
    click(event) {
      onChange({
        latitude: event.latlng.lat,

        longitude: event.latlng.lng,
      });
    },
  });

  return null;
}

function MapResizeController() {
  const map = useMap();

  useEffect(() => {
    const refreshMap = () => {
      map.invalidateSize({
        animate: false,
      });
    };

    const timeoutOne = window.setTimeout(refreshMap, 80);

    const timeoutTwo = window.setTimeout(refreshMap, 300);

    const container = map.getContainer();

    const observer =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(refreshMap)
        : null;

    observer?.observe(container);

    window.addEventListener("resize", refreshMap);

    return () => {
      window.clearTimeout(timeoutOne);

      window.clearTimeout(timeoutTwo);

      observer?.disconnect();

      window.removeEventListener("resize", refreshMap);
    };
  }, [map]);

  return null;
}

function getAreaLabel(place: LocationSearchResult): string {
  return [place.city, place.state, place.country].filter(Boolean).join(" • ");
}

export default function LocationPickerMap({
  value,
  selectedPlace,
  onChange,
}: LocationPickerMapProps) {
  const markerRef = useRef<LeafletMarker | null>(null);

  const position = useMemo(
    () => getSafePosition(value),
    [value.latitude, value.longitude],
  );

  const markerIcon = useMemo(() => createLocationMarker(), []);

  /*
   * Open the location popup
   * automatically when the user
   * selects a search result or
   * reverse-geocoding finishes.
   */
  useEffect(() => {
    if (!selectedPlace) {
      return;
    }

    const timeout = window.setTimeout(() => {
      markerRef.current?.openPopup();
    }, 450);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [selectedPlace?.id, selectedPlace?.latitude, selectedPlace?.longitude]);

  const areaLabel = selectedPlace ? getAreaLabel(selectedPlace) : "";

  return (
    <MapContainer
      center={position}
      zoom={16}
      minZoom={2}
      maxZoom={20}
      zoomControl={false}
      scrollWheelZoom
      className="h-full min-h-[440px] w-full"
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors &copy; CARTO"
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />

      <ZoomControl position="bottomright" />

      <MapResizeController />

      <MapViewportController position={position} />

      <MapClickController onChange={onChange} />

      <Marker
        ref={markerRef}
        position={position}
        icon={markerIcon}
        draggable
        autoPan
        eventHandlers={{
          dragend(event) {
            const marker = event.target as LeafletMarker;

            const location = marker.getLatLng();

            onChange({
              latitude: location.lat,

              longitude: location.lng,
            });
          },
        }}
      >
        {selectedPlace && (
          <Popup closeButton={false} minWidth={270} maxWidth={340}>
            <div className="min-w-0 py-1">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="currentColor"
                  >
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5Z" />
                  </svg>
                </span>

                <div className="min-w-0 flex-1">
                  <p
                    role="heading"
                    aria-level={3}
                    className="text-[17px] font-bold leading-6 text-slate-900"
                  >
                    {selectedPlace.name}
                  </p>

                  <p className="mt-1 text-[15px] leading-6 text-slate-600">
                    {selectedPlace.address}
                  </p>

                  {areaLabel && (
                    <p className="mt-2 text-[14px] font-semibold text-emerald-700">
                      {areaLabel}
                    </p>
                  )}

                  <p className="mt-1 text-[14px] text-slate-400">
                    {selectedPlace.latitude.toFixed(6)},
                    {selectedPlace.longitude.toFixed(6)}
                  </p>
                </div>
              </div>
            </div>
          </Popup>
        )}
      </Marker>
    </MapContainer>
  );
}
