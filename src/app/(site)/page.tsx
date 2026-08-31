import { Metadata } from "next";
import HomePageClient from "@/components/home/HomePageClient";

export const metadata: Metadata = {
  title: "ម្ហូបអាហារ Mhoubahar - ណែនាំម្ហូបឆ្ងាញ់ៗ | FoodHub",
  description: "ស្វែងរក និងណែនាំម្ហូបអាហារ (Mhoub) ភោជនីយដ្ឋាន និងមុខម្ហូបឆ្ងាញ់ៗប្រចាំថ្ងៃជាមួយ FoodHub Cambodia។",
  alternates: {
    canonical: "https://www.mhoubahar.store",
  },
};

export const dynamic = "force-dynamic";

export default function Page() {
  return <HomePageClient />;
}
