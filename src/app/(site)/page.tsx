import { Metadata } from "next";
import HomePageClient from "@/components/home/HomePageClient";
import SeoContentBlock from "@/components/home/SeoContentBlock";

export const metadata: Metadata = {
  title: "ម្ហូបអាហារ Mhoubahar - ណែនាំម្ហូបឆ្ងាញ់ៗ | FoodHub Cambodia",
  description:
    "Mhoubahar FoodHub (ម្ហូបអាហារ) — ស្វែងរក និងណែនាំ Khmer food ភោជនីយដ្ឋាន (restaurant) ម្ហូប Halal ម្ហូប채食 (vegetarian) ដែលសមស្របតាមចំណូលចិត្ត អាឡែស៊ី (allergy) ជំនឿ (religion) និងទីតាំងរបស់អ្នក។ Discover personalized food recommendations in Cambodia with FoodHub.",
  alternates: {
    canonical: "https://www.mhoubahar.store",
  },
  openGraph: {
    title: "ម្ហូបអាហារ Mhoubahar — FoodHub Cambodia",
    description:
      "ស្វែងរក និងណែនាំ Khmer food ភោជនីយដ្ឋាន ម្ហូប Halal ម្ហូប채食 ដែលសមស្របតាមចំណូលចិត្ត អាឡែស៊ី ជំនឿ និងទីតាំងរបស់អ្នក។ Discover personalized food in Cambodia.",
    url: "https://www.mhoubahar.store",
    siteName: "Mhoubahar FoodHub",
    type: "website",
    images: [
      {
        url: "https://www.mhoubahar.store/og-image.jpeg",
        width: 1200,
        height: 630,
        alt: "Mhoubahar FoodHub — ម្ហូបអាហារ Cambodia",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ម្ហូបអាហារ Mhoubahar | FoodHub Cambodia",
    description:
      "ស្វែងរក និងណែនាំ Khmer food ភោជនីយដ្ឋាន ម្ហូប Halal ម្ហូប채食 ដែលសមស្របតាមចំណូលចិត្ត អាឡែស៊ី ជំនឿ និងទីតាំងរបស់អ្នក - Personalized food recommendations in Cambodia.",
    images: ["https://www.mhoubahar.store/og-image.jpeg"],
  },
};

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <>
      <HomePageClient />
      {/* Server-rendered keyword-rich content block for SEO topical authority */}
      <SeoContentBlock />
    </>
  );
}
