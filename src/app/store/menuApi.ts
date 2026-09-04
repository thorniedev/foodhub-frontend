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

export interface GetMenuItemsParams {
  /** Hard filter to only the FOOD or only the DRINK category hierarchy. */
  rootCategoryCode?: "FOOD" | "DRINK";
  page?: number;
  size?: number;
}

export interface MealTypeDto {
  id: number;
  uuid: string;
  code: string;
  name: string;
  defaultStartTime: string | null;
  defaultEndTime: string | null;
  displayOrder: number | null;
  isActive: boolean | null;
}

export interface FoodCatalogDetail {
  uuid: string;
  canonicalName: string;
  localName: string;
  description: string | null;
  categoryUuid?: string;
  categoryName?: string;
  cuisineUuid?: string;
  cuisineName?: string;
  defaultSpiceLevel?: number;
  nutritionData?: {
    calories?: number;
    fatGrams?: number;
    fiberGrams?: number;
    proteinGrams?: number;
    carbohydrateGrams?: number;
  };
  seasons?: Array<{
    uuid?: string;
    code?: string;
    name?: string;
    localName?: string | null;
    suitabilityScore?: number;
    reasonText?: string | null;
  }>;
  dietaryTypes?: Array<{
    code: string;
    name: string;
    verificationStatus?: string;
  }>;
  events?: Array<{
    uuid?: string;
    code?: string;
    name?: string;
    localName?: string | null;
    relevanceScore?: number;
    reasonText?: string | null;
  }>;
  suitableWeather?: Array<{
    uuid?: string;
    code?: string;
    name?: string;
    localName?: string | null;
    suitabilityScore?: number;
    reasonText?: string | null;
  }>;
  mealTypes?: Array<{
    uuid?: string;
    code?: string;
    name?: string;
    suitabilityScore?: number;
  }>;
  ageRules?: Array<{
    uuid?: string;
    code?: string;
    name?: string;
    minAge?: number;
    maxAge?: number;
    ruleResult?: string;
    reasonText?: string;
  }>;
}

export const menuApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // =========================================================
    // GET ALL MENU ITEMS
    // GET /api/v1/catalog/menu-items
    // =========================================================
    getMenuItems: builder.query<CatalogMenuItem[], GetMenuItemsParams | void>({
      query: (params) => ({
        url: "/catalog/menu-items",
        method: "GET",
        params: {
          page: params?.page ?? 0,
          size: params?.size ?? 1000,
          ...(params?.rootCategoryCode
            ? { rootCategoryCode: params.rootCategoryCode }
            : {}),
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
      
      // ✅ PERFORMANCE FIX: Aggressive caching for menu items (20 minutes)
      // This prevents 18+ duplicate calls across components
      keepUnusedDataFor: 1200, // 20 minutes
    }),

    // =========================================================
    // GET MENU ITEM DETAIL
    // GET /api/v1/catalog/menu-items/{uuid}/detail
    // ✅ PERFORMANCE: Cache for 5 minutes to reduce duplicate requests
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
      
      // ✅ PERFORMANCE FIX: Keep cached data for 5 minutes (300 seconds)
      // This prevents duplicate API calls for the same menu item
      keepUnusedDataFor: 300,
    }),

    // =========================================================
    // GET FOOD CATALOG DETAIL (Master Food Definition)
    // GET /api/v1/catalog/foods/{uuid}
    // ✅ PERFORMANCE: Cache for 10 minutes (food catalog rarely changes)
    // =========================================================
    getFoodCatalogByUuid: builder.query<FoodCatalogDetail, string>({
      query: (uuid) => ({
        url: `/catalog/foods/${encodeURIComponent(uuid)}`,
        method: "GET",
      }),
      transformResponse: (response: unknown): FoodCatalogDetail => {
        return normalizePayload<FoodCatalogDetail>(
          response,
          {} as FoodCatalogDetail,
        );
      },
      providesTags: (_result, _error, uuid) => [
        {
          type: "Food" as const,
          id: uuid,
        },
      ],
      
      // ✅ PERFORMANCE FIX: Cache for 10 minutes (600 seconds)
      // Food catalog data changes less frequently than menu items
      keepUnusedDataFor: 600,
    }),

    // =========================================================
    // GET ACTIVE MEAL TYPES (breakfast/lunch/dinner + their real IDs)
    // GET /api/v1/catalog/meal-types
    // =========================================================
    getMealTypes: builder.query<MealTypeDto[], void>({
      query: () => ({
        url: "/catalog/meal-types",
        method: "GET",
        params: {
          page: 0,
          size: 20,
          sort: "displayOrder",
        },
      }),

      transformResponse: (response: unknown): MealTypeDto[] => {
        return normalizeArrayPayload<MealTypeDto>(response);
      },
    }),

    // =========================================================
    // GET ALL FOOD CATALOG ITEMS (Master Foods)
    // GET /api/v1/catalog/foods
    // =========================================================
    getFoodCatalogList: builder.query<FoodCatalogDetail[], void>({
      query: () => ({
        url: "/catalog/foods",
        method: "GET",
        params: {
          page: 0,
          size: 200,
        },
      }),
      transformResponse: (response: unknown): FoodCatalogDetail[] => {
        return normalizeArrayPayload<FoodCatalogDetail>(response);
      },
      providesTags: ["Food"],
    }),
  }),

  overrideExisting: false,
});

export const {
  useGetMenuItemsQuery,
  useGetMenuItemByUuidQuery,
  useGetFoodCatalogByUuidQuery,
  useGetFoodCatalogListQuery,
  useGetMealTypesQuery,
} = menuApi;
