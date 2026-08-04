"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import ReviewFilterTabs, {
  type FilterTab,
} from "@/components/dashboard/review/ReviewFilterTabs";
import ReviewTable from "@/components/dashboard/review/ReviewTable";
import type { RatingReviewItem } from "@/types/review";

const cardImages = ["/Image/card-Img.png", "/Image/card2.png"];

const CATEGORY_LABELS: Record<RatingReviewItem["category"], string> = {
  meal: "ម្ហូបអាហារ",
  drink: "ភេសជ្ជៈ",
  shop: "ហាង",
};

const rawItems: {
  category: RatingReviewItem["category"];
  name: string;
}[] = [
  { category: "meal", name: "មីឆាសាច់គោ" },
  { category: "meal", name: "បាយឆាសាច់មាន់" },
  { category: "drink", name: "កាហ្វេទឹកដោះគោ" },
  { category: "drink", name: "តែបៃតងទឹកកក" },
  { category: "shop", name: "ហាងអាហារខ្មែរ" },
  { category: "meal", name: "គុយទាវសាច់គោ" },
];

const mockItems: RatingReviewItem[] = rawItems.map((item, i) => ({
  id: `item-${i}`,
  name: item.name,
  imageUrl: cardImages[i % cardImages.length],
  category: item.category,
  categoryLabel: CATEGORY_LABELS[item.category],
  rating: 4.3,
  date: "១១/០១/២០២៦",
  sortDate: "2026-01-11",
  description:
    "មីធ្វើពីបាយផ្ទះជាមួយសាច់គោស្រស់ៗ ហើយសមស្របសម្រាប់អ្នកចូលចិត្តរសជាតិខ្លាំង។ រសជាតិសាច់គោស្រស់ធ្វើឲ្យអាហារនេះឆ្ងាញ់ សម្បូរបែបយ៉ាងណាស់។",
}));

type SortOrder = "oldest" | "newest";

const sortOptions: { id: SortOrder; label: string }[] = [
  { id: "oldest", label: "ចាស់បំផុត" },
  { id: "newest", label: "ថ្មីបំផុត" },
];

export default function ReviewPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("oldest");
  const [sortMenuOpen, setSortMenuOpen] = useState(false);

  const tabs: FilterTab[] = useMemo(() => {
    const countBy = (cat: RatingReviewItem["category"]) =>
      mockItems.filter((item) => item.category === cat).length;

    return [
      { id: "all", label: "ទាំងអស់", count: mockItems.length },
      { id: "meal", label: CATEGORY_LABELS.meal, count: countBy("meal") },
      { id: "drink", label: CATEGORY_LABELS.drink, count: countBy("drink") },
      { id: "shop", label: CATEGORY_LABELS.shop, count: countBy("shop") },
    ];
  }, []);

  const filteredItems = useMemo(() => {
    const items =
      activeTab === "all"
        ? mockItems
        : mockItems.filter((item) => item.category === activeTab);

    const sorted = [...items].sort((a, b) =>
      a.sortDate.localeCompare(b.sortDate),
    );
    return sortOrder === "oldest" ? sorted : sorted.reverse();
  }, [activeTab, sortOrder]);

  const activeSortLabel =
    sortOptions.find((o) => o.id === sortOrder)?.label ?? "ចាស់បំផុត";

  return (
    <div className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-6">
      <p className="text-xl font-bold text-[#E36914] sm:text-3xl">
        ប្រវត្តិនៃការវាយតម្លៃម្ហូបអាហារ
      </p>
      <p className="mt-2 text-base text-[#136C34] sm:mt-3 sm:text-xl">
        សម្របតាមចំណូលចិត្តរបស់ លីតា
      </p>

      <div className="mt-4 flex flex-col gap-3 sm:mt-5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="overflow-x-auto pb-1 sm:overflow-visible sm:pb-0">
          <ReviewFilterTabs
            tabs={tabs}
            activeTab={activeTab}
            onChange={setActiveTab}
          />
        </div>

        <div className="relative self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setSortMenuOpen((open) => !open)}
            className="inline-flex items-cennter gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
          >
            {activeSortLabel}
            <ChevronDown className="h-4 w-4" />
          </button>

          {sortMenuOpen && (
            <div className="absolute right-0 top-full z-10 mt-1 w-40 rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
              {sortOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setSortOrder(opt.id);
                    setSortMenuOpen(false);
                  }}
                  className={`block w-full rounded-md px-3 py-2 text-left text-sm ${
                    opt.id === sortOrder
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 sm:mt-5">
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
