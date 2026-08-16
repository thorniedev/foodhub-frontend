import { baseApi } from "./baseApi";

import type {
  FoodStore,
  FoodStoreDetail,
  StoreListResponse,
  StoreOpeningHour,
  StoreOperatingStatus,
} from "@/types/store-page";

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function unwrapPayload(value: unknown): unknown {
  if (!isRecord(value)) {
    return value;
  }

  if (
    "payload" in value &&
    value.payload !== undefined &&
    value.payload !== null
  ) {
    return value.payload;
  }

  if ("data" in value && value.data !== undefined && value.data !== null) {
    return value.data;
  }

  return value;
}

function asString(value: unknown, fallback = ""): string {
  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return fallback;
}

function asNullableString(value: unknown): string | null {
  const result = asString(value).trim();
  return result ? result : null;
}

function asNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  return fallback;
}

function asNullableNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = asNumber(value, Number.NaN);
  return Number.isFinite(parsed) ? parsed : null;
}

function asBoolean(value: unknown, fallback = false): boolean {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value === 1 ? true : value === 0 ? false : fallback;
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

  return fallback;
}

function normalizeOperatingStatus(value: unknown): StoreOperatingStatus {
  return (asString(value, "UNKNOWN").toUpperCase() ||
    "UNKNOWN") as StoreOperatingStatus;
}

function normalizeStoreListItem(value: unknown): FoodStore | null {
  if (!isRecord(value)) {
    return null;
  }

  const uuid = asString(value.uuid);
  const storeName = asString(value.storeName);

  if (!uuid || !storeName) {
    return null;
  }

  return {
    uuid,
    storeName,
    addressLine: asNullableString(value.addressLine),
    city: asNullableString(value.city),
    province: asNullableString(value.province),
    latitude: asNumber(value.latitude),
    longitude: asNumber(value.longitude),
    distanceMeters: asNullableNumber(value.distanceMeters),
    averageRating: asNumber(value.averageRating),
    totalReviews: asNumber(value.totalReviews),
    operatingStatus: normalizeOperatingStatus(value.operatingStatus),
    isOpenNow: asBoolean(value.isOpenNow),
    logoMediaUuid: asNullableString(value.logoMediaUuid),
  };
}

function normalizeOpeningHours(value: unknown): StoreOpeningHour[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (!isRecord(item)) {
      return [];
    }

    return [
      {
        storeUuid: asString(item.storeUuid),
        scheduleType: asString(item.scheduleType),
        dayOfWeek: asNullableNumber(item.dayOfWeek),
        businessDate: asNullableString(item.businessDate),
        openingTime: asNullableString(item.openingTime),
        closingTime: asNullableString(item.closingTime),
        intervalOrder: asNumber(item.intervalOrder, 1),
        isClosed: asBoolean(item.isClosed),
        reason: asNullableString(item.reason),
      },
    ];
  });
}

function normalizeStoreDetail(value: unknown): FoodStoreDetail | null {
  const unwrapped = unwrapPayload(value);

  if (!isRecord(unwrapped)) {
    return null;
  }

  const uuid = asString(unwrapped.uuid);
  const storeName = asString(unwrapped.storeName);

  if (!uuid || !storeName) {
    return null;
  }

  const rawPriceLevel = unwrapped.priceLevel;
  const priceLevel =
    rawPriceLevel === null ||
    rawPriceLevel === undefined ||
    rawPriceLevel === ""
      ? null
      : typeof rawPriceLevel === "number"
        ? rawPriceLevel
        : asString(rawPriceLevel);

  return {
    uuid,
    storeName,
    description: asNullableString(unwrapped.description),
    addressLine: asNullableString(unwrapped.addressLine),
    commune: asNullableString(unwrapped.commune),
    district: asNullableString(unwrapped.district),
    city: asNullableString(unwrapped.city),
    province: asNullableString(unwrapped.province),
    countryCode: asNullableString(unwrapped.countryCode),
    postalCode: asNullableString(unwrapped.postalCode),
    timezone: asNullableString(unwrapped.timezone),
    latitude: asNumber(unwrapped.latitude),
    longitude: asNumber(unwrapped.longitude),
    phoneNumber: asNullableString(unwrapped.phoneNumber),
    email: asNullableString(unwrapped.email),
    logoMediaUuid: asNullableString(unwrapped.logoMediaUuid),
    coverMediaUuid: asNullableString(unwrapped.coverMediaUuid),
    priceLevel,
    hygieneRating: asNullableNumber(unwrapped.hygieneRating),
    averageRating: asNumber(unwrapped.averageRating),
    totalReviews: asNumber(unwrapped.totalReviews),
    reviewStatus: asNullableString(unwrapped.reviewStatus),
    operatingStatus: normalizeOperatingStatus(unwrapped.operatingStatus),
    accountStatus: asNullableString(unwrapped.accountStatus),
    isOpenNow: asBoolean(unwrapped.isOpenNow),
    socialLinks: Array.isArray(unwrapped.socialLinks)
      ? unwrapped.socialLinks
      : [],
    openingHours: normalizeOpeningHours(unwrapped.openingHours),
    createdAt: asString(unwrapped.createdAt),
    updatedAt: asString(unwrapped.updatedAt),
  };
}

function extractStorePage(response: unknown): StoreListResponse {
  const unwrapped = unwrapPayload(response);

  if (Array.isArray(unwrapped)) {
    const contents = unwrapped
      .map(normalizeStoreListItem)
      .filter((store): store is FoodStore => store !== null);

    return {
      contents,
      pageNumber: 0,
      pageSize: contents.length,
      totalElements: contents.length,
      totalPages: contents.length > 0 ? 1 : 0,
      first: true,
      last: true,
    };
  }

  if (!isRecord(unwrapped)) {
    return {
      contents: [],
      pageNumber: 0,
      pageSize: 0,
      totalElements: 0,
      totalPages: 0,
      first: true,
      last: true,
    };
  }

  const rawContents = Array.isArray(unwrapped.contents)
    ? unwrapped.contents
    : Array.isArray(unwrapped.content)
      ? unwrapped.content
      : [];

  const contents = rawContents
    .map(normalizeStoreListItem)
    .filter((store): store is FoodStore => store !== null);

  return {
    contents,
    pageNumber: asNumber(unwrapped.pageNumber ?? unwrapped.number),
    pageSize: asNumber(unwrapped.pageSize ?? unwrapped.size, contents.length),
    totalElements: asNumber(unwrapped.totalElements, contents.length),
    totalPages: asNumber(unwrapped.totalPages, contents.length > 0 ? 1 : 0),
    first: asBoolean(unwrapped.first, true),
    last: asBoolean(unwrapped.last, true),
  };
}

export const locationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * GET /api/v1/stores?page=0&size=100
     *
     * StoreContent expects an array, so transform the backend page's contents[].
     */
    getStores: builder.query<FoodStore[], void>({
      query: () => ({
        url: "/stores",
        method: "GET",
        params: {
          page: 0,
          size: 100,
        },
      }),
      transformResponse: (response: unknown): FoodStore[] =>
        extractStorePage(response).contents,
      providesTags: ["NearbyStore"],
      keepUnusedDataFor: 60,
    }),

    /**
     * GET /api/v1/stores/nearby?latitude={latitude}&longitude={longitude}&page=0&size=100
     */
    getNearbyStores: builder.query<
      FoodStore[],
      { latitude: number; longitude: number; page?: number; size?: number }
    >({
      query: ({ latitude, longitude, page = 0, size = 100 }) => ({
        url: "/stores/nearby",
        method: "GET",
        params: {
          latitude,
          longitude,
          page,
          size,
        },
      }),
      transformResponse: (response: unknown): FoodStore[] =>
        extractStorePage(response).contents,
      providesTags: ["NearbyStore"],
      keepUnusedDataFor: 60,
    }),

    /** GET /api/v1/stores/{uuid} */
    getStoreByUuid: builder.query<FoodStoreDetail | null, string>({
      query: (storeUuid) => ({
        url: `/stores/${encodeURIComponent(storeUuid)}`,
        method: "GET",
      }),
      transformResponse: (response: unknown): FoodStoreDetail | null =>
        normalizeStoreDetail(response),
      providesTags: (_result, _error, storeUuid) => [
        {
          type: "NearbyStore",
          id: storeUuid,
        },
      ],
      keepUnusedDataFor: 60,
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetStoresQuery,
  useGetNearbyStoresQuery,
  useGetStoreByUuidQuery,
} = locationApi;
