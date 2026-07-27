"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import ReviewFilterTabs, {
  type FilterTab,
} from "@/components/dashboard/review/ReviewFilterTabs";
import ReviewTable from "@/components/dashboard/review/ReviewTable";
import type { RatingReviewItem } from "@/types/review";

const mockItems: RatingReviewItem[] = Array.from({ length: 6 }, (_, i) => ({
  id: `item-${i}`,
  name: "មីអាសាច់គោ",
  imageUrl: "https://placehold.co/112x112/1a1a1a/f5f5f5?text=Food",
  category: "meal",
  categoryLabel: "មួបអាហារ",
  rating: 4.3,
  date: "១១/០១/២០២៦",
  description:
    "មីធ្វើពីបាយផ្ទះជាមួយសាច់គោស្រស់ៗ ហើយសមស្របសម្រាប់អ្នកចូលចិត្តរសជាតិខ្លាំង។ រសជាតិសាច់គោស្រស់ធ្វើឲ្យអាហារនេះឆ្ងាញ់ សម្បូរបែបយ៉ាងណាស់។",
}));

export default function ReviewPage() {
  const [activeTab, setActiveTab] = useState("all");

  const tabs: FilterTab[] = [
    { id: "all", label: "ទាំងអស់", count: 10 },
    { id: "meal", label: "មួបអាហារ", count: 2 },
    { id: "drink", label: "ភេសជ្ជៈ", count: 2 },
    { id: "shop", label: "ហាង", count: 1 },
  ];

  const filteredItems = useMemo(() => {
    if (activeTab === "all") return mockItems;
    return mockItems.filter((item) => item.category === activeTab);
  }, [activeTab]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-6">
      <p className="text-3xl font-bold text-[#E36914]">
        ប្រវត្តិនៃការវាយតម្លៃម្ហូបអាហារ
      </p>
      <p className="mt-3 text-xl text-[#136C34]">សម្របតាមចំណូលចិត្តរបស់ លីតា</p>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <ReviewFilterTabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
        >
          ចាស់បំផុត
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-5">
        <ReviewTable
          items={filteredItems}
          onBlock={(id) => console.log("block", id)}
          onEdit={(id) => console.log("edit", id)}
          onDelete={(id) => console.log("delete", id)}
        />
      </div>
    </div>
  );
}
