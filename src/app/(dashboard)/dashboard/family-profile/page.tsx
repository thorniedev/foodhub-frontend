"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import FamilyMemberList from "@/components/dashboard/family-profile/FamilyMemberList";
import FoodRecommendationCard from "@/components/dashboard/family-profile/FoodRecommendationCard";
import MealTimeTabs from "@/components/dashboard/family-profile/MealTimeTabs";
import type {
  FamilyMember,
  FoodRecommendation,
  MealTime,
} from "@/types/family-profile";

const familyMembers: FamilyMember[] = [
  {
    id: "1",
    name: "Marco Bellini",
    role: "Executive Chef",
    avatarUrl: "https://placehold.co/96x96?text=MB",
  },
  {
    id: "2",
    name: "Mom",
    role: "Food Explorer",
    avatarUrl: "https://placehold.co/96x96?text=M",
  },
  {
    id: "3",
    name: "Children",
    role: "Restaurant Owner",
    avatarUrl: "https://placehold.co/96x96?text=C",
  },
];

const recommendations: FoodRecommendation[] = [
  {
    id: "r1",
    imageUrl: "https://placehold.co/400x300?text=Mi",
    restaurantName: "Kongfou Kitchen",
    dishName: "មីឆាសាច់គោ",
    priceLabel: "2$",
    description: "សូមរីករាយជាមួយមុខម្ហូបដ៏ឈ្នះឆ្នៃ",
    rating: 4.3,
    etaMinutes: 15,
    distanceKm: 2,
    openHours: "ម៉ោងបើក ៥យប់",
    badgeLabel: "Halal",
    isFavorite: true,
  },
  {
    id: "r2",
    imageUrl: "https://placehold.co/400x300?text=Banh+Mi",
    restaurantName: "Kongfou Kitchen",
    dishName: "នំបុ័ងសាច់ជ្រូកខៀ",
    priceLabel: "1.5$",
    description: "សូមរីករាយជាមួយមុខម្ហូបដ៏ឈ្នះឆ្នៃ",
    rating: 4.3,
    etaMinutes: 10,
    distanceKm: 1.5,
    openHours: "ម៉ោងបើក ៨យប់",
    badgeLabel: "ត្រានត់ថែម",
    isFavorite: false,
  },
  {
    id: "r3",
    imageUrl: "https://placehold.co/400x300?text=Rice",
    restaurantName: "ផ្ទះបាយអំបាប់",
    dishName: "បាយឆាម្រះព្រៅ",
    priceLabel: "2.5$",
    description: "សូមរីករាយជាមួយមុខម្ហូបដ៏ឈ្នះឆ្នៃ",
    rating: 4.3,
    etaMinutes: 10,
    distanceKm: 7.3,
    openHours: "ម៉ោងបើក ៨យប់",
    badgeLabel: "Halal",
    isFavorite: true,
  },
  {
    id: "r4",
    imageUrl: "https://placehold.co/400x300?text=Fried",
    restaurantName: "Kongfou Kitchen",
    dishName: "ប្រហិតបំពង",
    priceLabel: "1$",
    description: "សូមរីករាយជាមួយមុខម្ហូបដ៏ឈ្នះឆ្នៃ",
    rating: 4.3,
    etaMinutes: 10,
    distanceKm: 1.5,
    openHours: "ម៉ោងបើក ៨យប់",
    badgeLabel: "Halal",
    isFavorite: false,
  },
  {
    id: "r5",
    imageUrl: "https://placehold.co/400x300?text=Dumplings",
    restaurantName: "អាហារឆ្នាន 99",
    dishName: "នំចាំ និងសៀវរម៉ែ",
    priceLabel: "2$",
    description: "សូមរីករាយជាមួយមុខម្ហូបដ៏ឈ្នះឆ្នៃ",
    rating: 4.3,
    etaMinutes: 10,
    distanceKm: 1.5,
    openHours: "ម៉ោងបើក ៨យប់",
    badgeLabel: "Halal",
    isFavorite: false,
  },
  {
    id: "r6",
    imageUrl: "https://placehold.co/400x300?text=Salad",
    restaurantName: "Kongfou Kitchen",
    dishName: "បុកល្អងគ្រឿងសមុទ្រ",
    priceLabel: "2$",
    description: "សូមរីករាយជាមួយមុខម្ហូបដ៏ឈ្នះឆ្នៃ",
    rating: 4.3,
    etaMinutes: 10,
    distanceKm: 1.5,
    openHours: "ម៉ោងបើក ៨យប់",
    badgeLabel: "Halal",
    isFavorite: true,
  },
];

export default function FamilyPage() {
  const [mealTime, setMealTime] = useState<MealTime>("breakfast");

  const mealTimeLabel: Record<MealTime, string> = {
    breakfast: "ពេលព្រឹក",
    lunch: "ពេលថ្ងៃត្រង់",
    dinner: "ពេលល្ងាច",
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-6">
      <p className="font-medium text-emerald-600">ថ្ងៃព្រហស្បតិ៍ ទី២៨ ខែតុលា</p>
      <h1 className="mt-1 text-2xl font-bold text-slate-800">
        អរុណសួស្តី លីតា!
      </h1>

      <div className="mt-6">
        <FamilyMemberList
          members={familyMembers}
          onAddProfile={() => console.log("add profile")}
        />
      </div>

      <div className="mt-10 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800">
            មុខម្ហូបណែនាំសម្រាប់{mealTimeLabel[mealTime]}
          </h2>
          <p className="text-sm text-slate-500">សម្របតាមចំណូលចិត្តរបស់ លីតា</p>
        </div>
        <MealTimeTabs active={mealTime} onChange={setMealTime} />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {recommendations.map((item) => (
          <FoodRecommendationCard key={item.id} item={item} />
        ))}
      </div>

      <div className="mt-6 flex justify-center">
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
        >
          មើលបន្ថែម
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
