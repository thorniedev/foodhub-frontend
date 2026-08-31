"use client";

import { useEffect, useMemo, useState } from "react";

import EventSection from "@/components/home/event";
import FitFoodSection from "@/components/home/fitfood";
import LocationSection from "@/components/home/location";
import MealsByAgeSection from "@/components/home/age";
import SeasonSection from "@/components/home/season";

import FilterByMealTime from "@/components/home/features/FilterByMealTime";
import FoodSearchBar from "@/components/home/features/FoodSearchBarComponent";
import Model from "@/components/home/features/Model";

import Hero from "@/components/home/Hero";
import LocationPermissionModal from "@/components/LocationPermissionModal";
import NearbyStoreVoiceAlert from "@/components/home/NearbyStoreVoiceAlert";

import { useGetStoresQuery } from "@/app/store/locationApi";
import { useUserLocation } from "@/hooks/useUserLocation";

import type { VoiceAlertStore } from "@/hooks/useNearbyStoreVoiceAlert";
import PopularSection from "@/components/home/popular";
import RegionFlightSection from "@/components/home/RegionFlightSection";
import MealTimeJourneySection from "@/components/MealTimeJourneySection";
import FlavorIndexSection from "@/components/Flavorindexsection";

import ZoomThroughSection from "@/components/Zoomthroughsection";
import BrushRevealSection from "@/components/Brushrevealsection ";

type StoreVoiceSource = {
  uuid?: string;
  id?: string;

  name?: string;
  storeName?: string;
  localName?: string;

  latitude?: number | string | null;
  longitude?: number | string | null;

  operatingStatus?: string | null;

  recommendation?: {
    finalScore?: number | null;
  } | null;
};

const MINIMUM_MATCH_PERCENTAGE = 70;

export default function HomePageClient() {
  const { coordinates, status, error, refreshLocation } = useUserLocation();

  const { data: stores = [] } = useGetStoresQuery();

  const [locationModalOpen, setLocationModalOpen] = useState(false);

  const [hasDismissedLocationModal, setHasDismissedLocationModal] =
    useState(false);

  /*
   * Only stores with a recommendation score
   * of 70% or higher will trigger voice alerts.
   */
  const matchingStores = useMemo<VoiceAlertStore[]>(() => {
    const storeList = stores as StoreVoiceSource[];

    return storeList
      .map((store) => {
        const latitude = Number(store.latitude);

        const longitude = Number(store.longitude);

        const rawScore = store.recommendation?.finalScore;

        const matchPercentage =
          typeof rawScore === "number"
            ? rawScore <= 1
              ? rawScore * 100
              : rawScore
            : undefined;

        return {
          store,
          latitude,
          longitude,
          matchPercentage,
        };
      })
      .filter(({ store, latitude, longitude, matchPercentage }) => {
        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
          return false;
        }

        const operatingStatus =
          typeof store.operatingStatus === "string"
            ? store.operatingStatus.trim().toUpperCase()
            : "UNKNOWN";

        const storeIsOpen =
          !operatingStatus ||
          operatingStatus === "OPEN" ||
          operatingStatus === "ACTIVE" ||
          operatingStatus === "AVAILABLE";

        const matchesPreference =
          typeof matchPercentage === "number" &&
          matchPercentage >= MINIMUM_MATCH_PERCENTAGE;

        return storeIsOpen && matchesPreference;
      })
      .map(({ store, latitude, longitude, matchPercentage }) => ({
        uuid: store.uuid,
        id: store.id,
        name: store.name,
        storeName: store.storeName,
        localName: store.localName,
        latitude,
        longitude,
        matchPercentage,
      }));
  }, [stores]);

  useEffect(() => {
    if (
      hasDismissedLocationModal ||
      status === "granted" ||
      status === "requesting"
    ) {
      return;
    }

    const timer = window.setTimeout(() => {
      setLocationModalOpen(true);
    }, 700);

    return () => {
      window.clearTimeout(timer);
    };
  }, [hasDismissedLocationModal, status]);

  useEffect(() => {
    if (status !== "granted") {
      return;
    }

    setLocationModalOpen(false);
    setHasDismissedLocationModal(true);
  }, [status]);

  function handleEnableLocation() {
    refreshLocation();
  }

  function handleCloseLocationModal() {
    setLocationModalOpen(false);

    setHasDismissedLocationModal(true);
  }

  function handleOpenLocationModal() {
    if (status === "granted") {
      return;
    }

    setHasDismissedLocationModal(false);

    setLocationModalOpen(true);
  }

  return (
    <div className="">
      {/* <LocationPermissionModal
        open={locationModalOpen && status !== "granted"}
        status={status}
        error={error}
        onEnable={handleEnableLocation}
        onClose={handleCloseLocationModal}
      /> */}

      {/* <NearbyStoreVoiceAlert
        coordinates={coordinates ?? null}
        stores={matchingStores}
        radiusMeters={100}
        cooldownMilliseconds={10 * 60 * 1000}
        onRequestLocation={handleOpenLocationModal}
      /> */}

      <section>
        <h1 className="sr-only">
          ម្ហូបអាហារ Mhoubahar (FoodHub) - ប្រព័ន្ធស្វែងរក
          និងណែនាំមុខម្ហូបឆ្លាតវៃនៅកម្ពុជា
        </h1>
        <MealTimeJourneySection />
        <Hero />
        {/* <MealTimeJourneySection /> */}
        {/* <ZoomThroughSection /> */}
        {/* <BrushRevealSection /> */}
        <PopularSection />
        <FilterByMealTime />
        {/* <RegionFlightSection /> */}
        {/* <FlavorIndexSection /> */}
        {/* <MarketWallSection /> */}
        <FoodSearchBar />
        {/* <Model /> */}
        <SeasonSection />
        <EventSection />
        <LocationSection />
        <MealsByAgeSection />
        <FitFoodSection />
      </section>
    </div>
  );
}
