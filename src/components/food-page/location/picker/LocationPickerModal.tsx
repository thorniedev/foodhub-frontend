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
  IoBookmark,
  IoBookmarkOutline,
  IoBriefcaseOutline,
  IoCheckmarkOutline,
  IoCloseOutline,
  IoHomeOutline,
  IoLocateOutline,
  IoLocationOutline,
  IoMapOutline,
  IoSearchOutline,
  IoTrashOutline,
} from "react-icons/io5";

import SavedLocationsManager from "./SavedLocationsManager";
import {
  useGetCurrentUserQuery,
  useGetBackendUserQuery,
} from "@/app/store/auth/currentUserApi";
import {
  useCreateSavedLocationMutation,
  useDeleteSavedLocationMutation,
  useListSavedLocationsQuery,
} from "@/app/store/savedLocationApi";
import type { SavedLocation } from "@/types/saved-location";
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
  initialTab?: "map" | "saved";
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
  coordinates: Coordinates | null,
): coordinates is Coordinates {
  return Boolean(
    coordinates &&
      Number.isFinite(coordinates.latitude) &&
      Number.isFinite(coordinates.longitude),
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
  initialTab = "map",
  onClose,
  onConfirm,
}: LocationPickerModalProps) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"map" | "saved">("map");

  const [draftLocation, setDraftLocation] =
    useState<Coordinates>(DEFAULT_LOCATION);

  const [selectedPlace, setSelectedPlace] =
    useState<LocationSearchResult | null>(null);

  const [draftLabel, setDraftLabel] = useState<string | null>(null);

  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [saveLocationName, setSaveLocationName] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { data: authUser } = useGetCurrentUserQuery();
  const { data: backendUser } = useGetBackendUserQuery();
  const isLoggedIn = Boolean(authUser || backendUser?.id);

  const { data: savedLocations = [], isLoading: isLoadingSaved } =
    useListSavedLocationsQuery(undefined, { skip: !isLoggedIn });

  const [createSavedLocation, { isLoading: isSavingDirect }] =
    useCreateSavedLocationMutation();
  const [deleteSavedLocation] = useDeleteSavedLocationMutation();

  const handleOpenSaveDialog = () => {
    setSaveLocationName(
      selectedPlace?.name || draftLabel || "ទីតាំងរបស់ខ្ញុំ",
    );
    setSaveModalOpen(true);
  };

  const handleDirectSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!saveLocationName.trim()) return;
    try {
      await createSavedLocation({
        label: saveLocationName.trim(),
        addressLine: selectedPlace?.address || draftLabel || null,
        latitude: draftLocation.latitude,
        longitude: draftLocation.longitude,
      }).unwrap();
      setSaveModalOpen(false);
      setToastMessage(`បានរក្សាទុក "${saveLocationName}" ដោយជោគជ័យ! ✅`);
      setTimeout(() => setToastMessage(null), 3500);
    } catch {
      setToastMessage("មិនអាចរក្សាទុកទីតាំងបានទេ។ សូមសាកល្បងម្ដងទៀត។ ❌");
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

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
      setActiveTab(initialTab || "map");
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
  }, [detectedLocation, initialLocation, initialTab, open, resolveLocation]);

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

  const handleSelectSavedLocation = (savedLoc: SavedLocation) => {
    const nextLocation: Coordinates = {
      latitude: savedLoc.latitude,
      longitude: savedLoc.longitude,
    };

    if (!isValidCoordinates(nextLocation)) {
      return;
    }

    setDraftLocation(nextLocation);
    setSelectedPlace(null);
    setDraftLabel(
      savedLoc.label +
        (savedLoc.addressLine ? ` (${savedLoc.addressLine})` : ""),
    );
    setSearchResults([]);
    setSearchError(null);
    setSearching(false);
    void resolveLocation(nextLocation);
  };

  const handleConfirm = () => {
    if (!isValidCoordinates(draftLocation)) {
      return;
    }

    const resolvedLabel =
      selectedPlace?.address ||
      selectedPlace?.name ||
      draftLabel ||
      "ទីតាំងដែលបានជ្រើសលើផែនទី";

    onConfirm({
      latitude: draftLocation.latitude,
      longitude: draftLocation.longitude,
      label: resolvedLabel,
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
          className="fixed inset-0 z-[1200] flex items-end justify-center bg-slate-950/55 backdrop-blur-sm sm:items-center sm:p-5 font-sans"
        >
          <button
            type="button"
            aria-label="Location picker backdrop"
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

            {/* TABS HEADER */}
            <div className="flex border-b border-slate-100 bg-slate-50/70 px-4 sm:px-6">
              <button
                type="button"
                onClick={() => setActiveTab("map")}
                className={`flex items-center gap-2 border-b-2 px-4 py-3 text-[16px] font-bold transition ${
                  activeTab === "map"
                    ? "border-primary-700 text-primary-900"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <IoMapOutline className="text-[20px]" />
                <span>ជ្រើសលើផែនទី <span className="hidden sm:inline">(Map Picker)</span></span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("saved")}
                className={`flex items-center gap-2 border-b-2 px-4 py-3 text-[16px] font-bold transition ${
                  activeTab === "saved"
                    ? "border-primary-700 text-primary-900"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <IoBookmarkOutline className="text-[20px]" />
                <span>ទីតាំងបានរក្សាទុក <span className="hidden sm:inline">(Saved Places)</span></span>
                {savedLocations.length > 0 && (
                  <span className="rounded-full bg-primary-100 px-2 py-0.5 text-[12px] font-bold text-primary-800">
                    {savedLocations.length}
                  </span>
                )}
              </button>
            </div>

            {activeTab === "saved" ? (
              <div className="min-h-0 flex-1 bg-slate-50/40">
                <SavedLocationsManager
                  currentCoordinates={draftLocation}
                  currentAddress={
                    selectedPlace?.address ||
                    selectedPlace?.name ||
                    draftLabel ||
                    null
                  }
                  onSelectLocation={(loc) => {
                    onConfirm({
                      latitude: loc.latitude,
                      longitude: loc.longitude,
                      label: loc.label,
                    });
                  }}
                  onSwitchToMap={() => setActiveTab("map")}
                />
              </div>
            ) : (
              <>
                {/* MAP CONTAINER */}
                <div className="relative min-h-0 flex-1 w-full overflow-hidden">
                  <LocationPickerMap
                    value={draftLocation}
                    selectedPlace={selectedPlace}
                    onChange={handleMapChange}
                  />

                  {/* SEARCH BAR OVERLAY */}
                  <div className="absolute left-3 right-3 top-3 z-[650] sm:left-4 sm:right-auto sm:w-[540px]">
                    <form
                      onSubmit={handleSearchSubmit}
                      className="flex min-h-13 items-center gap-2 rounded-2xl border border-white/90 bg-white/[0.97] p-1.5 shadow-[0_12px_36px_rgba(15,23,42,0.22)] backdrop-blur-md"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center text-slate-500">
                        <IoSearchOutline className="text-[22px]" />
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
                        className="min-w-0 flex-1 bg-transparent px-1 text-[16px] text-slate-800 outline-none placeholder:text-slate-400"
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={handleClearSearch}
                          aria-label="Clear location search"
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                        >
                          <IoCloseOutline className="text-[20px]" />
                        </button>
                      )}

                      <button
                        type="submit"
                        disabled={searching}
                        className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-xl bg-primary-800 px-4 text-[15px] font-bold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        ស្វែងរក
                      </button>
                    </form>

                    {/* AUTOCOMPLETE DROPDOWN */}
                    {showSearchDropdown && (
                      <div
                        className="
                          mt-2
                          max-h-[320px]
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
                          <div className="flex items-center gap-3 px-4 py-3">
                            <span className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-primary-100 border-t-primary-700" />
                            <p className="text-[15px] text-slate-500">
                              កំពុងស្វែងរកទីតាំង...
                            </p>
                          </div>
                        )}

                        {!searching &&
                          searchResults.map((result, index) => {
                            const area = [
                              result.city,
                              result.state,
                              result.country,
                            ]
                              .filter(Boolean)
                              .join(" • ");

                            return (
                              <button
                                key={`${result.id}-${result.latitude}-${result.longitude}-${index}`}
                                type="button"
                                onClick={() => handleSelectResult(result)}
                                className="group flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-primary-50 focus:bg-primary-50 focus:outline-none"
                              >
                                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-700 transition group-hover:bg-white">
                                  <IoLocationOutline className="text-[20px]" />
                                </span>

                                <span className="min-w-0 flex-1">
                                  <span className="block truncate text-[15px] font-bold leading-6 text-slate-900">
                                    {result.name}
                                  </span>
                                  <span className="mt-0.5 line-clamp-1 block text-[13px] leading-5 text-slate-500">
                                    {result.address}
                                  </span>
                                  {area && (
                                    <span className="mt-0.5 block truncate text-[13px] font-semibold text-primary-700">
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
                            <div className="px-4 py-3">
                              <p className="text-[15px] leading-6 text-slate-500">
                                {searchError}
                              </p>
                            </div>
                          )}
                      </div>
                    )}

                    {/* SAVED LOCATIONS QUICK BAR */}
                    {savedLocations.length > 0 && !showSearchDropdown && (
                      <div className="mt-2 flex items-center gap-2 overflow-x-auto rounded-2xl border border-white/90 bg-white/[0.97] p-1.5 shadow-[0_8px_24px_rgba(15,23,42,0.14)] backdrop-blur-md [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        <span className="flex shrink-0 items-center gap-1 px-1 text-[13px] font-bold text-primary-800">
                          <IoBookmark className="text-[15px] text-primary-700" />
                          ទីតាំងរក្សាទុក:
                        </span>
                        {savedLocations.map((loc) => {
                          const isHome = /home|ផ្ទះ/i.test(loc.label);
                          const isWork = /work|office|ការិយាល័យ/i.test(loc.label);
                          return (
                            <button
                              key={loc.uuid}
                              type="button"
                              onClick={() => handleSelectSavedLocation(loc)}
                              className="flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1 text-[13px] font-semibold text-slate-700 shadow-sm transition hover:border-primary-400 hover:bg-primary-50 hover:text-primary-800"
                            >
                              {isHome ? (
                                <IoHomeOutline className="text-[14px] text-primary-700" />
                              ) : isWork ? (
                                <IoBriefcaseOutline className="text-[14px] text-primary-700" />
                              ) : (
                                <IoBookmarkOutline className="text-[14px] text-primary-700" />
                              )}
                              <span>{loc.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* CURRENT GPS BUTTON */}
                  {isValidCoordinates(detectedLocation) && (
                    <button
                      type="button"
                      onClick={handleUseCurrentLocation}
                      className="absolute bottom-[200px] left-3 z-[500] sm:bottom-[170px] sm:left-4 inline-flex min-h-11 items-center gap-2 rounded-2xl border border-white/80 bg-white/[0.97] px-3.5 text-[15px] font-bold text-primary-800 shadow-lg backdrop-blur-md transition hover:bg-primary-50 active:scale-95"
                    >
                      <IoLocateOutline className="text-[20px] text-primary-700" />
                      ទីតាំងបច្ចុប្បន្ន
                    </button>
                  )}

                  {/* FLOATING BOTTOM CONFIRMATION CARD (ALWAYS 100% VISIBLE) */}
                  <div className="absolute bottom-3 left-3 right-3 z-[600] sm:bottom-4 sm:left-4 sm:right-4 max-h-[45vh] overflow-y-auto rounded-2xl border border-slate-200/80 bg-white/[0.98] p-3.5 sm:p-4 shadow-[0_16px_48px_rgba(15,23,42,0.22)] backdrop-blur-md">
                    {/* TOAST MESSAGE */}
                    <AnimatePresence>
                      {toastMessage && (
                        <motion.div
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          className="mb-3 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-[14px] font-bold text-emerald-800"
                        >
                          <span>{toastMessage}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* QUICK SAVE INLINE DIALOG */}
                    <AnimatePresence>
                      {saveModalOpen && (
                        <motion.form
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          onSubmit={handleDirectSave}
                          className="mb-3.5 overflow-hidden rounded-xl border border-amber-200 bg-amber-50/70 p-3"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="flex items-center gap-1 text-[14px] font-bold text-amber-900">
                              <IoBookmark className="text-[16px] text-amber-600" />
                              រក្សាទុកទីតាំងទៅក្នុងបញ្ជី (Save to My Places)
                            </span>
                            <button
                              type="button"
                              onClick={() => setSaveModalOpen(false)}
                              className="text-[18px] text-slate-400 hover:text-slate-700"
                            >
                              ✕
                            </button>
                          </div>

                          <div className="mt-2 flex flex-col sm:flex-row gap-2">
                            <input
                              type="text"
                              required
                              value={saveLocationName}
                              onChange={(e) => setSaveLocationName(e.target.value)}
                              placeholder="បញ្ចូលឈ្មោះទីតាំង (ឧ. ផ្ទះ, ការិយាល័យ, កន្លែងញ៉ាំបាយ...)"
                              className="min-h-10 flex-1 rounded-xl border border-amber-300 bg-white px-3 text-[14px] font-semibold text-slate-800 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                            />
                            <button
                              type="submit"
                              disabled={isSavingDirect}
                              className="flex min-h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-amber-600 px-5 text-[14px] font-bold text-white shadow-sm transition hover:bg-amber-700 disabled:opacity-60"
                            >
                              <IoBookmarkOutline className="text-[16px]" />
                              {isSavingDirect ? "កំពុងរក្សាទុក..." : "រក្សាទុក (Save)"}
                            </button>
                          </div>
                        </motion.form>
                      )}
                    </AnimatePresence>

                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      {/* LOCATION DETAILS */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start gap-2.5">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
                            <IoLocationOutline className="text-[20px]" />
                          </span>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[16px] font-bold text-slate-900">
                              {resolvingPlace
                                ? "កំពុងរកព័ត៌មានអាសយដ្ឋាន..."
                                : selectedPlace?.name ||
                                  draftLabel ||
                                  "ទីតាំងដែលបានជ្រើស"}
                            </p>

                            {(selectedPlace?.address || draftLabel) && (
                              <p className="mt-0.5 line-clamp-1 text-[13px] text-slate-600">
                                {selectedPlace?.address || draftLabel}
                              </p>
                            )}

                            <p className="mt-0.5 text-[12px] font-semibold text-slate-400">
                              {draftLocation.latitude.toFixed(6)},{" "}
                              {draftLocation.longitude.toFixed(6)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* ACTION BUTTONS: Save Button, Confirm Button, Cancel Button */}
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={handleOpenSaveDialog}
                          className="flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-4 text-[14px] font-bold text-amber-900 shadow-sm transition hover:bg-amber-100 active:scale-95"
                        >
                          <IoBookmarkOutline className="text-[18px] text-amber-700" />
                          <span>រក្សាទុកទីតាំង<span className="hidden sm:inline"> (Save Location)</span></span>
                        </button>

                        <button
                          type="button"
                          onClick={onClose}
                          className="min-h-11 rounded-xl border border-slate-200 bg-white px-3.5 text-[14px] font-bold text-slate-700 transition hover:bg-slate-50"
                        >
                          បោះបង់
                        </button>

                        <button
                          type="button"
                          onClick={() => void handleConfirm()}
                          className="flex min-h-11 flex-1 sm:flex-initial items-center justify-center gap-2 rounded-xl bg-primary-800 px-5 text-[14px] font-bold text-white shadow-md transition hover:bg-primary-700 active:scale-98"
                        >
                          <IoCheckmarkOutline className="text-[20px]" />
                          <span>បញ្ជាក់ទីតាំង <span className="hidden sm:inline">(Choose Place)</span></span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
