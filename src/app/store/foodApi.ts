import { FoodItem } from "@/types/food";
import { baseApi } from "./baseApi";
import { normalizeArrayPayload, normalizePayload } from "./utils/normalize";
import type { CatalogMenuItem } from "@/types/catalog-menu-item";

export const foodApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFoods: builder.query<FoodItem[], void>({
      query: () => ({
        url: "/catalog/menu-items",
        method: "GET",
        params: { page: 0, size: 100 },
      }),
      providesTags: ["Food"],
      transformResponse: (response: unknown) => {
        const items = normalizeArrayPayload<CatalogMenuItem>(response);
        return items.map((item, index) => ({
          id: item.legacyId || index + 1,
          mealTime: (item.food?.mealTypes?.[0]?.code?.toLowerCase() as any) || "lunch",
          store: item.store?.name || "Store",
          name: item.localName || item.name,
          description: item.localDescription || item.description || "",
          rating: item.store?.averageRating || 0,
          time: item.preparationTimeMinutes ? `${item.preparationTimeMinutes} min` : "10 min",
          distance: item.distanceKm ? `${item.distanceKm} km` : "1 km",
          price: String(item.price),
          tags: item.food?.dietaryTypes?.map((d) => d.name) || [],
          dietaryTypes: item.food?.dietaryTypes || [],
          foodTypes: item.food?.category ? [item.food.category.name] : [],
          drinkTypes: [],
          ageGroups: item.food?.ageGroups?.map((a) => a.name) || [],
          image: item.thumbnail || "/Image/default-food.png",
        }));
      },
    }),
    getFoodById: builder.query<FoodItem | undefined, number | string>({
      query: (uuid) => `/catalog/menu-items/${encodeURIComponent(String(uuid))}/detail`,
      transformResponse: (response: unknown) => {
        const item = normalizePayload<CatalogMenuItem | null>(response, null);
        if (!item) return undefined;
        return {
          id: item.legacyId || 1,
          mealTime: (item.food?.mealTypes?.[0]?.code?.toLowerCase() as any) || "lunch",
          store: item.store?.name || "Store",
          name: item.localName || item.name,
          description: item.localDescription || item.description || "",
          rating: item.store?.averageRating || 0,
          time: item.preparationTimeMinutes ? `${item.preparationTimeMinutes} min` : "10 min",
          distance: item.distanceKm ? `${item.distanceKm} km` : "1 km",
          price: String(item.price),
          tags: item.food?.dietaryTypes?.map((d) => d.name) || [],
          dietaryTypes: item.food?.dietaryTypes || [],
          foodTypes: item.food?.category ? [item.food.category.name] : [],
          drinkTypes: [],
          ageGroups: item.food?.ageGroups?.map((a) => a.name) || [],
          image: item.thumbnail || "/Image/default-food.png",
        };
      },
    }),
  }),
  overrideExisting: true,
});

export const { useGetFoodsQuery, useGetFoodByIdQuery } = foodApi;
