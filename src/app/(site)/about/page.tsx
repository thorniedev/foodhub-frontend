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
  title: "អំពីយើង | FoodHub - Discover Cambodian Mhoub",
  description: "ស្វែងយល់បន្ថែមអំពី FoodHub បេសកកម្មរបស់យើង និងរបៀបដែលយើងជួយអ្នកក្នុងការស្វែងរកអាហារ (Mhoub) ដែលអ្នកចូលចិត្ត។",
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
