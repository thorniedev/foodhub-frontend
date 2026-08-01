"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";

import type { MenuItem } from "@/types/manu";
import type { Store } from "@/types/store";
import type {
  Coordinates,
  LocationFiltersState,
  LocationViewMode,
} from "@/types/location";

import {
  buildRecommendedStores,
  filterAndSortRecommendedStores,
} from "@/lib/location/recommendation";

import MobileLocationToolbar from "../MobileLocationToolbar";
import NearbyStoreList from "../NearbyStoreList";

const FoodLocationMap = dynamic(() => import("../FoodLocationMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[62dvh] min-h-[480px] animate-pulse rounded-[26px] bg-gray-100 md:h-[680px]" />
  ),
});

interface SingleRecommendationProps {
  menuItems: MenuItem[];
  stores: Store[];
  userLocation: Coordinates | null;
  filters: LocationFiltersState;
  searchQuery: string;
  onOpenFilters: () => void;
  onResultCountChange: (count: number) => void;
}

export default function SingleRecommendation({
  menuItems,
  stores: backendStores,
  userLocation,
  filters,
  searchQuery,
  onOpenFilters,
  onResultCountChange,
}: SingleRecommendationProps) {
  const [view, setView] = useState<LocationViewMode>("list");
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);

  const recommendedStores = useMemo(
    () =>
      buildRecommendedStores({
        menuItems,
        stores: backendStores,
        referencePoint: userLocation,
      }),
    [backendStores, menuItems, userLocation],
  );

  const filteredStores = useMemo(
    () =>
      filterAndSortRecommendedStores({
        stores: recommendedStores,
        filters,
        mode: "single",
        searchQuery,
      }),
    [filters, recommendedStores, searchQuery],
  );

  useEffect(() => {
    onResultCountChange(filteredStores.length);
  }, [filteredStores.length, onResultCountChange]);

  useEffect(() => {
    if (!selectedStoreId) return;

    const stillVisible = filteredStores.some(
      (store) => store.uuid === selectedStoreId,
    );

    if (!stillVisible) setSelectedStoreId(null);
  }, [filteredStores, selectedStoreId]);

  const list = (
    <NearbyStoreList
      stores={filteredStores}
      mode="single"
      selectedStoreId={selectedStoreId}
      onSelectStore={setSelectedStoreId}
    />
  );

  const map = (
    <FoodLocationMap
      mode="single"
      userLocation={userLocation}
      stores={filteredStores}
      selectedStoreId={selectedStoreId}
      radiusKm={filters.radiusKm}
      onSelectStore={setSelectedStoreId}
    />
  );

  return (
    <section>
      <MobileLocationToolbar
        view={view}
        onViewChange={setView}
        onOpenFilters={onOpenFilters}
      />

      <div className="2xl:hidden">{view === "list" ? list : map}</div>

      <div className="hidden min-w-0 gap-5 2xl:grid 2xl:grid-cols-[minmax(380px,42%)_minmax(0,58%)]">
        <div className="min-w-0">{list}</div>
        <div className="min-w-0">
          <div className="sticky top-24">{map}</div>
        </div>
      </div>
    </section>
  );
}
