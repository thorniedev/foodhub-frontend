"use client";

import dynamic from "next/dynamic";
import Hero from "@/components/home/Hero";

const MealTimeJourneySection = dynamic(
  () => import("@/components/MealTimeJourneySection"),
  { loading: () => <div className="min-h-[150px]" /> },
);
const PopularSection = dynamic(() => import("@/components/home/popular"), {
  loading: () => <div className="min-h-[300px] animate-pulse rounded-2xl bg-slate-50/50" />,
});
const FilterByMealTime = dynamic(
  () => import("@/components/home/features/FilterByMealTime"),
);
const FoodSearchBar = dynamic(
  () => import("@/components/home/features/FoodSearchBarComponent"),
);
const SeasonSection = dynamic(() => import("@/components/home/season"));
const EventSection = dynamic(() => import("@/components/home/event"));
const LocationSection = dynamic(() => import("@/components/home/location"), {
  loading: () => <div className="min-h-[400px] animate-pulse rounded-2xl bg-slate-50/50" />,
});
const MealsByAgeSection = dynamic(() => import("@/components/home/age"));
const FitFoodSection = dynamic(() => import("@/components/home/fitfood"));

export default function HomePageClient() {
  return (
    <div>
      <section>
        <h1 className="sr-only">
          ម្ហូបអាហារ Mhoubahar (FoodHub) - ប្រព័ន្ធស្វែងរក
          និងណែនាំមុខម្ហូបឆ្លាតវៃនៅកម្ពុជា
        </h1>
        <MealTimeJourneySection />
        <Hero />
        <PopularSection />
        <FilterByMealTime />
        <FoodSearchBar />
        <SeasonSection />
        <EventSection />
        <LocationSection />
        <MealsByAgeSection />
        <FitFoodSection />
      </section>
    </div>
  );
}
