import CommunitySection from "@/components/about/CommunitySection";
import GoalsSection from "@/components/about/GoalsSection";
import HowToUseSection from "@/components/about/HowToUseSection";
import StatsSection from "@/components/about/StatsSection";
import ContactSection from "@/components/about/ContactSection";
import MentorSection from "@/components/about/MentorSection";
import AboutHeroClient from "@/components/about/AboutHeroClient";
import TechnologiesSection from "@/components/about/TechnologiesSection";
import AboutStorySection from "@/components/about/AboutStorySection";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "អំពីយើង Mhoubahar FoodHub — ម្ហូបអាហារ",
  },
  description:
    "ស្វែងយល់អំពី Mhoubahar FoodHub (ម្ហូបអាហារ) — វេទិកាណែនាំមុខម្ហូបខ្មែរ ភោជនីយដ្ឋាន និងអាហារសុខភាពនៅកម្ពុជា។ Discover personalized food recommendations.",
  alternates: {
    canonical: "https://www.mhoubahar.store/about",
  },
  openGraph: {
    type: "website",
    url: "https://www.mhoubahar.store/about",
    siteName: "Mhoubahar FoodHub",
    locale: "km_KH",
    title: "អំពីយើង Mhoubahar FoodHub — ម្ហូបអាហារ",
    description:
      "ស្វែងយល់អំពី Mhoubahar FoodHub (ម្ហូបអាហារ) — វេទិកាណែនាំមុខម្ហូបខ្មែរ ភោជនីយដ្ឋាន និងអាហារសុខភាពនៅកម្ពុជា។ Discover personalized food recommendations.",
    images: [
      {
        url: "https://www.mhoubahar.store/og-image.jpeg",
        width: 1200,
        height: 630,
        alt: "អំពី Mhoubahar FoodHub",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "អំពីយើង Mhoubahar FoodHub — ម្ហូបអាហារ",
    description:
      "ស្វែងយល់អំពី Mhoubahar FoodHub (ម្ហូបអាហារ) — វេទិកាណែនាំមុខម្ហូបខ្មែរ ភោជនីយដ្ឋាន និងអាហារសុខភាពនៅកម្ពុជា។",
    images: ["https://www.mhoubahar.store/og-image.jpeg"],
  },
};

export default function AboutPage() {
  return (
    <main className="min-h-screen w-full overflow-x-hidden dark:bg-slate-950">
      <div className="relative mx-auto w-full max-w-[1536px]">
        <AboutHeroClient />

        <StatsSection />
        <TechnologiesSection />
        <GoalsSection />
        <HowToUseSection />
        <MentorSection />
        <CommunitySection />
        <ContactSection />
        <AboutStorySection />
      </div>
    </main>
  );
}
