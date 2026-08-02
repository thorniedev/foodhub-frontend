import { FoodItem } from "@/types/food";
import { baseApi } from "./baseApi";

export const foodApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFoods: builder.query<FoodItem[], void>({
      query: () => "/data/recommendedFoods.json",
      providesTags: ["Food"],
    }),
    getFoodById: builder.query<FoodItem | undefined, number>({
      query: () => "/data/recommendedFoods.json",
      transformResponse: (response: FoodItem[], _meta, id) =>
        response.find((food) => food.id === id),
    }),
  }),
  overrideExisting: false,
});

export const { useGetFoodsQuery, useGetFoodByIdQuery } = foodApi;
