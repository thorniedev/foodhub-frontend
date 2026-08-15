"use client";

import { useState } from "react";
import { FaMapMarkerAlt, FaDirections } from "react-icons/fa";

type Props = {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
};

/** Sticky "where is this store" panel.
 *  Uses Google Maps' key-less `output=embed` URL — no billing/API key
 *  needed, unlike the JS Maps SDK. Good enough for a read-only pin;
 *  swap for @vis.gl/react-google-maps if the project later needs
 *  interactive markers, clustering, etc. */
export default function RestaurantLocationMap({
  name,
  address,
  latitude,
  longitude,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const embedSrc = `https://www.google.com/maps?q=${latitude},${longitude}&hl=km&z=16&output=embed`;
  const directionsHref = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;

  return (
    <div className="w-full">
      {/* Mobile toggle so the map doesn't eat the viewport by default */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="mb-3 flex w-full items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-primary-800 dark:text-primary-dark lg:hidden cursor-pointer"
      >
        <span className="flex items-center gap-2">
          <FaMapMarkerAlt />
          {expanded ? "លាក់ទីតាំងហាង" : "មើលទីតាំងហាង"}
        </span>
        <span className="text-gray-400">{address}</span>
      </button>

      <div
        className={`overflow-hidden rounded-3xl border border-gray-100 shadow-sm ${
          expanded ? "block" : "hidden"
        } lg:block`}
      >
        {/* height image map*/}
        <div className="relative h-64 w-full lg:h-[670px]">
          <iframe
            title={`ទីតាំង ${name} នៅលើ Google Maps`}
            src={embedSrc}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-full w-full border-0"
          />
        </div>

        <div className="flex items-start justify-between gap-3 bg-white p-4">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-primary-900">
              {name}
            </p>
            <p className="line-clamp-2 text-xs text-gray-500">{address}</p>
          </div>
          <a
            href={directionsHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex shrink-0 items-center gap-1.5 rounded-full bg-primary-800 px-3.5 py-2 text-xs font-semibold text-white hover:bg-primary-700 transition"
          >
            <FaDirections />
            ទិសដៅ
          </a>
        </div>
      </div>
    </div>
  );
}
