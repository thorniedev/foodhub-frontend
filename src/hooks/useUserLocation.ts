"use client";

import { useEffect, useSyncExternalStore } from "react";

import type { Coordinates, LocationPermissionStatus } from "@/types/location";

type LocationSnapshot = {
  coordinates: Coordinates | null;
  status: LocationPermissionStatus;
  error: string | null;
};

export type UseUserLocationResult = LocationSnapshot & {
  refreshLocation: () => void;
};

const STORAGE_KEY = "foodhub-current-location";

const SERVER_SNAPSHOT: LocationSnapshot = {
  coordinates: null,
  status: "idle",
  error: null,
};

let snapshot: LocationSnapshot = SERVER_SNAPSHOT;
let trackingStarted = false;
let watchId: number | null = null;

const listeners = new Set<() => void>();

function emit(nextSnapshot: LocationSnapshot): void {
  snapshot = nextSnapshot;

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

function saveCoordinates(coordinates: Coordinates): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(coordinates));
  } catch {
    // Live location can still work without localStorage.
  }
}

function loadSavedCoordinates(): Coordinates | null {
  try {
    const savedValue = window.localStorage.getItem(STORAGE_KEY);

    if (!savedValue) {
      return null;
    }

    const parsed: unknown = JSON.parse(savedValue);

    if (isValidCoordinates(parsed)) {
      return parsed;
    }

    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage cleanup errors.
    }
  }

  return null;
}

function handleSuccess(position: GeolocationPosition): void {
  const coordinates: Coordinates = {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    accuracy: position.coords.accuracy,
  };

  saveCoordinates(coordinates);

  emit({
    coordinates,
    status: "granted",
    error: null,
  });
}

function handleError(geolocationError: GeolocationPositionError): void {
  const savedCoordinates = loadSavedCoordinates();

  switch (geolocationError.code) {
    case geolocationError.PERMISSION_DENIED: {
      if (
        typeof window !== "undefined" &&
        navigator.geolocation &&
        watchId !== null
      ) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
      }

      emit({
        coordinates: savedCoordinates,
        status: "denied",
        error:
          "ការអនុញ្ញាតប្រើទីតាំងត្រូវបានបដិសេធ។ FoodHub កំពុងប្រើទីតាំងដែលបានរក្សាទុក។",
      });

      break;
    }

    case geolocationError.POSITION_UNAVAILABLE: {
      emit({
        coordinates: savedCoordinates,
        status: "unavailable",
        error: "មិនអាចរកឃើញទីតាំងបច្ចុប្បន្នរបស់អ្នកបានទេ។",
      });

      break;
    }

    case geolocationError.TIMEOUT: {
      emit({
        coordinates: savedCoordinates,
        status: "unavailable",
        error: "ការស្វែងរកទីតាំងចំណាយពេលយូរពេក។ សូមព្យាយាមម្តងទៀត។",
      });

      break;
    }

    default: {
      emit({
        coordinates: savedCoordinates,
        status: "unavailable",
        error: "FoodHub មិនអាចចូលប្រើទីតាំងរបស់អ្នកបានទេ។",
      });
    }
  }
}

export function startUserLocationTracking(): void {
  if (typeof window === "undefined" || trackingStarted) {
    return;
  }

  trackingStarted = true;

  const savedCoordinates = loadSavedCoordinates();

  if (!navigator.geolocation) {
    emit({
      coordinates: savedCoordinates,
      status: "unsupported",
      error: "កម្មវិធីរុករកនេះមិនគាំទ្រសេវាទីតាំងទេ។",
    });

    return;
  }

  // Keep saved coordinates visible while requesting
  // a fresh live position.
  emit({
    coordinates: savedCoordinates,
    status: "requesting",
    error: null,
  });

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
  };
}
