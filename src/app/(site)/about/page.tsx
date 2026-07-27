import CommunitySection from "@/components/about/CommunitySection";
import GoalsSection from "@/components/about/GoalsSection";
import HeroSection from "@/components/about/HeroSection";
import HowToUseSection from "@/components/about/HowToUseSection";
import MarqueeSection, { MarqueeSectionOrange } from "@/components/about/MarqueeSection";
import StatsSection from "@/components/about/StatsSection";
import WhyChooseUsSection from "@/components/about/WhyChooseUsSection";
import ConstantSection from "@/components/about/ContactSection";
import MentorSection from "@/components/about/MentorSection";
import MarqueeSectionOrangeRtl from "@/components/about/MarqueeSectionOrangeReverse";

export default function AboutPage() {
  return (
    <div className="w-full min-h-screen overflow-x-hidden bg-slate-50">
      <div className="relative mx-auto w-full max-w-8xl">
        <HeroSection />
        <StatsSection />
        <WhyChooseUsSection />
        <MarqueeSection />
        <GoalsSection />
        <HowToUseSection />
        <MarqueeSection />
        <MentorSection />
        <CommunitySection />
        <MarqueeSection />
        <MarqueeSectionOrangeRtl />
        <ConstantSection />
      </div>
    </div>
  );
}
