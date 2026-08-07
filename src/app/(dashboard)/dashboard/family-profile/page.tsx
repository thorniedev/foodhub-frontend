"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaChevronRight } from "react-icons/fa";
import FamilyMemberList from "@/components/dashboard/family-profile/FamilyMemberList";
// import FoodCardComponent from "@/components/ui/FoodCardComponent";
import MealTimeTabs from "@/components/dashboard/family-profile/MealTimeTabs";
import type { FamilyMember, MealTime } from "@/types/family-profile";
import type { FoodItem } from "@/types/food";
import FoodCardComponent from "@/components/FoodCardComponent";
import FoodCard from "@/components/dynamic-card/FoodCard";
import { MenuItem } from "@/types/manu";

const familyMembers: FamilyMember[] = [
  {
    id: "1",
    name: "សុខ​ ស៊ូហេង",
    role: "កូនបង",
    avatarUrl: "https://placehold.co/96x96?text=MB",
    isActive: undefined,
  },
  {
    id: "2",
    name: "សុខ​ លីតា",
    role: "កូនកណ្កាល",
    avatarUrl: "https://placehold.co/96x96?text=M",
    isActive: undefined,
  },
  {
    id: "3",
    name: "សៀវយៀក",
    role: "កូនពៅ",
    avatarUrl: "https://placehold.co/96x96?text=C",
    isActive: undefined,
  },
];

export default function FamilyPage() {
  const [mealTime, setMealTime] = useState<MealTime>("breakfast");
  // const [foods, setFoods] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [foods, setFoods] = useState<MenuItem[]>([]);
  useEffect(() => {
    fetch("/data/recommendedFoods.json")
      .then((res) => res.json())
      .then((data: MenuItem[]) => setFoods(data))
      .catch((err) => console.error("Failed to load foods:", err))
      .finally(() => setLoading(false));
  }, []);

  const mealTimeLabel: Record<MealTime, string> = {
    breakfast: "ពេលព្រឹក",
    lunch: "ពេលថ្ងៃត្រង់",
    dinner: "ពេលល្ងាច",
  };

  const visibleFoods = foods.filter((item) =>
    item.mealTypes?.some(
      (type) =>
        type.code?.toLowerCase() === mealTime ||
        type.name?.toLowerCase() === mealTime,
    ),
  );

  return (
    <div className="mx-auto max-w-6xl px-3 py-4 sm:px-6 sm:py-6">
      {/* greeting */}
      <p className="text-base font-medium text-[#F97316] sm:text-xl">
        ថ្ងៃព្រហស្បតិ៍ ទី២៨ ខែតុលា
      </p>
      <p className="mt-1 text-2xl font-bold leading-snug text-[#136C34] sm:text-4xl">
        អរុណសួស្តី លីតា!
      </p>

      <div className="mt-5 sm:mt-6">
        <FamilyMemberList
          members={familyMembers}
          onAddProfile={() => console.log("add profile")}
        />
      </div>

      <div className="mt-8 flex flex-col gap-4 sm:mt-10 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
        <div>
          <p className="text-xl font-bold leading-snug text-[#F97316] sm:text-3xl">
            មុខម្ហូបណែនាំសម្រាប់{mealTimeLabel[mealTime]}
          </p>
          <p className="mt-0.5 text-sm text-slate-500 sm:text-base">
            សម្របតាមចំណូលចិត្តរបស់ លីតា
          </p>
        </div>
        <div className="overflow-x-auto">
          <MealTimeTabs active={mealTime} onChange={setMealTime} />
        </div>
      </div>

      {loading ? (
        <p className="mt-10 text-center text-slate-400">កំពុងផ្ទុក...</p>
      ) : (
        <AnimatePresence mode="wait">
          {visibleFoods.length > 0 ? (
            <motion.div
              key={mealTime}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="mt-5 grid grid-cols-1 place-items-center gap-4 sm:grid-cols-2 sm:place-items-stretch sm:gap-5 lg:grid-cols-3 lg:w-4xl"
            >
              {visibleFoods.map((item) => (
                <FoodCard key={item.uuid} food={item} />
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
      )}

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
