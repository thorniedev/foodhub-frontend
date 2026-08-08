"use client";

import dynamic from "next/dynamic";

import { useEffect, useRef, useState, type FormEvent } from "react";

import { createPortal } from "react-dom";

import { AnimatePresence, motion } from "framer-motion";

import {
  IoCheckmarkOutline,
  IoCloseOutline,
  IoLocateOutline,
  IoLocationOutline,
  IoSearchOutline,
} from "react-icons/io5";

import type { Coordinates } from "@/types/location";

const LocationPickerMap = dynamic(() => import("./LocationPickerMap"), {
  ssr: false,

  loading: () => (
    <div className="flex h-full min-h-[440px] items-center justify-center bg-slate-100">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-primary-100 border-t-primary-700" />

        <p className="mt-3 text-[17px] text-slate-500">កំពុងរៀបចំផែនទី...</p>
      </div>
    </div>
  ),
});

export interface PickedMapLocation extends Coordinates {
  label: string | null;
}

interface LocationPickerModalProps {
  open: boolean;

  initialLocation: Coordinates | null;

  detectedLocation: Coordinates | null;

  onClose: () => void;

  onConfirm: (location: PickedMapLocation) => void;
}

interface LocationSearchResult {
  placeId: string;
  label: string;
  latitude: number;
  longitude: number;
  locationType: string | null;
  types: string[];
  partialMatch: boolean;
}

interface LocationSearchResponse {
  query?: string;

  results?: LocationSearchResult[];

  message?: string | null;
}

const DEFAULT_LOCATION: Coordinates = {
  latitude: 11.5564,
  longitude: 104.9282,
};

function isValidCoordinates(
  value: Coordinates | null | undefined,
): value is Coordinates {
  if (!value) {
    return false;
  }

  const latitude = Number(value.latitude);

  const longitude = Number(value.longitude);

  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

function getInitialLocation(
  initialLocation: Coordinates | null,

  detectedLocation: Coordinates | null,
): Coordinates {
  if (isValidCoordinates(initialLocation)) {
    return {
      ...initialLocation,
    };
  }

  if (isValidCoordinates(detectedLocation)) {
    return {
      ...detectedLocation,
    };
  }

  return {
    ...DEFAULT_LOCATION,
  };
}

function getSearchErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "មិនអាចស្វែងរកទីតាំងបានទេ។";
}

export default function LocationPickerModal({
  open,
  initialLocation,
  detectedLocation,
  onClose,
  onConfirm,
}: LocationPickerModalProps) {
  const [mounted, setMounted] = useState(false);

  const [draftLocation, setDraftLocation] =
    useState<Coordinates>(DEFAULT_LOCATION);

  const [draftLabel, setDraftLabel] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");

  const [searchResults, setSearchResults] = useState<LocationSearchResult[]>(
    [],
  );

  const [searchError, setSearchError] = useState<string | null>(null);

  const [searching, setSearching] = useState(false);

  const wasOpenRef = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open && !wasOpenRef.current) {
      setDraftLocation(getInitialLocation(initialLocation, detectedLocation));

      setDraftLabel(null);
      setSearchQuery("");
      setSearchResults([]);
      setSearchError(null);
      setSearching(false);
    }

    wasOpenRef.current = open;
  }, [detectedLocation, initialLocation, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;

      window.removeEventListener("keydown", handleEscape);
    };
  }, [onClose, open]);

  const handleMapChange = (nextLocation: Coordinates) => {
    setDraftLocation(nextLocation);

    /*
     * The user moved the marker after selecting a
     * search result, so the previous address may no
     * longer match the coordinates.
     */
    setDraftLabel(null);
    setSearchResults([]);
  };

  const handleUseCurrentLocation = () => {
    if (!isValidCoordinates(detectedLocation)) {
      return;
    }

    setDraftLocation({
      ...detectedLocation,
    });

    setDraftLabel("ទីតាំង GPS បច្ចុប្បន្នរបស់អ្នក");

    setSearchResults([]);
    setSearchError(null);
  };

  const handleSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedQuery = searchQuery.trim();

    if (normalizedQuery.length < 2) {
      setSearchError("សូមបញ្ចូលយ៉ាងតិច 2 តួអក្សរ។");

      setSearchResults([]);

      return;
    }

    setSearching(true);
    setSearchError(null);
    setSearchResults([]);

    try {
      const response = await fetch("/api/maps/search", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          query: normalizedQuery,
        }),
      });

      const data = (await response.json()) as LocationSearchResponse;

      if (!response.ok) {
        throw new Error(data.message || "មិនអាចស្វែងរកទីតាំងបានទេ។");
      }

      const results = Array.isArray(data.results) ? data.results : [];

      setSearchResults(results);

      if (results.length === 0) {
        setSearchError(
          data.message || "រកមិនឃើញទីតាំងនេះនៅក្នុងប្រទេសកម្ពុជា។",
        );
      }
    } catch (error) {
      setSearchError(getSearchErrorMessage(error));

      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectResult = (result: LocationSearchResult) => {
    const nextLocation: Coordinates = {
      latitude: result.latitude,

      longitude: result.longitude,
    };

    if (!isValidCoordinates(nextLocation)) {
      setSearchError("ទីតាំងនេះមិនមានកូអរដោនេត្រឹមត្រូវទេ។");

      return;
    }

    setDraftLocation(nextLocation);

    setDraftLabel(result.label);

    setSearchQuery(result.label);

    setSearchResults([]);
    setSearchError(null);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setSearchError(null);
  };

  const handleConfirm = () => {
    if (!isValidCoordinates(draftLocation)) {
      return;
    }

    onConfirm({
      latitude: draftLocation.latitude,

      longitude: draftLocation.longitude,

      label: draftLabel || "ទីតាំងដែលបានជ្រើសលើផែនទី",
    });
  };

  if (!mounted) {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="foodhub-location-picker"
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          exit={{
            opacity: 0,
          }}
          transition={{
            duration: 0.2,
          }}
          className="fixed inset-0 z-[1200] flex items-end justify-center bg-slate-950/55 backdrop-blur-sm sm:items-center sm:p-5"
        >
          <button
            type="button"
            aria-label="Close location picker"
            onClick={onClose}
            className="absolute inset-0 cursor-default"
          />

          <motion.section
            role="dialog"
            aria-modal="true"
            aria-label="Choose location on map"
            initial={{
              y: 80,
              opacity: 0,
              scale: 0.98,
            }}
            animate={{
              y: 0,
              opacity: 1,
              scale: 1,
            }}
            exit={{
              y: 80,
              opacity: 0,
              scale: 0.98,
            }}
            transition={{
              type: "spring",
              stiffness: 320,
              damping: 30,
            }}
            className="relative z-10 flex h-[94dvh] w-full max-w-[1120px] flex-col overflow-hidden rounded-t-[30px] bg-white shadow-2xl sm:h-[90dvh] sm:rounded-[30px]"
          >
            <header className="shrink-0 border-b border-slate-100 bg-white px-4 py-4 sm:px-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary-700">
                    <IoLocationOutline className="text-[24px]" />
                  </span>

                  <div className="min-w-0">
                    <p
                      role="heading"
                      aria-level={2}
                      className="text-[22px] font-bold text-primary-900 sm:text-[25px]"
                    >
                      ជ្រើសទីតាំងលើផែនទី
                    </p>

                    <p className="mt-1 text-[17px] leading-7 text-slate-500">
                      ស្វែងរកទីតាំង ឬគោលដៅជុំវិញពិភពលោក ឬចុច
                      និងអូសសញ្ញាសម្គាល់លើផែនទី។
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200"
                >
                  <IoCloseOutline className="text-[25px]" />
                </button>
              </div>
            </header>

            <div className="relative min-h-0 flex-1">
              <LocationPickerMap
                value={draftLocation}
                onChange={handleMapChange}
              />

              {/* Cambodia location search */}
              <div className="absolute left-3 right-3 top-3 z-[650] sm:left-4 sm:right-auto sm:w-[520px]">
                <form
                  onSubmit={handleSearch}
                  className="flex min-h-14 items-center gap-2 rounded-2xl border border-white/90 bg-white/97 p-1.5 shadow-[0_12px_36px_rgba(15,23,42,0.22)] backdrop-blur-md"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center text-slate-500">
                    <IoSearchOutline className="text-[24px]" />
                  </span>

                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(event) => {
                      setSearchQuery(event.target.value);

                      setSearchError(null);

                      if (event.target.value.trim() === "") {
                        setSearchResults([]);
                      }
                    }}
                    placeholder="ស្វែងរកទីតាំង ឬអាសយដ្ឋានជុំវិញពិភពលោក..."
                    aria-label="Search destinations worldwide"
                    className="min-w-0 flex-1 bg-transparent px-1 text-[17px] text-slate-800 outline-none placeholder:text-slate-400"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      aria-label="Clear location search"
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    >
                      <IoCloseOutline className="text-[22px]" />
                    </button>
                  )}

                  <button
                    type="submit"
                    disabled={searching}
                    className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-primary-800 px-4 text-[17px] font-bold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {searching ? "កំពុងស្វែងរក..." : "ស្វែងរក"}
                  </button>
                </form>

                {searchError && (
                  <div
                    role="alert"
                    className="mt-2 rounded-2xl border border-red-100 bg-white/97 px-4 py-3 text-[17px] leading-7 text-red-700 shadow-lg backdrop-blur-md"
                  >
                    {searchError}
                  </div>
                )}

                {searchResults.length > 0 && (
                  <div className="mt-2 space-y-1.5 rounded-2xl border border-slate-200 bg-white/98 p-2 shadow-[0_16px_40px_rgba(15,23,42,0.22)] backdrop-blur-md">
                    {searchResults.map((result, index) => (
                      <button
                        key={
                          result.placeId ||
                          `${result.latitude}-${result.longitude}`
                        }
                        type="button"
                        onClick={() => handleSelectResult(result)}
                        className="flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-primary-50"
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-700">
                          <IoLocationOutline className="text-[22px]" />
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="line-clamp-2 block text-[17px] font-semibold leading-7 text-slate-800">
                            {result.label}
                          </span>

                          <span className="mt-0.5 block text-[17px] text-slate-500">
                            លទ្ធផលទី {index + 1}
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {isValidCoordinates(detectedLocation) && (
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  className="absolute bottom-5 left-4 z-[500] inline-flex min-h-12 items-center gap-2 rounded-2xl border border-white/80 bg-white/95 px-4 text-[17px] font-bold text-primary-800 shadow-lg backdrop-blur-md transition hover:bg-primary-50"
                >
                  <IoLocateOutline className="text-[22px]" />
                  ទៅទីតាំងបច្ចុប្បន្ន
                </button>
              )}
            </div>

            <footer className="shrink-0 border-t border-slate-100 bg-white px-4 py-4 sm:px-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0 rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-[17px] font-medium text-slate-500">
                    ទីតាំងដែលបានជ្រើស
                  </p>

                  {draftLabel && (
                    <p className="mt-1 line-clamp-2 text-[17px] font-semibold leading-7 text-slate-800">
                      {draftLabel}
                    </p>
                  )}

                  <p className="mt-1 break-all text-[17px] font-semibold text-slate-700">
                    {draftLocation.latitude.toFixed(6)},{" "}
                    {draftLocation.longitude.toFixed(6)}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 lg:flex">
                  <button
                    type="button"
                    onClick={onClose}
                    className="min-h-12 rounded-2xl border border-slate-200 bg-white px-5 text-[17px] font-bold text-slate-700 transition hover:bg-slate-50"
                  >
                    បោះបង់
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirm}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-primary-800 px-5 text-[17px] font-bold text-white transition hover:bg-primary-700"
                  >
                    <IoCheckmarkOutline className="text-[22px]" />
                    បញ្ជាក់ទីតាំង
                  </button>
                </div>
              </div>
            </footer>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
