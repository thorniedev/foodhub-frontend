"use client";

import { useNearbyRecommendationPings } from "@/hooks/useNearbyRecommendationPings";

/**
 * Mounted once in the root layout so the nearby-store geolocation watch (see
 * useNearbyRecommendationPings) keeps running across every page the user
 * visits, not just while the notification settings page happens to be open.
 * The settings page still owns the enable/disable toggle and status display;
 * this component only keeps the watch alive for the rest of the app.
 */
export default function NearbyRecommendationPingTracker() {
  useNearbyRecommendationPings();
  return null;
}
