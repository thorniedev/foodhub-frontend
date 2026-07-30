import { baseApi } from "./baseApi";
import { MenuItem } from "@/types/menu-item";

export const foodApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMenuItems: builder.query<MenuItem[], void>({
      query: () => "/food/menuItems.json",
      transformResponse: (response: { menuItems: MenuItem[] }) =>
        response.menuItems,
    }),

    getMenuItemById: builder.query<MenuItem, string>({
      query: (uuid) => `/food/menuItems.json`,

      transformResponse: (
        response: {
          menuItems: MenuItem[];
        },
        meta,
        id,
      ) => {
        return response.menuItems.find((item) => item.uuid === id) as MenuItem;
      },
    }),
  }),
});

export const { useGetMenuItemsQuery, useGetMenuItemByIdQuery } = foodApi;
