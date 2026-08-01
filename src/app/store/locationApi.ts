import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

import { baseApi } from "./baseApi";
import {
  mapBackendStore,
  type BackendStoreDto,
  type Store,
} from "@/types/store";

export const locationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStores: builder.query<Store[], void>({
      // queryFn is used so this always reads Next.js public/data/stores.json,
      // even when baseApi points to a different backend base URL.
      queryFn: async () => {
        try {
          const response = await fetch("/data/stores.json", {
            cache: "no-store",
          });

          if (!response.ok) {
            return {
              error: {
                status: response.status,
                data: await response.text(),
              } as FetchBaseQueryError,
            };
          }

          const payload = (await response.json()) as BackendStoreDto[];

          return {
            data: payload.map(mapBackendStore),
          };
        } catch (error) {
          return {
            error: {
              status: "CUSTOM_ERROR",
              error:
                error instanceof Error
                  ? error.message
                  : "Unable to load stores.json",
            } as FetchBaseQueryError,
          };
        }
      },
    }),
  }),
  overrideExisting: false,
});

export const { useGetStoresQuery } = locationApi;
