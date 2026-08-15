"use client";

import { useEffect, useSyncExternalStore } from "react";

import type { Coordinates, LocationPermissionStatus } from "@/types/location";

export type LocationSelectionSource =
  | "live"
  | "saved"
  | "manual"
  | "saved-manual"
  | "fallback";

export interface SelectedLocation extends Coordinates {
  label: string | null;
  selectedAt: number;
}

export interface SelectManualLocationInput extends Coordinates {
  label?: string | null;
}

type LocationSnapshot = {
  /**
   * Active location used by FoodHub.
   *
   * Manual location has priority over GPS.
   */
  coordinates: Coordinates | null;

  /**
   * Latest location detected from browser GPS,
   * or restored from the GPS storage key.
   */
  detectedCoordinates: Coordinates | null;

  /**
   * Location chosen and confirmed by the user.
   */
  selectedLocation: SelectedLocation | null;

  source: LocationSelectionSource;

  status: LocationPermissionStatus;

  error: string | null;
};

export type UseUserLocationResult = LocationSnapshot & {
  refreshLocation: () => void;

  selectManualLocation: (location: SelectManualLocationInput) => void;

  useCurrentLocation: () => void;
};

const GPS_LOCATION_STORAGE_KEY = "foodhub-current-location";

const MANUAL_LOCATION_STORAGE_KEY = "foodhub-selected-location";

const SERVER_SNAPSHOT: LocationSnapshot = {
  coordinates: null,
  detectedCoordinates: null,
  selectedLocation: null,
  source: "fallback",
  status: "idle",
  error: null,
};

let detectedCoordinates: Coordinates | null = null;

let selectedLocation: SelectedLocation | null = null;

let detectedSource: "live" | "saved" | "fallback" = "fallback";

let manualSource: "manual" | "saved-manual" = "saved-manual";

let locationStatus: LocationPermissionStatus = "idle";

let locationError: string | null = null;

let snapshot: LocationSnapshot = SERVER_SNAPSHOT;

let trackingStarted = false;
let storedLocationsLoaded = false;

let watchId: number | null = null;

const listeners = new Set<() => void>();

function emit(): void {
  const activeCoordinates = selectedLocation ?? detectedCoordinates;

  let source: LocationSelectionSource = "fallback";

  if (selectedLocation) {
    source = manualSource;
  } else if (detectedCoordinates) {
    source = detectedSource;
  }

  snapshot = {
    coordinates: activeCoordinates,
    detectedCoordinates,
    selectedLocation,
    source,
    status: locationStatus,
    error: locationError,
  };

  listeners.forEach((listener) => {
    listener();
  });
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): LocationSnapshot {
  return snapshot;
}

function getServerSnapshot(): LocationSnapshot {
  return SERVER_SNAPSHOT;
}

function isValidCoordinates(value: unknown): value is Coordinates {
  if (!value || typeof value !== "object") {
    return false;
  }

  const coordinates = value as Partial<Coordinates>;

  return (
    typeof coordinates.latitude === "number" &&
    Number.isFinite(coordinates.latitude) &&
    coordinates.latitude >= -90 &&
    coordinates.latitude <= 90 &&
    typeof coordinates.longitude === "number" &&
    Number.isFinite(coordinates.longitude) &&
    coordinates.longitude >= -180 &&
    coordinates.longitude <= 180
  );
}

function normalizeSelectedLocation(value: unknown): SelectedLocation | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  // Validate coordinates first using the original unknown value.
  if (!isValidCoordinates(value)) {
    return null;
  }

  // After coordinate validation, treat the stored object
  // as a partial SelectedLocation so label/selectedAt are accessible.
  const candidate = value as Partial<SelectedLocation> & Coordinates;

  return {
    latitude: candidate.latitude,
    longitude: candidate.longitude,

    ...(typeof candidate.accuracy === "number" &&
    Number.isFinite(candidate.accuracy)
      ? {
          accuracy: candidate.accuracy,
        }
      : {}),

    label:
      typeof candidate.label === "string" && candidate.label.trim()
        ? candidate.label.trim()
        : null,

    selectedAt:
      typeof candidate.selectedAt === "number" &&
      Number.isFinite(candidate.selectedAt)
        ? candidate.selectedAt
        : Date.now(),
  };
}

function saveGpsCoordinates(coordinates: Coordinates): void {
  try {
    window.localStorage.setItem(
      GPS_LOCATION_STORAGE_KEY,
      JSON.stringify(coordinates),
    );
  } catch {
    // GPS still works without localStorage.
  }
}

function saveManualLocation(location: SelectedLocation): void {
  try {
    window.localStorage.setItem(
      MANUAL_LOCATION_STORAGE_KEY,
      JSON.stringify(location),
    );
  } catch {
    // Manual selection still works for this session.
  }
}

function removeManualLocation(): void {
  try {
    window.localStorage.removeItem(MANUAL_LOCATION_STORAGE_KEY);
  } catch {
    // Ignore storage cleanup errors.
  }
}

function loadGpsCoordinates(): Coordinates | null {
  try {
    const savedValue = window.localStorage.getItem(GPS_LOCATION_STORAGE_KEY);

    if (!savedValue) {
      return null;
    }

    const parsed: unknown = JSON.parse(savedValue);

    if (isValidCoordinates(parsed)) {
      return parsed;
    }

    window.localStorage.removeItem(GPS_LOCATION_STORAGE_KEY);
  } catch {
    try {
      window.localStorage.removeItem(GPS_LOCATION_STORAGE_KEY);
    } catch {
      // Ignore cleanup errors.
    }
  }

  return null;
}

function loadManualLocation(): SelectedLocation | null {
  try {
    const savedValue = window.localStorage.getItem(MANUAL_LOCATION_STORAGE_KEY);

    if (!savedValue) {
      return null;
    }

    const parsed: unknown = JSON.parse(savedValue);

    const normalizedLocation = normalizeSelectedLocation(parsed);

    if (normalizedLocation) {
      return normalizedLocation;
    }

    window.localStorage.removeItem(MANUAL_LOCATION_STORAGE_KEY);
  } catch {
    try {
      window.localStorage.removeItem(MANUAL_LOCATION_STORAGE_KEY);
    } catch {
      // Ignore cleanup errors.
    }
  }

  return null;
}

function loadStoredLocations(): void {
  if (typeof window === "undefined" || storedLocationsLoaded) {
    return;
  }

  storedLocationsLoaded = true;

  const savedGpsCoordinates = loadGpsCoordinates();

  if (savedGpsCoordinates) {
    detectedCoordinates = savedGpsCoordinates;

    detectedSource = "saved";
  }

  const savedManualLocation = loadManualLocation();

  if (savedManualLocation) {
    selectedLocation = savedManualLocation;

    manualSource = "saved-manual";
  }

  emit();
}

function handleSuccess(position: GeolocationPosition): void {
  const coordinates: Coordinates = {
    latitude: position.coords.latitude,

    longitude: position.coords.longitude,

    accuracy: position.coords.accuracy,
  };

  if (!isValidCoordinates(coordinates)) {
    locationStatus = "unavailable";

    locationError = "ទីតាំងដែលកម្មវិធីរុករកផ្ដល់មកមិនត្រឹមត្រូវ។";

    emit();

    return;
  }

  detectedCoordinates = coordinates;

  detectedSource = "live";

  locationStatus = "granted";

  locationError = null;

  saveGpsCoordinates(coordinates);

  /*
   * When a manual location is active, it remains
   * the active FoodHub location. GPS is only updated
   * in the background.
   */
  emit();
}

function getGeolocationErrorMessage(
  geolocationError: GeolocationPositionError,
): string {
  switch (geolocationError.code) {
    case geolocationError.PERMISSION_DENIED:
      return "ការអនុញ្ញាតប្រើទីតាំងត្រូវបានបដិសេធ។";

    case geolocationError.POSITION_UNAVAILABLE:
      return "មិនអាចរកឃើញទីតាំងបច្ចុប្បន្នរបស់អ្នកបានទេ។";

    case geolocationError.TIMEOUT:
      return "ការស្វែងរកទីតាំងចំណាយពេលយូរពេក។ សូមព្យាយាមម្តងទៀត។";

    default:
      return "FoodHub មិនអាចចូលប្រើទីតាំងរបស់អ្នកបានទេ។";
  }
}

function handleError(geolocationError: GeolocationPositionError): void {
  /*
   * Restore a saved GPS location when there is no
   * detected position available in memory.
   */
  if (!detectedCoordinates) {
    const savedCoordinates = loadGpsCoordinates();

    if (savedCoordinates) {
      detectedCoordinates = savedCoordinates;

      detectedSource = "saved";
    }
  }

  if (geolocationError.code === geolocationError.PERMISSION_DENIED) {
    if (
      typeof window !== "undefined" &&
      navigator.geolocation &&
      watchId !== null
    ) {
      navigator.geolocation.clearWatch(watchId);

      watchId = null;
    }

    locationStatus = "denied";
  } else {
    locationStatus = "unavailable";
  }

  locationError = getGeolocationErrorMessage(geolocationError);

  /*
   * A manually selected or saved location remains
   * usable even when live GPS fails.
   */
  emit();
}

export function startUserLocationTracking(): void {
  if (typeof window === "undefined") {
    return;
  }

  loadStoredLocations();

  if (trackingStarted) {
    return;
  }

  trackingStarted = true;

  if (!navigator.geolocation) {
    locationStatus = "unsupported";

    locationError = "កម្មវិធីរុករកនេះមិនគាំទ្រសេវាទីតាំងទេ។";

    emit();

    return;
  }

  locationStatus = "requesting";

  locationError = null;

  /*
   * Keep any saved GPS or selected manual
   * coordinates visible while requesting GPS.
   */
  emit();

  navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
    enableHighAccuracy: true,
    timeout: 12_000,
    maximumAge: 60_000,
  });

  watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, {
    enableHighAccuracy: true,
    timeout: 15_000,
    maximumAge: 15_000,
  });
}

export function stopUserLocationTracking(): void {
  if (
    typeof window !== "undefined" &&
    navigator.geolocation &&
    watchId !== null
  ) {
    navigator.geolocation.clearWatch(watchId);
  }

  watchId = null;
  trackingStarted = false;
}

export function refreshUserLocation(): void {
  stopUserLocationTracking();
  startUserLocationTracking();
}

export function selectManualLocation(input: SelectManualLocationInput): void {
  if (!isValidCoordinates(input)) {
    locationError = "ទីតាំងដែលបានជ្រើសមិនត្រឹមត្រូវ។";

    emit();

    return;
  }

  const nextLocation: SelectedLocation = {
    latitude: input.latitude,
    longitude: input.longitude,

    ...(typeof input.accuracy === "number" && Number.isFinite(input.accuracy)
      ? {
          accuracy: input.accuracy,
        }
      : {}),

    label:
      typeof input.label === "string" && input.label.trim()
        ? input.label.trim()
        : "ទីតាំងដែលបានជ្រើសលើផែនទី",

    selectedAt: Date.now(),
  };

  selectedLocation = nextLocation;

  manualSource = "manual";

  locationError = null;

  saveManualLocation(nextLocation);

  emit();
}

export function switchToCurrentLocation(): void {
  selectedLocation = null;

  removeManualLocation();

  /*
   * Immediately switch back to the latest GPS
   * coordinate before requesting a fresher position.
   */
  emit();

  refreshUserLocation();
}

export function useUserLocation(): UseUserLocationResult {
  const currentSnapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  useEffect(() => {
    startUserLocationTracking();
  }, []);

  return {
    ...currentSnapshot,

    refreshLocation: refreshUserLocation,

    selectManualLocation,

    useCurrentLocation: switchToCurrentLocation,
  };
}
