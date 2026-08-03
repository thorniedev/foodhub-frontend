import { LocationStore } from "@/types/location-store";
import { baseApi } from "./baseApi";



function isLocationStore(value: unknown): value is LocationStore {
  if (!value || typeof value !== "object") {
    return false;
  }

  const store = value as Partial<LocationStore>;

  return (
    typeof store.uuid === "string" &&
    typeof store.storeName === "string" &&
    typeof store.latitude === "number" &&
    Number.isFinite(store.latitude) &&
    typeof store.longitude === "number" &&
    Number.isFinite(store.longitude)
  );
}

export const locationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStores: builder.query<LocationStore[], void>({
      query: () => "data/stores.json",

      transformResponse: (response: unknown): LocationStore[] => {
        if (!Array.isArray(response)) {
          console.error(
            "[locationApi] Expected stores.json to contain an array.",
            response,
          );

          return [];
        }

        const validStores = response.filter(isLocationStore);

        if (validStores.length !== response.length) {
          console.warn(
            `[locationApi] Ignored ${
              response.length - validStores.length
            } invalid store record(s).`,
          );
        }

        return validStores;
      },
    }),
  }),

  // Helpful while editing with Next.js Fast Refresh.
  overrideExisting: true,
});

export const { useGetStoresQuery } = locationApi;
