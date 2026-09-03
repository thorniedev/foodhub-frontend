"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useSendProximityPingMutation } from "@/app/store/notificationApi";
import type { ProximityNotificationResult } from "@/types/notifications";

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

function getStoredEnabled(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function persistEnabled(enabled: boolean): void {
  try {
    if (enabled) {
      window.localStorage.setItem(STORAGE_KEY, "true");
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Nearby recommendations still work without localStorage.
  }
}

function getGeolocationErrorMessage(error: GeolocationPositionError): string {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return "Location permission was denied.";
    case error.POSITION_UNAVAILABLE:
      return "FoodHub could not determine your current location.";
    case error.TIMEOUT:
      return "Location lookup timed out.";
    default:
      return "Nearby recommendations could not access your location.";
  }
}

export function useNearbyRecommendationPings() {
  const [enabled, setEnabledState] = useState(
    () => typeof window !== "undefined" && getStoredEnabled(),
  );
  const [status, setStatus] = useState<NearbyPingStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [lastPingAt, setLastPingAt] = useState<string | null>(null);
  const [lastResult, setLastResult] =
    useState<ProximityNotificationResult | null>(null);

  const [sendProximityPing, { isLoading: isPinging }] =
    useSendProximityPingMutation();

  const watchIdRef = useRef<number | null>(null);
  const lastSentAtRef = useRef(0);
  const lastSentCoordinatesRef = useRef<Coordinates | null>(null);

  const stopWatching = useCallback(() => {
    if (
      typeof window !== "undefined" &&
      navigator.geolocation &&
      watchIdRef.current !== null
    ) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    watchIdRef.current = null;

    setStatus((current) =>
      current === "unsupported" || current === "permission-denied"
        ? current
        : "idle",
    );
  }, []);

  const handlePosition = useCallback(
    async (position: GeolocationPosition) => {
      const now = Date.now();
      const nextCoordinates = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      const lastCoordinates = lastSentCoordinatesRef.current;
      const elapsedMs = now - lastSentAtRef.current;
      const movedMeters = lastCoordinates
        ? distanceMeters(lastCoordinates, nextCoordinates)
        : Number.POSITIVE_INFINITY;

      if (lastSentAtRef.current > 0 && elapsedMs < MIN_PING_INTERVAL_MS) {
        return;
      }

      if (
        lastSentAtRef.current > 0 &&
        elapsedMs < PASSIVE_PING_INTERVAL_MS &&
        movedMeters < MEANINGFUL_MOVEMENT_METERS
      ) {
        return;
      }

      lastSentAtRef.current = now;
      lastSentCoordinatesRef.current = nextCoordinates;

      const speed =
        typeof position.coords.speed === "number" &&
        Number.isFinite(position.coords.speed) &&
        position.coords.speed >= 0
          ? position.coords.speed
          : null;

      try {
        // No radiusMeters here: the backend resolves the match radius from
        // the profile's own ProfilePreference.defaultSearchRadiusKm, not from
        // whatever a client sends. This used to hardcode 200 on every ping,
        // which meant a user's own configured search radius had no effect on
        // this trigger at all.
        const result = await sendProximityPing({
          latitude: nextCoordinates.latitude,
          longitude: nextCoordinates.longitude,
          speed,
        }).unwrap();

        setLastPingAt(new Date(now).toISOString());
        setLastResult(result);
        setError(null);
        setStatus("watching");
      } catch {
        setError("FoodHub could not send the nearby recommendation ping.");
        setStatus("error");
      }
    },
    [sendProximityPing],
  );

  const handleGeolocationError = useCallback(
    (geolocationError: GeolocationPositionError) => {
      const denied =
        geolocationError.code === geolocationError.PERMISSION_DENIED;

      setError(getGeolocationErrorMessage(geolocationError));
      setStatus(denied ? "permission-denied" : "error");

      if (denied) {
        persistEnabled(false);
        setEnabledState(false);
        stopWatching();
      }
    },
    [stopWatching],
  );

  const startWatching = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (!navigator.geolocation) {
      setStatus("unsupported");
      setError("This browser does not support location services.");
      return;
    }

    if (watchIdRef.current !== null) {
      return;
    }

    setStatus("watching");
    setError(null);

    watchIdRef.current = navigator.geolocation.watchPosition(
      handlePosition,
      handleGeolocationError,
      {
        enableHighAccuracy: true,
        maximumAge: 15_000,
        timeout: 15_000,
      },
    );
  }, [handleGeolocationError, handlePosition]);

  useEffect(() => {
    queueMicrotask(() => {
      if (enabled) {
        startWatching();
      } else {
        stopWatching();
      }
    });

    return stopWatching;
  }, [enabled, startWatching, stopWatching]);

  const enable = useCallback(() => {
    persistEnabled(true);
    setEnabledState(true);
  }, []);

  const disable = useCallback(() => {
    persistEnabled(false);
    setEnabledState(false);
    setLastResult(null);
    setError(null);
  }, []);

  return {
    enabled,
    status,
    error,
    isPinging,
    lastPingAt,
    lastResult,
    enable,
    disable,
  };
}
