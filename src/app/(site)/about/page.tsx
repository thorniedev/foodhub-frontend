import CommunitySection from "@/components/about/CommunitySection";
import GoalsSection from "@/components/about/GoalsSection";
import HowToUseSection from "@/components/about/HowToUseSection";
import MarqueeSection from "@/components/about/MarqueeSection";
import StatsSection from "@/components/about/StatsSection";
import WhyChooseUsSection from "@/components/about/WhyChooseUsSection";
import ContactSection from "@/components/about/ContactSection";
import MentorSection from "@/components/about/MentorSection";
import MarqueeSectionOrangeRtl from "@/components/about/MarqueeSectionOrangeReverse";
import AboutHeroClient from "@/components/about/AboutHeroClient";
import TechnologiesSection from "@/components/about/TechnologiesSection";
import FoodHubSmartRecommendationSection from "@/components/FoodHubSmartRecommendationSection";
import MealTimeJourneySection from "@/components/MealTimeJourneySection";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "អំពី Mhoubahar FoodHub - ម្ហូបអាហារ Cambodia",
  description:
    "ស្វែងយល់អំពី Mhoubahar FoodHub (ម្ហូបអាហារ) — Cambodia's personalized food discovery platform for Khmer food, restaurants, Halal food, and healthy meal recommendations based on your allergies, dietary preferences, and location.",
  alternates: {
    canonical: "https://www.mhoubahar.store/about",
  },
  openGraph: {
    title: "អំពី Mhoubahar FoodHub — ម្ហូបអាហារ Cambodia",
    description:
      "Learn about Mhoubahar.store (FoodHub) — Cambodia's leading food discovery platform for personalized Khmer food (ម្ហូបអាហារ) and restaurant recommendations.",
    url: "https://www.mhoubahar.store/about",
    siteName: "Mhoubahar FoodHub",
  },
};

export default function AboutPage() {
  return (
    <main className="min-h-screen w-full overflow-x-hidden  dark:bg-slate-950">
      <div className="relative mx-auto w-full max-w-[1536px]">
        
        <AboutHeroClient />
        {/* <FoodHubSmartRecommendationSection /> */}
        <StatsSection />
        <TechnologiesSection />
        {/* <WhyChooseUsSection /> */}
       
        <GoalsSection />
        <HowToUseSection />
        {/* <MarqueeSection /> */}
        <MentorSection />
        <CommunitySection />
        {/*  <MarqueeSection /> */}
        {/* <MarqueeSectionOrangeRtl /> */}
        <ContactSection />
      </div>
    </main>
  );
}
