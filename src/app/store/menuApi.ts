/* import { MenuItem, MenuItemsResponse } from "@/types/manu";
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
 */
import type { MenuItem, MenuItemsResponse } from "@/types/manu";

import { baseApi } from "./baseApi";

export const menuApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMenuItems: builder.query<MenuItem[], void>({
      query: () => ({
        url: "/data/manuItem1.json",
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

    getMenuItemByUuid: builder.query<MenuItem | null, string>({
      query: () => ({
        url: "/data/manuItem.json",
        method: "GET",
      }),

      transformResponse: (
        response: MenuItemsResponse,
        _meta,
        uuid,
      ): MenuItem | null => {
        return response.menuItems.find((item) => item.uuid === uuid) ?? null;
      },

      providesTags: (_result, _error, uuid) => [
        {
          type: "MenuItem" as const,
          id: uuid,
        },
      ],
    }),
  }),

  overrideExisting: false,
});

export const { useGetMenuItemsQuery, useGetMenuItemByUuidQuery } = menuApi;
