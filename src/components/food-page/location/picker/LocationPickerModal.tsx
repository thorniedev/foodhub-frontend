"use client";

import dynamic from "next/dynamic";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";

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

import type {
  LocationReverseResponse,
  LocationSearchResponse,
  LocationSearchResult,
} from "@/types/location-search";

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
      latitude: initialLocation.latitude,

      longitude: initialLocation.longitude,
    };
  }

  if (isValidCoordinates(detectedLocation)) {
    return {
      latitude: detectedLocation.latitude,

      longitude: detectedLocation.longitude,
    };
  }

  return {
    ...DEFAULT_LOCATION,
  };
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "មិនអាចដំណើរការទីតាំងបានទេ។";
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

function getPlaceArea(place: LocationSearchResult | null): string {
  if (!place) {
    return "";
  }

  return [place.city, place.state, place.country].filter(Boolean).join(" • ");
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

  const [selectedPlace, setSelectedPlace] =
    useState<LocationSearchResult | null>(null);

  const [draftLabel, setDraftLabel] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");

  const [searchResults, setSearchResults] = useState<LocationSearchResult[]>(
    [],
  );

  const [searchError, setSearchError] = useState<string | null>(null);

  const [searching, setSearching] = useState(false);

  const [resolvingPlace, setResolvingPlace] = useState(false);

  const wasOpenRef = useRef(false);

  const searchRequestRef = useRef<AbortController | null>(null);

  const reverseRequestRef = useRef<AbortController | null>(null);

  /*
   * When the user selects one
   * autocomplete result, we put
   * its name into the input.
   *
   * Without this flag that update
   * would trigger another search.
   */
  const skipNextSearchRef = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  /*
   * ---------------------------------
   * REVERSE GEOCODING
   * ---------------------------------
   *
   * Coordinates
   *       ↓
   * /api/maps/reverse
   *       ↓
   * name + address + city + country
   */
  const resolveLocation = useCallback(async (location: Coordinates) => {
    if (!isValidCoordinates(location)) {
      return;
    }

    reverseRequestRef.current?.abort();

    const controller = new AbortController();

    reverseRequestRef.current = controller;

    setResolvingPlace(true);

    /*
     * Always keep a coordinate label.
     * Reverse geocoding is enrichment,
     * not a requirement for selecting
     * a valid map point.
     */
    const coordinateLabel = `${Number(location.latitude).toFixed(6)}, ${Number(
      location.longitude,
    ).toFixed(6)}`;

    try {
      const params = new URLSearchParams({
        lat: String(location.latitude),

        /*
         * Internal FoodHub API accepts
         * lng and converts it to Geoapify's
         * required `lon` parameter.
         */
        lng: String(location.longitude),
      });

      const response = await fetch(`/api/maps/reverse?${params.toString()}`, {
        method: "GET",

        headers: {
          Accept: "application/json",
        },

        signal: controller.signal,

        cache: "no-store",
      });

      let data: LocationReverseResponse | null = null;

      try {
        data = (await response.json()) as LocationReverseResponse;
      } catch {
        /*
         * Keep the selected point even
         * if the server response cannot
         * be parsed.
         */
      }

      if (reverseRequestRef.current !== controller) {
        return;
      }

      if (!response.ok) {
        console.warn("[LOCATION REVERSE LOOKUP FAILED]", {
          status: response.status,

          message: data?.message ?? response.statusText,

          location,
        });

        setSelectedPlace(null);

        setDraftLabel(coordinateLabel);

        return;
      }

      if (data?.place) {
        setSelectedPlace(data.place);

        setDraftLabel(data.place.address || data.place.name || coordinateLabel);

        return;
      }

      /*
       * Valid coordinates but the
       * geocoder did not find an address.
       */
      setSelectedPlace(null);

      setDraftLabel(coordinateLabel);
    } catch (error) {
      if (isAbortError(error)) {
        return;
      }

      console.warn("[LOCATION REVERSE LOOKUP NETWORK ERROR]", error);

      if (reverseRequestRef.current === controller) {
        setSelectedPlace(null);

        /*
         * Do NOT erase the user's point.
         */
        setDraftLabel(coordinateLabel);
      }
    } finally {
      if (reverseRequestRef.current === controller) {
        reverseRequestRef.current = null;

        setResolvingPlace(false);
      }
    }
  }, []);

  /*
   * ---------------------------------
   * AUTOCOMPLETE SEARCH
   * ---------------------------------
   */
  const searchLocations = useCallback(
    async (query: string) => {
      const normalizedQuery = query.trim();

      if (normalizedQuery.length < 2) {
        setSearchResults([]);

        setSearchError(null);

        setSearching(false);

        return;
      }

      /*
       * Cancel the previous
       * autocomplete request.
       */
      searchRequestRef.current?.abort();

      const controller = new AbortController();

      searchRequestRef.current = controller;

      setSearching(true);

      setSearchError(null);

      try {
        const params = new URLSearchParams({
          q: normalizedQuery,
        });

        /*
         * Nearby results receive
         * preference but search
         * remains GLOBAL.
         */
        if (isValidCoordinates(detectedLocation)) {
          params.set("lat", String(detectedLocation.latitude));

          params.set("lng", String(detectedLocation.longitude));
        }

        const response = await fetch(`/api/maps/search?${params.toString()}`, {
          method: "GET",

          signal: controller.signal,
        });

        const data = (await response.json()) as LocationSearchResponse;

        if (!response.ok) {
          throw new Error(data.message || "មិនអាចស្វែងរកទីតាំងបានទេ។");
        }

        if (searchRequestRef.current !== controller) {
          return;
        }

        const results = Array.isArray(data.results) ? data.results : [];

        setSearchResults(results);

        if (results.length === 0) {
          setSearchError(
            data.message || "រកមិនឃើញទីតាំងដែលត្រូវនឹងការស្វែងរក។",
          );
        }
      } catch (error) {
        if (isAbortError(error)) {
          return;
        }

        console.error("[LOCATION AUTOCOMPLETE]", error);

        if (searchRequestRef.current === controller) {
          setSearchResults([]);

          setSearchError(getErrorMessage(error));
        }
      } finally {
        if (searchRequestRef.current === controller) {
          searchRequestRef.current = null;

          setSearching(false);
        }
      }
    },
    [detectedLocation?.latitude, detectedLocation?.longitude],
  );

  /*
   * ---------------------------------
   * RESET WHEN MODAL OPENS
   * ---------------------------------
   */
  useEffect(() => {
    if (open && !wasOpenRef.current) {
      const location = getInitialLocation(initialLocation, detectedLocation);

      setDraftLocation(location);

      setSelectedPlace(null);

      setDraftLabel(null);

      setSearchQuery("");

      setSearchResults([]);

      setSearchError(null);

      setSearching(false);

      /*
       * Also load the address
       * for the initial map point.
       */
      void resolveLocation(location);
    }

    wasOpenRef.current = open;
  }, [detectedLocation, initialLocation, open, resolveLocation]);

  /*
   * ---------------------------------
   * LIVE SEARCH WHILE TYPING
   * ---------------------------------
   *
   * User:
   * "p"
   * "ph"
   * "phn"
   * "phno"
   *
   * Wait 300ms after they stop:
   * call autocomplete.
   */
  useEffect(() => {
    if (!open) {
      return;
    }

    if (skipNextSearchRef.current) {
      skipNextSearchRef.current = false;

      return;
    }

    const query = searchQuery.trim();

    if (query.length < 2) {
      searchRequestRef.current?.abort();

      setSearchResults([]);

      setSearchError(null);

      setSearching(false);

      return;
    }

    const timeout = window.setTimeout(() => {
      void searchLocations(query);
    }, 300);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [open, searchLocations, searchQuery]);

  /*
   * Lock page behind modal.
   */
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

  /*
   * Cancel network requests
   * when modal closes.
   */
  useEffect(() => {
    if (open) {
      return;
    }

    searchRequestRef.current?.abort();

    reverseRequestRef.current?.abort();

    setSearching(false);

    setResolvingPlace(false);
  }, [open]);

  /*
   * Cancel requests if component
   * unmounts.
   */
  useEffect(() => {
    return () => {
      searchRequestRef.current?.abort();

      reverseRequestRef.current?.abort();
    };
  }, []);

  /*
   * ---------------------------------
   * MAP CLICK / DRAG
   * ---------------------------------
   */
  const handleMapChange = (nextLocation: Coordinates) => {
    if (!isValidCoordinates(nextLocation)) {
      return;
    }

    setDraftLocation(nextLocation);

    /*
     * Old address no longer
     * matches new coordinates.
     */
    setSelectedPlace(null);

    setDraftLabel(null);

    setSearchResults([]);

    setSearchError(null);

    /*
     * Get information for the
     * location that user clicked.
     */
    void resolveLocation(nextLocation);
  };

  /*
   * ---------------------------------
   * CURRENT GPS
   * ---------------------------------
   */
  const handleUseCurrentLocation = () => {
    if (!isValidCoordinates(detectedLocation)) {
      return;
    }

    const nextLocation: Coordinates = {
      latitude: detectedLocation.latitude,

      longitude: detectedLocation.longitude,
    };

    setDraftLocation(nextLocation);

    setSelectedPlace(null);

    setDraftLabel("ទីតាំង GPS បច្ចុប្បន្នរបស់អ្នក");

    setSearchResults([]);

    setSearchError(null);

    void resolveLocation(nextLocation);
  };

  /*
   * Search button still works too.
   */
  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const query = searchQuery.trim();

    if (query.length < 2) {
      setSearchError("សូមបញ្ចូលយ៉ាងតិច 2 តួអក្សរ។");

      setSearchResults([]);

      return;
    }

    void searchLocations(query);
  };

  /*
   * ---------------------------------
   * USER SELECTS AUTOCOMPLETE RESULT
   * ---------------------------------
   */
  const handleSelectResult = (result: LocationSearchResult) => {
    const nextLocation: Coordinates = {
      latitude: result.latitude,

      longitude: result.longitude,
    };

    if (!isValidCoordinates(nextLocation)) {
      setSearchError("ទីតាំងនេះមិនមានកូអរដោនេត្រឹមត្រូវទេ។");

      return;
    }

    searchRequestRef.current?.abort();

    /*
     * Prevent result.name from
     * triggering another autocomplete.
     */
    skipNextSearchRef.current = true;

    /*
     * This changes map coordinates.
     * LocationPickerMap sees the new
     * value and automatically flyTo().
     */
    setDraftLocation(nextLocation);

    /*
     * Save complete place details.
     */
    setSelectedPlace(result);

    setDraftLabel(result.address || result.name);

    /*
     * Put selected place name
     * inside search input.
     */
    setSearchQuery(result.name);

    /*
     * Close suggestions.
     */
    setSearchResults([]);

    setSearchError(null);

    setSearching(false);
  };

  const handleClearSearch = () => {
    searchRequestRef.current?.abort();

    setSearchQuery("");

    setSearchResults([]);

    setSearchError(null);

    setSearching(false);
  };

  const handleConfirm = () => {
    if (!isValidCoordinates(draftLocation)) {
      return;
    }

    onConfirm({
      latitude: draftLocation.latitude,

      longitude: draftLocation.longitude,

      label:
        selectedPlace?.address ||
        selectedPlace?.name ||
        draftLabel ||
        "ទីតាំងដែលបានជ្រើសលើផែនទី",
    });
  };

  if (!mounted) {
    return null;
  }

  const placeArea = getPlaceArea(selectedPlace);

  const showSearchDropdown =
    searchQuery.trim().length >= 2 &&
    (searching || searchResults.length > 0 || Boolean(searchError));

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
            {/* HEADER */}

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
                      ស្វែងរកទីក្រុង ហាង អាសយដ្ឋាន
                      និងទីតាំងតូចៗនៅក្នុងប្រទេសកម្ពុជា ជាភាសាខ្មែរ ឬអង់គ្លេស។
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

            {/* MAP */}

            <div className="relative min-h-0 flex-1">
              <LocationPickerMap
                value={draftLocation}
                selectedPlace={selectedPlace}
                onChange={handleMapChange}
              />

              {/* SEARCH */}

              <div className="absolute left-3 right-3 top-3 z-[650] sm:left-4 sm:right-auto sm:w-[590px]">
                <form
                  onSubmit={handleSearchSubmit}
                  className="flex min-h-14 items-center gap-2 rounded-2xl border border-white/90 bg-white/[0.97] p-1.5 shadow-[0_12px_36px_rgba(15,23,42,0.22)] backdrop-blur-md"
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
                    }}
                    autoComplete="off"
                    placeholder="ស្វែងរកនៅកម្ពុជា / Search in Cambodia..."
                    aria-label="Search location"
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
                    ស្វែងរក
                  </button>
                </form>

                {/* AUTOCOMPLETE DROPDOWN */}

                {showSearchDropdown && (
                  <div
                    className="
                      mt-2
                      max-h-[390px]
                      overflow-y-auto
                      rounded-2xl
                      border
                      border-slate-200
                      bg-white/[0.98]
                      p-2
                      shadow-[0_16px_40px_rgba(15,23,42,0.24)]
                      backdrop-blur-md

                      [scrollbar-width:none]
                      [&::-webkit-scrollbar]:hidden
                    "
                  >
                    {searching && (
                      <div className="flex items-center gap-3 px-4 py-4">
                        <span className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-primary-100 border-t-primary-700" />

                        <p className="text-[17px] text-slate-500">
                          កំពុងស្វែងរកទីតាំង...
                        </p>
                      </div>
                    )}

                    {!searching &&
                      searchResults.map((result, index) => {
                        const area = [result.city, result.state, result.country]
                          .filter(Boolean)
                          .join(" • ");

                        return (
                          <button
                            key={`${result.id}-${result.latitude}-${result.longitude}-${index}`}
                            type="button"
                            onClick={() => handleSelectResult(result)}
                            className="group flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-primary-50 focus:bg-primary-50 focus:outline-none"
                          >
                            <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-700 transition group-hover:bg-white">
                              <IoLocationOutline className="text-[23px]" />
                            </span>

                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-[17px] font-bold leading-7 text-slate-900">
                                {result.name}
                              </span>

                              <span className="mt-0.5 line-clamp-2 block text-[15px] leading-6 text-slate-500">
                                {result.address}
                              </span>

                              {area && (
                                <span className="mt-1 block truncate text-[14px] font-semibold text-primary-700">
                                  {area}
                                </span>
                              )}
                            </span>
                          </button>
                        );
                      })}

                    {!searching &&
                      searchResults.length === 0 &&
                      searchError && (
                        <div className="px-4 py-4">
                          <p className="text-[17px] leading-7 text-slate-500">
                            {searchError}
                          </p>
                        </div>
                      )}
                  </div>
                )}
              </div>

              {/* CURRENT GPS BUTTON */}

              {isValidCoordinates(detectedLocation) && (
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  className="absolute bottom-5 left-4 z-[500] inline-flex min-h-12 items-center gap-2 rounded-2xl border border-white/80 bg-white/[0.95] px-4 text-[17px] font-bold text-primary-800 dark:text-primary-dark shadow-lg backdrop-blur-md transition hover:bg-primary-50"
                >
                  <IoLocateOutline className="text-[22px]" />
                  ទៅទីតាំងបច្ចុប្បន្ន
                </button>
              )}
            </div>

            {/* FOOTER */}

            <footer className="shrink-0 border-t border-slate-100 bg-white px-4 py-4 sm:px-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0 flex-1">
                  {resolvingPlace ? (
                    <div className="flex min-h-[92px] items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                      <span className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-primary-100 border-t-primary-700" />

                      <p className="text-[17px] text-slate-500">
                        កំពុងរកព័ត៌មានអាសយដ្ឋាន...
                      </p>
                    </div>
                  ) : selectedPlace ? (
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                      <div className="flex items-start gap-3">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-700">
                          <IoLocationOutline className="text-[23px]" />
                        </span>

                        <div className="min-w-0 flex-1">
                          <p className="text-[15px] font-medium text-slate-500">
                            ទីតាំងដែលបានជ្រើស
                          </p>

                          <p
                            role="heading"
                            aria-level={3}
                            className="mt-0.5 text-[18px] font-bold leading-7 text-slate-900"
                          >
                            {selectedPlace.name}
                          </p>

                          <p className="mt-0.5 line-clamp-2 text-[16px] leading-6 text-slate-600">
                            {selectedPlace.address}
                          </p>

                          {placeArea && (
                            <p className="mt-1 text-[15px] font-semibold text-primary-700">
                              {placeArea}
                            </p>
                          )}

                          {selectedPlace.postcode && (
                            <p className="mt-1 text-[15px] text-slate-500">
                              លេខប្រៃសណីយ៍: {selectedPlace.postcode}
                            </p>
                          )}

                          <p className="mt-1 break-all text-[15px] font-semibold text-slate-500">
                            {draftLocation.latitude.toFixed(6)},
                            {draftLocation.longitude.toFixed(6)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl bg-slate-50 px-4 py-3">
                      <p className="text-[17px] font-medium text-slate-500">
                        ទីតាំងដែលបានជ្រើស
                      </p>

                      {draftLabel && (
                        <p className="mt-1 line-clamp-2 text-[17px] font-semibold leading-7 text-slate-800">
                          {draftLabel}
                        </p>
                      )}

                      <p className="mt-1 break-all text-[17px] font-semibold text-slate-700">
                        {draftLocation.latitude.toFixed(6)},
                        {draftLocation.longitude.toFixed(6)}
                      </p>
                    </div>
                  )}
                </div>

                {/* ACTIONS */}

                <div className="grid shrink-0 grid-cols-2 gap-3 lg:flex">
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
