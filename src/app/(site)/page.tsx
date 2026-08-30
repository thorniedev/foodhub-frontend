import { Metadata } from "next";
import HomePageClient from "@/components/home/HomePageClient";

export const metadata: Metadata = {
  title: "ស្វែងរកម្ហូបអាហារ និង ណែនាំម្ហូបអាហារ (Mhoub) | FoodHub Cambodia",
  description: "ស្វែងរកម្ហូបអាហារដែលស័ក្តិសមបំផុតសម្រាប់អ្នក។ ណែនាំម្ហូបអាហារ ភោជនីយដ្ឋាន និងមុខម្ហូប (Mhoub) ថ្មីៗជារៀងរាល់ថ្ងៃជាមួយ FoodHub Cambodia។",
};

export const dynamic = "force-dynamic";

export default function Page() {
  return <HomePageClient />;
}
