"use client";

import { useEffect, useMemo } from "react";

import { divIcon, Marker as LeafletMarker, type LeafletEvent } from "leaflet";

import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
  ZoomControl,
} from "react-leaflet";

import type { Coordinates } from "@/types/location";

interface LocationPickerMapProps {
  value: Coordinates;

  onChange: (coordinates: Coordinates) => void;
}

type MapPosition = [number, number];

const DEFAULT_POSITION: MapPosition = [11.5564, 104.9282];

const LOCATION_MARKER_ICON = divIcon({
  className: "foodhub-leaflet-div-icon",

  html: `
      <div
        style="
          position: relative;
          display: flex;
          width: 56px;
          height: 66px;
          align-items: flex-start;
          justify-content: center;
        "
      >
        <span
          style="
            position: absolute;
            bottom: 0;
            left: 50%;
            width: 32px;
            height: 10px;
            border-radius: 999px;
            background: rgba(15, 23, 42, 0.22);
            filter: blur(3px);
            transform: translateX(-50%);
          "
        ></span>

        <span
          style="
            position: relative;
            z-index: 3;
            display: flex;
            width: 52px;
            height: 52px;
            align-items: center;
            justify-content: center;
            border: 4px solid #ffffff;
            border-radius: 999px;
            background: #166534;
            color: #ffffff;
            box-shadow:
              0 0 0 9px rgba(22, 101, 52, 0.15),
              0 14px 34px rgba(15, 23, 42, 0.30);
          "
        >
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              d="M12 2C8.13 2 5 5.13 5 9c0 5.14 7 13 7 13s7-7.86 7-13c0-3.87-3.13-7-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5Z"
            />
          </svg>
        </span>

        <span
          style="
            position: absolute;
            top: 40px;
            z-index: 2;
            width: 18px;
            height: 18px;
            border-right: 4px solid #ffffff;
            border-bottom: 4px solid #ffffff;
            border-radius: 0 0 5px 0;
            background: #166534;
            transform: rotate(45deg);
          "
        ></span>
      </div>
    `,

  iconSize: [56, 66],

  iconAnchor: [28, 62],
});

function getSafePosition(value: Coordinates | null | undefined): MapPosition {
  const latitude = Number(value?.latitude);

  const longitude = Number(value?.longitude);

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return DEFAULT_POSITION;
  }

  return [latitude, longitude];
}

function MapClickHandler({
  onChange,
}: {
  onChange: (coordinates: Coordinates) => void;
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

function MapPositionController({ position }: { position: MapPosition }) {
  const map = useMap();

  useEffect(() => {
    const currentCenter = map.getCenter();

    const latitudeChanged =
      Math.abs(currentCenter.lat - position[0]) > 0.000001;

    const longitudeChanged =
      Math.abs(currentCenter.lng - position[1]) > 0.000001;

    if (!latitudeChanged && !longitudeChanged) {
      return;
    }

    map.stop();

    map.flyTo(position, Math.max(map.getZoom(), 16), {
      duration: 0.7,
      easeLinearity: 0.25,
    });
  }, [map, position]);

  return null;
}

export default function LocationPickerMap({
  value,
  onChange,
}: LocationPickerMapProps) {
  const position = useMemo<MapPosition>(
    () => getSafePosition(value),
    [value.latitude, value.longitude],
  );

  const handleMarkerDragEnd = (event: LeafletEvent) => {
    const marker = event.target as LeafletMarker;

    const nextPosition = marker.getLatLng();

    onChange({
      latitude: nextPosition.lat,

      longitude: nextPosition.lng,
    });
  };

  return (
    <div className="foodhub-map h-full min-h-[440px] w-full overflow-hidden bg-slate-100">
      <MapContainer
        center={position}
        zoom={16}
        minZoom={5}
        maxZoom={20}
        zoomControl={false}
        scrollWheelZoom
        doubleClickZoom
        touchZoom
        className="h-full min-h-[440px] w-full"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors &copy; CARTO"
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={20}
        />

        <ZoomControl position="bottomright" />

        <MapClickHandler onChange={onChange} />

        <MapPositionController position={position} />

        <Marker
          draggable
          position={position}
          icon={LOCATION_MARKER_ICON}
          eventHandlers={{
            dragend: handleMarkerDragEnd,
          }}
        />
      </MapContainer>
    </div>
  );
}
