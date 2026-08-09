// "use client";

// import Image from "next/image";
// import { Button } from "@/components/ui/button";
// import { HeroComponent } from "@/components/ui/Hero";
// import { motion } from "motion/react";

// import TextType from "@/components/TextType";
// import { CiHeart } from "react-icons/ci";
// import CurvedLoop from "@/components/CurvedLoop";
// import SplitReveal from "../../../components/animata/preloader/split-reveal";
// import Modal from "../../../components/animata/overlay/modal";
// import { Skiper30 } from "@/components/ui/skiper-ui/skiper30";
// import { Skiper19 } from "@/components/ui/skiper-ui/skiper19";
// import Carousel, { slides } from "@/components/ui/Carosel";
// import FilterByCategory from "@/components/home/filterByCategory";
// import SeasonSection from "@/components/home/season";
// import MealsByAgeSection from "@/components/home/age";
// import FitFoodSection from "@/components/home/fitfood";
// import EventSection from "@/components/home/event";
// import LocationSection from "@/components/home/location";
// import PopularSection from "@/components/home/popular";
// import RecommandSection from "@/components/home/recommand";

// import FilterByMealTime from "@/components/home/features/FilterByMealTime";
// import FoodSearchBar from "@/components/home/features/FoodSearchBarComponent";
// import SwipeCardTinderStyle from "@/components/home/features/SwipeCardTinderStyle";
// import DisplaySwipeCard from "@/components/home/features/DisplaySwipeCard";
// import Model from "@/components/home/features/Model";
// import FoodSearch from "@/components/food-page/FoodSearch";
// import { useGetMenuItemsQuery } from "../store/menuApi";
// import { useEffect, useState } from "react";
// import ModelFloating from "@/components/home/features/ModelFloating";
// import FoodHubSmartRecommendationSection from "@/components/FoodHubSmartRecommendationSection";
// import MinimalFoodHubRecommendationSection from "@/components/Component";
// import HeroComponentOO1 from "@/components/home/Hero";
// import Hero from "@/components/home/Hero";
// import { IconCloudDemo } from "@/components/IconCloudDemo";

// import { Skiper31 } from "@/components/ui/skiper-ui/skiper31";
// import { IconCloudDemoWithImageLogo } from "@/components/ui/icon-cloud-demo-3";
// import LocationPermissionModal from "@/components/LocationPermissionModal";
// import { useUserLocation } from "@/hooks/useUserLocation";

// export default function Home() {
//   const { coordinates, status, error, refreshLocation } = useUserLocation();

//   const [locationModalOpen, setLocationModalOpen] = useState(false);
//   const [hasDismissedLocationModal, setHasDismissedLocationModal] =
//     useState(false);

//   useEffect(() => {
//     if (
//       hasDismissedLocationModal ||
//       status === "granted" ||
//       status === "requesting"
//     ) {
//       return;
//     }

//     const timer = window.setTimeout(() => {
//       setLocationModalOpen(true);
//     }, 700);

//     return () => {
//       window.clearTimeout(timer);
//     };
//   }, [hasDismissedLocationModal, status]);

//   function handleEnableLocation() {
//     refreshLocation();
//   }

//   function handleCloseLocationModal() {
//     setLocationModalOpen(false);
//     setHasDismissedLocationModal(true);
//   }

//   function handleOpenLocationModal() {
//     setHasDismissedLocationModal(false);
//     setLocationModalOpen(true);
//   }
//   return (
//     <div>
//       <LocationPermissionModal
//         open={locationModalOpen && status !== "granted"}
//         status={status}
//         error={error}
//         onEnable={handleEnableLocation}
//         onClose={handleCloseLocationModal}
//       />
//       {/* <SplitReveal
//         images={imageUrls}
//         lockScroll={false}
//         // onComplete={() => setReady(true)}
//         renderProgress={({ loaded, total }) => (
//           <p className="text-center hidden">
//             {loaded}/{total}
//           </p>
//         )}
//       /> */}

//       <section className="">
//         {/* <Skiper30 /> */}
//         <Hero />

//         {/* <IconCloudDemo /> */}
//         {/* <HeroComponentOO1 /> */}

//         {/* <MinimalFoodHubRecommendationSection /> */}
//         <FilterByMealTime />
//         {/* <PopularSection /> */}
//         {/* <Skiper19/> */}
//         {/* <Skiper26/> */}
//         {/* <div className="hidden">
//           <Skiper31 />
//         </div> */}
//         {/* <RecommandSection
//           filters={{
//             query: "",
//             food: new Set(),
//             drink: new Set(),
//             age: new Set(),
//           }}
//         /> */}
//         <FoodSearchBar />
//         {/* <DisplaySwipeCard /> */}
//         <Model />
//         {/* <FoodDiscoverySection /> */}
//         {/* <FilterByCategory /> */}
//         <SeasonSection />
//         {/* <CreatePost />
//         <PostsList /> */}
//         {/* <Skiper19/> */}
//         {/* <div className="h-screen"></div> */}
//         <EventSection />
//         <LocationSection />
//         <MealsByAgeSection />

//         {/* <RecommendCardStack foods={recommendedFoods} /> */}
//         {/* <Skiper48/> */}
//         {/* <TinderFoodStack foods={recommendedFoods} /> */}
//         <FitFoodSection />
//       </section>

//       {/* <CurvedLoop
//         marqueeText="ស្វែងរកមុខម្ហូបនៅជិតអ្នកបំផុត"
//         speed={2}
//         curveAmount={-150}
//         direction="left"
//         interactive
//         className="custom-text-style"
//       /> */}
//     </div>
//   );
// }
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

export default function Home() {
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
    <div>
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
        <Hero />
        <PopularSection />
        <FilterByMealTime />

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
