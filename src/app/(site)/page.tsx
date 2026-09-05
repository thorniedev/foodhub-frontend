import { Metadata } from "next";
import HomePageClient from "@/components/home/HomePageClient";

export const metadata: Metadata = {
  title: {
    absolute: "ម្ហូបអាហារ Mhoubahar — FoodHub Cambodia",
  },
  description:
    "Mhoubahar FoodHub (ម្ហូបអាហារ) — ស្វែងរក និងណែនាំ Khmer food ភោជនីយដ្ឋាន ម្ហូប Halal ម្ហូបបួស តាមចំណូលចិត្ត និងទីតាំង។ Food recommendations in Cambodia.",
  alternates: {
    canonical: "https://www.mhoubahar.store",
  },
  openGraph: {
    type: "website",
    url: "https://www.mhoubahar.store",
    siteName: "Mhoubahar FoodHub",
    locale: "km_KH",
    title: "ម្ហូបអាហារ Mhoubahar — FoodHub Cambodia",
    description:
      "Mhoubahar FoodHub (ម្ហូបអាហារ) — ស្វែងរក និងណែនាំ Khmer food ភោជនីយដ្ឋាន ម្ហូប Halal ម្ហូបបួស តាមចំណូលចិត្ត និងទីតាំង។ Food recommendations in Cambodia.",
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
    title: "ម្ហូបអាហារ Mhoubahar — FoodHub Cambodia",
    description:
      "Mhoubahar FoodHub (ម្ហូបអាហារ) — ស្វែងរក និងណែនាំ Khmer food ភោជនីយដ្ឋាន ម្ហូប Halal ម្ហូបបួស តាមចំណូលចិត្ត និងទីតាំង។ Food recommendations in Cambodia.",
    images: ["https://www.mhoubahar.store/og-image.jpeg"],
  },
};

export const revalidate = 60;

export default function Page() {
  return <HomePageClient />;
}
