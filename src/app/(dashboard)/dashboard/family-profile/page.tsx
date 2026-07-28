"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaChevronRight } from "react-icons/fa";
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
    mealTime: "breakfast",
    imageUrl: "/Image/food/food1.png",
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
    mealTime: "breakfast",
    imageUrl: "/Image/food/food2.png",
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
    mealTime: "lunch",
    imageUrl: "/Image/food/food3.png",
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
    mealTime: "lunch",
    imageUrl: "/Image/food/food4.png",
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
    mealTime: "dinner",
    imageUrl: "/Image/food/food5.png",
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
    mealTime: "dinner",
    imageUrl: "/Image/food/food6.png",
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

  // only the dishes for the active tab
  const visibleFoods = recommendations.filter(
    (item) => item.mealTime === mealTime,
  );

  return (
    <div className="mx-auto max-w-6xl px-6 py-6">
      {/* greeting */}
      <p className="text-xl font-medium text-[#F97316]">
        ថ្ងៃព្រហស្បតិ៍ ទី២៨ ខែតុលា
      </p>
      <p className="mt-1 text-4xl font-bold leading-snug text-[#136C34]">
        អរុណសួស្តី លីតា!
      </p>

      <div className="mt-6">
        <FamilyMemberList
          members={familyMembers}
          onAddProfile={() => console.log("add profile")}
        />
      </div>

      <div className="mt-10 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-3xl font-bold leading-snug text-[#F97316]">
            មុខម្ហូបណែនាំសម្រាប់{mealTimeLabel[mealTime]}
          </p>
          <p className="mt-0.5 text-base text-slate-500">
            សម្របតាមចំណូលចិត្តរបស់ លីតា
          </p>
        </div>
        <MealTimeTabs active={mealTime} onChange={setMealTime} />
      </div>

      {/* grid re-keys on mealTime so it fades out/in when the tab changes */}
      <AnimatePresence mode="wait">
        {visibleFoods.length > 0 ? (
          <motion.div
            key={mealTime}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {visibleFoods.map((item) => (
              <FoodRecommendationCard key={item.id} item={item} />
            ))}
          </motion.div>
        ) : (
          <motion.p
            key={`${mealTime}-empty`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-10 text-center text-slate-400"
          >
            មិនទាន់មានមុខម្ហូបសម្រាប់{mealTimeLabel[mealTime]}ទេ
          </motion.p>
        )}
      </AnimatePresence>

      <div className="mt-6 flex justify-center">
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 active:scale-[0.98]"
        >
          មើលបន្ថែម
          <FaChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}