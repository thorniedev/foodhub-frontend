"use client";

import dynamic from "next/dynamic";
import LazySection from "@/components/common/LazySection";

const MealTimeJourneySection = dynamic(
  () => import("@/components/MealTimeJourneySection"),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[450px] animate-pulse rounded-2xl bg-slate-50/50" />
    ),
  },
);

const ProvineImageRevealSection = dynamic(
  () => import("./features/province"),
  {
    ssr: false,
    loading: () => <div className="min-h-[250px]" />,
  },
);

const Hero = dynamic(() => import("@/components/home/Hero"), {
  loading: () => (
    <div className="min-h-[300px] animate-pulse rounded-2xl bg-slate-50/50" />
  ),
});

const PopularSection = dynamic(() => import("@/components/home/popular"), {
  loading: () => (
    <div className="min-h-[300px] animate-pulse rounded-2xl bg-slate-50/50" />
  ),
});

const FilterByMealTime = dynamic(
  () => import("@/components/home/features/FilterByMealTime"),
);

const FilterSomeCategory = dynamic(
  () => import("./features/FilterSomeCategory"),
);

const SeasonSection = dynamic(() => import("@/components/home/season"));
const EventSection = dynamic(() => import("@/components/home/event"));

const LocationSection = dynamic(() => import("@/components/home/location"), {
  loading: () => (
    <div className="min-h-[400px] animate-pulse rounded-2xl bg-slate-50/50" />
  ),
});

const MealsByAgeSection = dynamic(() => import("@/components/home/age"));
const FitFoodSection = dynamic(() => import("@/components/home/fitfood"));

const Skiper30 = dynamic(
  () => import("../ui/skiper-ui/skiper30").then((mod) => mod.Skiper30),
  {
    ssr: false,
    loading: () => <div className="min-h-[250px]" />,
  },
);

export default function HomePageClient() {
  return (
    <div>
      <section>
        <h1 className="sr-only">
          ម្ហូបអាហារ Mhoubahar (FoodHub) - ប្រព័ន្ធស្វែងរក
          និងណែនាំមុខម្ហូបឆ្លាតវៃនៅកម្ពុជា
        </h1>

        {/* Top fold sections */}
        <div className="lg:py-">
          <MealTimeJourneySection />
        </div>
        <ProvineImageRevealSection />
        <Hero />

        {/* Below-the-fold sections deferred until scrolled near viewport */}
        <LazySection minHeight="450px">
          <PopularSection />
        </LazySection>

        <LazySection minHeight="600px">
          <FilterByMealTime />
        </LazySection>

        <LazySection minHeight="300px">
          <FilterSomeCategory />
        </LazySection>

        <LazySection minHeight="450px">
          <SeasonSection />
        </LazySection>

        <LazySection minHeight="450px">
          <EventSection />
        </LazySection>

        <LazySection minHeight="450px">
          <LocationSection />
        </LazySection>

        <LazySection minHeight="450px">
          <MealsByAgeSection />
        </LazySection>

        <LazySection minHeight="300px">
          <div className="lg:py-8 py-3">
            <Skiper30 />
          </div>
        </LazySection>

        <LazySection minHeight="450px">
          <FitFoodSection />
        </LazySection>
      </section>
    </div>
  );
}
