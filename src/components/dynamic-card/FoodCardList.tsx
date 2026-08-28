"use client";

import { useGetMenuItemsQuery } from "@/app/store/menuApi";

import FoodCard from "./FoodCard";

export default function FoodCardList() {
  const {
    data: menuItems = [],
    isLoading,
    isError,
    error,
  } = useGetMenuItemsQuery();

  if (isLoading) {
    return (
      <div className="py-20 text-center text-gray-500">
        កំពុងទាញយកមុខម្ហូប...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-20 text-center text-red-500">
        <p>មិនអាចទាញយកមុខម្ហូបបានទេ</p>

        <pre className="mt-3 text-base">{JSON.stringify(error, null, 2)}</pre>
      </div>
    );
  }

  if (menuItems.length === 0) {
    return (
      <div className="py-20 text-center text-gray-500">មិនមានមុខម្ហូបទេ</div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 w-full">
      {menuItems.map((food) => (
        <FoodCard key={food.uuid} food={food} />
      ))}
    </div>
  );
}
