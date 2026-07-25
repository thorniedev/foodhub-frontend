import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { FoodItem } from "@/app/types/food";

export const foodApi = createApi({
  reducerPath: "foodApi",
  baseQuery: fetchBaseQuery({ baseUrl: "" }), // empty, not "/"
  tagTypes: ["Food"],
  endpoints: (builder) => ({
    getFoods: builder.query<FoodItem[], void>({
      query: () => "/data/recommendedFoods.json", // leading slash here instead
      providesTags: ["Food"],
    }),
    getFoodById: builder.query<FoodItem | undefined, number>({
      query: () => "/data/recommendedFoods.json",
      transformResponse: (response: FoodItem[], _meta, id) =>
        response.find((food) => food.id === id),
    }),
  }),
});

export const { useGetFoodsQuery, useGetFoodByIdQuery } = foodApi;
