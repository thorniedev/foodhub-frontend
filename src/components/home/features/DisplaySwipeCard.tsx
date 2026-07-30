import { useGetMenuItemsQuery } from "@/app/store/menuApi";
import React from "react";
import SwipeCardTinderStyle from "./SwipeCardTinderStyle";
import SpinFood from "./SpinFood";

export default function DisplaySwipeCard() {
  const {
    data: recommendedFoods = [],
    isLoading,
    isError,
  } = useGetMenuItemsQuery();
  return (
    <div>
      <SwipeCardTinderStyle foods={recommendedFoods} />
      <SpinFood />
    </div>
  );
}
