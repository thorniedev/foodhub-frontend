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

export default function AboutPage() {
  return (
    <main className="min-h-screen w-full overflow-x-hidden  dark:bg-slate-950">
      <div className="relative mx-auto w-full max-w-[1536px]">
        
        <AboutHeroClient />
        {/* <FoodHubSmartRecommendationSection /> */}
        <StatsSection />
        <TechnologiesSection />
        {/* <WhyChooseUsSection /> */}
        <MarqueeSection />
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
