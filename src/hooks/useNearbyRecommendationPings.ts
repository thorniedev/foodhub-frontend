"use client";

import { useEffect, useSyncExternalStore } from "react";

import { store } from "@/app/store/store";
import { notificationApi } from "@/app/store/notificationApi";
import type {
  ProximityNotificationResult,
  ProximityPingRequest,
} from "@/types/notifications";

type NearbyPingStatus =
  | "idle"
  | "unsupported"
  | "watching"
  | "permission-denied"
  | "error";

interface Coordinates {
  latitude: number;
  longitude: number;
}

const STORAGE_KEY = "foodhub-nearby-recommendations-enabled";
const MIN_PING_INTERVAL_MS = 30_000;
const PASSIVE_PING_INTERVAL_MS = 60_000;
const MEANINGFUL_MOVEMENT_METERS = 75;

/**
 * Module-level singleton, the same pattern useUserLocation.ts uses.
 *
 * This used to be per-component React state, which meant the geolocation
 * watch only ran while NearbyRecommendationsSettings (the notification
 * settings page) happened to be mounted -- the watch was torn down the
 * instant a user navigated anywhere else in the app, which is effectively
 * always. The backend then kept evaluating "nearby stores" against whatever
 * coordinate that one page last sent, sometimes hours or days earlier: it
 * looked like the same store kept alerting because, from the backend's
 * point of view, the user genuinely had not moved since that last ping.
 *
 * Moving the watch to module scope, driven by a component mounted once in
 * the root layout (see NearbyRecommendationPingTracker), keeps it running
 * for as long as the app is open in the foreground on any page -- which is
 * what "foreground ping" was always meant to mean here, not "on the
 * settings page." A backgrounded tab or closed app still stops updates,
 * same as before: this is not background tracking, just correctly-scoped
 * foreground tracking (see CLAUDE.md's "no continuous background PWA
 * location tracking").
 */

let enabled = false;
let status: NearbyPingStatus = "idle";
let error: string | null = null;
let lastPingAt: string | null = null;
let lastResult: ProximityNotificationResult | null = null;
let isPinging = false;

let watchId: number | null = null;
let lastSentAt = 0;
let lastSentCoordinates: Coordinates | null = null;
let storedStateLoaded = false;

const listeners = new Set<() => void>();

type Snapshot = {
  enabled: boolean;
  status: NearbyPingStatus;
  error: string | null;
  lastPingAt: string | null;
  lastResult: ProximityNotificationResult | null;
  isPinging: boolean;
};

const SERVER_SNAPSHOT: Snapshot = {
  enabled: false,
  status: "idle",
  error: null,
  lastPingAt: null,
  lastResult: null,
  isPinging: false,
};

let snapshot: Snapshot = SERVER_SNAPSHOT;

function emit(): void {
  snapshot = { enabled, status, error, lastPingAt, lastResult, isPinging };
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): Snapshot {
  return snapshot;
}

function getServerSnapshot(): Snapshot {
  return SERVER_SNAPSHOT;
}

function getStoredEnabled(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function persistEnabled(value: boolean): void {
  try {
    if (value) {
      window.localStorage.setItem(STORAGE_KEY, "true");
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Nearby recommendations still work without localStorage.
  }
}

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}

function distanceMeters(a: Coordinates, b: Coordinates): number {
  const earthRadiusMeters = 6_371_000;
  const latitudeDelta = toRadians(b.latitude - a.latitude);
  const longitudeDelta = toRadians(b.longitude - a.longitude);
  const startLatitude = toRadians(a.latitude);
  const endLatitude = toRadians(b.latitude);

  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(startLatitude) *
      Math.cos(endLatitude) *
      Math.sin(longitudeDelta / 2) ** 2;

  return (
    earthRadiusMeters *
    2 *
    Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
  );
}

function getGeolocationErrorMessage(err: GeolocationPositionError): string {
  switch (err.code) {
    case err.PERMISSION_DENIED:
      return "Location permission was denied.";
    case err.POSITION_UNAVAILABLE:
      return "FoodHub could not determine your current location.";
    case err.TIMEOUT:
      return "Location lookup timed out.";
    default:
      return "Nearby recommendations could not access your location.";
  }
}

async function handlePosition(position: GeolocationPosition): Promise<void> {
  const now = Date.now();
  const nextCoordinates: Coordinates = {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
  };
  const movedMeters = lastSentCoordinates
    ? distanceMeters(lastSentCoordinates, nextCoordinates)
    : Number.POSITIVE_INFINITY;
  const elapsedMs = now - lastSentAt;

  if (lastSentAt > 0 && elapsedMs < MIN_PING_INTERVAL_MS) {
    return;
  }

  if (
    lastSentAt > 0 &&
    elapsedMs < PASSIVE_PING_INTERVAL_MS &&
    movedMeters < MEANINGFUL_MOVEMENT_METERS
  ) {
    return;
  }

  lastSentAt = now;
  lastSentCoordinates = nextCoordinates;

  const speed =
    typeof position.coords.speed === "number" &&
    Number.isFinite(position.coords.speed) &&
    position.coords.speed >= 0
      ? position.coords.speed
      : null;

  isPinging = true;
  emit();

  try {
    // No radiusMeters here: the backend resolves the match radius from the
    // profile's own ProfilePreference.defaultSearchRadiusKm, not from
    // whatever a client sends.
    const request: ProximityPingRequest = {
      latitude: nextCoordinates.latitude,
      longitude: nextCoordinates.longitude,
      speed,
    };

    const result = await store
      .dispatch(notificationApi.endpoints.sendProximityPing.initiate(request))
      .unwrap();

    lastPingAt = new Date(now).toISOString();
    lastResult = result;
    error = null;
    status = "watching";
  } catch {
    error = "FoodHub could not send the nearby recommendation ping.";
    status = "error";
  } finally {
    isPinging = false;
    emit();
  }
}

function handleGeolocationError(geolocationError: GeolocationPositionError): void {
  const denied = geolocationError.code === geolocationError.PERMISSION_DENIED;

  error = getGeolocationErrorMessage(geolocationError);
  status = denied ? "permission-denied" : "error";

  if (denied) {
    enabled = false;
    persistEnabled(false);
    stopWatching();
    return;
  }

  emit();
}

function stopWatching(): void {
  if (
    typeof window !== "undefined" &&
    navigator.geolocation &&
    watchId !== null
  ) {
    navigator.geolocation.clearWatch(watchId);
  }

  watchId = null;

  if (status !== "unsupported" && status !== "permission-denied") {
    status = "idle";
  }

  emit();
}

function startWatching(): void {
  if (typeof window === "undefined") {
    return;
  }

  if (!navigator.geolocation) {
    status = "unsupported";
    error = "This browser does not support location services.";
    emit();
    return;
  }

  if (watchId !== null) {
    return;
  }

  status = "watching";
  error = null;
  emit();

  watchId = navigator.geolocation.watchPosition(
    (position) => {
      void handlePosition(position);
    },
    handleGeolocationError,
    {
      enableHighAccuracy: true,
      maximumAge: 15_000,
      timeout: 15_000,
    },
  );
}

/**
 * Resumes watching on this page load if the user had already enabled nearby
 * recommendations on a previous visit -- called once from the always-mounted
 * NearbyRecommendationPingTracker, so the watch survives navigation across
 * every page rather than only the settings page it used to live on.
 */
function loadStoredStateAndResume(): void {
  if (typeof window === "undefined" || storedStateLoaded) {
    return;
  }

  storedStateLoaded = true;
  enabled = getStoredEnabled();
  emit();

  if (enabled) {
    startWatching();
  }
}

function enable(): void {
  enabled = true;
  persistEnabled(true);
  emit();
  startWatching();
}

function disable(): void {
  enabled = false;
  persistEnabled(false);
  lastResult = null;
  error = null;
  emit();
  stopWatching();
}

/**
 * Keeps the module-level watch alive for as long as any component using
 * this hook is mounted. Intended to be called from exactly one
 * always-mounted component (NearbyRecommendationPingTracker in the root
 * layout) so the watch's lifetime is the whole app session, not one page.
 */
export function useNearbyRecommendationPings() {
  const currentSnapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  useEffect(() => {
    loadStoredStateAndResume();
  }, []);

  return {
    ...currentSnapshot,
    enable,
    disable,
  };
}
