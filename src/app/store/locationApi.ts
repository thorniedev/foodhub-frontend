import type { FoodStore } from "@/types/store-page";

import { baseApi } from "./baseApi";

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readValue(source: UnknownRecord, ...keys: string[]): unknown {
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      return source[key];
    }
  }

  return undefined;
}

function toStringValue(value: unknown, fallback = ""): string {
  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return fallback;
}

function toRequiredString(value: unknown, fallback = ""): string {
  const result = toStringValue(value);

  return result || fallback;
}

function toNumberValue(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
}

function toNullableNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = toNumberValue(value, Number.NaN);

  return Number.isFinite(parsed) ? parsed : null;
}

function toNullableBoolean(value: unknown): boolean | null {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    if (value === 1) {
      return true;
    }

    if (value === 0) {
      return false;
    }
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();

    if (normalized === "true" || normalized === "1") {
      return true;
    }

    if (normalized === "false" || normalized === "0") {
      return false;
    }
  }

  return null;
}

function asStoreField<K extends keyof FoodStore>(value: unknown): FoodStore[K] {
  return value as FoodStore[K];
}

function normalizeReviewStatus(value: unknown): FoodStore["reviewStatus"] {
  return asStoreField<"reviewStatus">(
    toRequiredString(value, "PENDING").toUpperCase(),
  );
}

function normalizeOperatingStatus(
  value: unknown,
): FoodStore["operatingStatus"] {
  return asStoreField<"operatingStatus">(
    toRequiredString(value, "UNKNOWN").toUpperCase(),
  );
}

function normalizeAccountStatus(value: unknown): FoodStore["accountStatus"] {
  return asStoreField<"accountStatus">(
    toRequiredString(value, "ACTIVE").toUpperCase(),
  );
}

function normalizePriceLevel(value: unknown): FoodStore["priceLevel"] {
  return asStoreField<"priceLevel">(toNullableNumber(value));
}

function normalizeIsOpenNow(value: unknown): FoodStore["isOpenNow"] {
  return asStoreField<"isOpenNow">(toNullableBoolean(value));
}

function normalizeSocialLinks(value: unknown): FoodStore["socialLinks"] {
  return asStoreField<"socialLinks">(Array.isArray(value) ? value : []);
}

function normalizeOpeningHours(value: unknown): FoodStore["openingHours"] {
  return asStoreField<"openingHours">(Array.isArray(value) ? value : []);
}

function normalizeExternalSource(value: unknown): FoodStore["externalSource"] {
  return asStoreField<"externalSource">(value ?? null);
}

function extractStoreList(response: unknown): unknown[] {
  if (Array.isArray(response)) {
    return response;
  }

  if (!isRecord(response)) {
    return [];
  }

  const listKeys = ["content", "contents", "items", "results", "stores"];

  for (const key of listKeys) {
    const candidate = response[key];

    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  if ("data" in response) {
    return extractStoreList(response.data);
  }

  return [];
}

function extractStoreDetail(response: unknown): unknown {
  if (!isRecord(response)) {
    return response;
  }

  if ("data" in response && isRecord(response.data)) {
    return response.data;
  }

  return response;
}

function normalizeStore(value: unknown): FoodStore | null {
  if (!isRecord(value)) {
    return null;
  }

  const uuid = toRequiredString(readValue(value, "uuid"));

  const storeName = toRequiredString(
    readValue(value, "storeName", "store_name", "name"),
  );

  if (!uuid || !storeName) {
    return null;
  }

  const latitude = toNumberValue(
    readValue(value, "latitude", "lat"),
    Number.NaN,
  );

  const longitude = toNumberValue(
    readValue(value, "longitude", "lng", "lon"),
    Number.NaN,
  );

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  const store = {
    uuid,

    storeName,

    description: toRequiredString(readValue(value, "description")),

    addressLine: toRequiredString(
      readValue(value, "addressLine", "address_line"),
    ),

    commune: toRequiredString(readValue(value, "commune")),

    district: toRequiredString(readValue(value, "district")),

    city: toRequiredString(readValue(value, "city")),

    province: toRequiredString(readValue(value, "province")),

    countryCode: toRequiredString(
      readValue(value, "countryCode", "country_code"),
      "KH",
    ),

    postalCode: toRequiredString(readValue(value, "postalCode", "postal_code")),

    timezone: toRequiredString(readValue(value, "timezone"), "Asia/Phnom_Penh"),

    latitude,

    longitude,

    phoneNumber: toRequiredString(
      readValue(value, "phoneNumber", "phone_number"),
    ),

    email: toRequiredString(readValue(value, "email")),

    logoMediaUuid: toRequiredString(
      readValue(value, "logoMediaUuid", "logo_media_uuid"),
    ),

    coverMediaUuid: toRequiredString(
      readValue(value, "coverMediaUuid", "cover_media_uuid"),
    ),

    logoUrl: toRequiredString(readValue(value, "logoUrl", "logo_url")),

    coverImageUrl: toRequiredString(
      readValue(value, "coverImageUrl", "cover_image_url"),
    ),

    priceLevel: normalizePriceLevel(
      readValue(value, "priceLevel", "price_level"),
    ),

    hygieneRating: toNullableNumber(
      readValue(value, "hygieneRating", "hygiene_rating"),
    ),

    averageRating: toNumberValue(
      readValue(value, "averageRating", "average_rating"),
      0,
    ),

    totalReviews: Math.max(
      0,
      Math.trunc(
        toNumberValue(readValue(value, "totalReviews", "total_reviews"), 0),
      ),
    ),

    reviewStatus: normalizeReviewStatus(
      readValue(value, "reviewStatus", "review_status"),
    ),

    operatingStatus: normalizeOperatingStatus(
      readValue(value, "operatingStatus", "operating_status"),
    ),

    accountStatus: normalizeAccountStatus(
      readValue(value, "accountStatus", "account_status"),
    ),

    isOpenNow: normalizeIsOpenNow(readValue(value, "isOpenNow", "is_open_now")),

    socialLinks: normalizeSocialLinks(
      readValue(value, "socialLinks", "social_links"),
    ),

    openingHours: normalizeOpeningHours(
      readValue(value, "openingHours", "opening_hours"),
    ),

    externalSource: normalizeExternalSource(
      readValue(value, "externalSource", "external_source"),
    ),
  } as FoodStore;

  return store;
}

export const locationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStores: builder.query<FoodStore[], void>({
      query: () => ({
        url: "/stores",

        method: "GET",

        params: {
          page: 0,
          size: 100,
        },
      }),

      transformResponse: (response: unknown): FoodStore[] => {
        return extractStoreList(response)
          .map(normalizeStore)
          .filter((store): store is FoodStore => store !== null);
      },

      providesTags: ["NearbyStore"],

      keepUnusedDataFor: 60,
    }),

    getStoreByUuid: builder.query<FoodStore | null, string>({
      query: (storeUuid) => ({
        url: `/stores/${encodeURIComponent(storeUuid)}`,

        method: "GET",
      }),

      transformResponse: (response: unknown): FoodStore | null => {
        return normalizeStore(extractStoreDetail(response));
      },

      providesTags: ["NearbyStore"],

      keepUnusedDataFor: 60,
    }),
  }),

  overrideExisting: false,
});

export const { useGetStoresQuery, useGetStoreByUuidQuery } = locationApi;
