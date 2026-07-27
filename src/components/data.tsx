"use client";

import { useEffect, useState } from "react";
import type { FoodItem } from "@/app/types/food";

export default function RecommandSection() {
  const [foods, setFoods] = useState<FoodItem[]>([]);

  useEffect(() => {
    async function loadFoods() {
      const res = await fetch("/data/filtering.json");
      const data = await res.json();
      setFoods(data);
    }

    loadFoods();
  }, []);

  return (
    <div>
      {foods.map((food) => (
        <div key={food.id}>{food.name}</div>
      ))}
    </div>
  );
}
