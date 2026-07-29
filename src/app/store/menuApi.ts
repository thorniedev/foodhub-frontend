import { MenuItem, MenuItemsResponse } from "@/types/manu";
import { baseApi } from "./baseApi";

export const menuApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMenuItems: builder.query<MenuItem[], void>({
      query: () => ({
        url: "/data/manuItem.json",
        method: "GET",
      }),

      transformResponse: (response: MenuItemsResponse): MenuItem[] => {
        return response.menuItems ?? [];
      },

      providesTags: (result) =>
        result
          ? [
              ...result.map((item) => ({
                type: "MenuItem" as const,
                id: item.uuid,
              })),
              {
                type: "MenuItem" as const,
                id: "LIST",
              },
            ]
          : [
              {
                type: "MenuItem" as const,
                id: "LIST",
              },
            ],
    }),
  }),

  overrideExisting: false,
});

export const { useGetMenuItemsQuery } = menuApi;
