import type { Metadata } from "next";
import FoodNavTabs from "@/components/food-page/FoodNavTabs";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: {
    absolute: "មុខម្ហូប Mhoubahar — ស្វែងរក Khmer Food",
  },
  description:
    "ស្វែងរកមុខម្ហូបឆ្ងាញ់ៗ ភោជនីយដ្ឋាន ម្ហូបខ្មែរ Halal និងម្ហូបបួសជាមួយ Mhoubahar FoodHub Cambodia — Find personalized food recommendations in Cambodia.",
  alternates: {
    canonical: `${SITE_URL}/menu`,
  },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/menu`,
    siteName: "Mhoubahar FoodHub",
    locale: "km_KH",
    title: "មុខម្ហូប Mhoubahar — ស្វែងរក Khmer Food",
    description:
      "ស្វែងរកមុខម្ហូបឆ្ងាញ់ៗ ភោជនីយដ្ឋាន ម្ហូបខ្មែរ Halal និងម្ហូបបួសជាមួយ Mhoubahar FoodHub Cambodia — Find personalized food recommendations in Cambodia.",
    images: [
      {
        url: "https://www.mhoubahar.store/og-image.jpeg",
        width: 1200,
        height: 630,
        alt: "Mhoubahar FoodHub Menu",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "មុខម្ហូប Mhoubahar — ស្វែងរក Khmer Food",
    description:
      "ស្វែងរកមុខម្ហូបឆ្ងាញ់ៗ ភោជនីយដ្ឋាន ម្ហូបខ្មែរ Halal និងម្ហូបបួសជាមួយ Mhoubahar FoodHub Cambodia.",
    images: ["https://www.mhoubahar.store/og-image.jpeg"],
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
