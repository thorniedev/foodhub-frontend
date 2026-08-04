import { RestaurantDetail } from "@/types/restaurant";
import { baseApi } from "./baseApi";

export const restaurantApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRestaurants: builder.query<RestaurantDetail[], void>({
      query: () => "/data/restaurantDetail.json",
  /*     providesTags: ["Restaurant"], */
    }),
    getRestaurantById: builder.query<RestaurantDetail | undefined, number>({
      query: () => "/data/restaurantDetail.json",
      transformResponse: (response: RestaurantDetail[], _meta, id) =>
        response.find((restaurant) => restaurant.id === id),
      // providesTags: (_result, _error, id) => [{ type: "Restaurant", id }],
    }),
  }),
  overrideExisting: false,
});

export const { useGetRestaurantsQuery, useGetRestaurantByIdQuery } =
  restaurantApi;
