import type {
  CatalogMenuItem,
  CatalogMenuItemsResponse,
} from "@/types/catalog-menu-item";

import type {
  CatalogMenuItemDetail,
  CatalogMenuItemDetailResponse,
  GetCatalogMenuItemDetailParams,
} from "@/types/catalog-menu-item-detail";

import { baseApi } from "./baseApi";
import { normalizeArrayPayload, normalizePayload } from "./utils/normalize";

type MenuItemDetailQueryArg = string | GetCatalogMenuItemDetailParams;

export const menuApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // =========================================================
    // GET ALL MENU ITEMS
    // GET /api/v1/catalog/menu-items
    // =========================================================
    getMenuItems: builder.query<CatalogMenuItem[], void>({
      query: () => ({
        url: "/catalog/menu-items",
        method: "GET",
        params: {
          page: 0,
          size: 100,
        },
      }),

      transformResponse: (
        response: unknown,
      ): CatalogMenuItem[] => {
        return normalizeArrayPayload<CatalogMenuItem>(response);
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

    // =========================================================
    // GET MENU ITEM DETAIL
    // GET /api/v1/catalog/menu-items/{uuid}/detail
    // =========================================================
    getMenuItemByUuid: builder.query<
      CatalogMenuItemDetail,
      MenuItemDetailQueryArg
    >({
      query: (arg) => {
        if (typeof arg === "string") {
          return {
            url: `/catalog/menu-items/${encodeURIComponent(arg)}/detail`,
            method: "GET",
          };
        }

        const { uuid, sessionUuid, latitude, longitude } = arg;

        return {
          url: `/catalog/menu-items/${encodeURIComponent(uuid)}/detail`,
          method: "GET",

          params: {
            ...(sessionUuid ? { sessionUuid } : {}),
            ...(latitude !== undefined ? { latitude } : {}),
            ...(longitude !== undefined ? { longitude } : {}),
          },
        };
      },

      transformResponse: (
        response: unknown,
      ): CatalogMenuItemDetail => {
        return normalizePayload<CatalogMenuItemDetail>(response, {} as CatalogMenuItemDetail);
      },

      providesTags: (_result, _error, arg) => {
        const uuid = typeof arg === "string" ? arg : arg.uuid;

        return [
          {
            type: "MenuItem" as const,
            id: uuid,
          },
        ];
      },
    }),
  }),

  overrideExisting: false,
});

export const { useGetMenuItemsQuery, useGetMenuItemByUuidQuery } = menuApi;
