import { baseApi } from "./baseApi";
import { MenuItem } from "@/types/menu-item";

export const foodApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMenuItems: builder.query<MenuItem[], void>({
      query: () => ({
        url: "/catalog/menu-items",
        method: "GET",
        params: { page: 0, size: 100 },
      }),
      transformResponse: (response: { payload?: { content?: MenuItem[] } }) =>
        response.payload?.content ?? [],
    }),

    getMenuItemById: builder.query<MenuItem, string>({
      query: (uuid) => `/catalog/menu-items/${encodeURIComponent(uuid)}/detail`,
      transformResponse: (response: { payload?: MenuItem }) =>
        response.payload as MenuItem,
    }),
  }),
});

export const { useGetMenuItemsQuery, useGetMenuItemByIdQuery } = foodApi;
