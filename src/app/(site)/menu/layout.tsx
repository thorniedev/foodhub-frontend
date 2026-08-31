import type { Metadata } from "next";
import FoodNavTabs from "@/components/food-page/FoodNavTabs";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "ម្ហូបអាហារ Mhoubahar — ស្វែងរក Khmer Food & Restaurant",
  description:
    "ស្វែងរកមុខម្ហូបឆ្ងាញ់ ហាងភោជនីយដ្ឋាន (restaurant) ម្ហូបខ្មែរ (Khmer food) ម្ហូប Halal ម្ហូប채食 (vegetarian) ជាមួយ Mhoubahar FoodHub Cambodia — Find personalized food and restaurant recommendations tailored to your preferences, allergies, dietary type.",
  alternates: {
    canonical: `${SITE_URL}/menu`,
  },
  openGraph: {
    title: "Mhoubahar FoodHub — ស្វែងរកម្ហូបអាហារ Khmer Food",
    description:
      "ស្វែងរកមុខម្ហូបឆ្ងាញ់ ហាងអាហារ ភោជនីយដ្ឋាន ម្ហូបខ្មែរ (Khmer food) ម្ហូប Halal ម្ហូប채食 (vegetarian) ជាមួយ Mhoubahar FoodHub Cambodia.",
    url: `${SITE_URL}/menu`,
    siteName: "Mhoubahar FoodHub",
    type: "website",
  },
};

export default function FoodLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-[#fafaf8] dark:bg-black">
      <div className="pt-15" />

      {/* NAV TABS */}
      <div className="sticky top-16 z-30 w-full border-b border-gray-100 bg-white/85 backdrop-blur-md">
        <FoodNavTabs />
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-20 pt-6 sm:px-6">
        {children}
      </div>
    </div>
  );
}
