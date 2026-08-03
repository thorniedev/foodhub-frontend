import type {
  FoodStore,
  StorePageFilters,
  StorePageOption,
} from "@/types/store-page";

export const DEFAULT_STORE_FILTERS: StorePageFilters = {
  cities: [],
  districts: [],
  provinces: [],
  operatingStatuses: [],
  priceLevels: [],

  openNowOnly: false,
  approvedOnly: false,
  activeOnly: false,

  minimumRating: null,
  sortBy: "default",
};

export function normalizeStoreText(value?: string | number | null): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFKC");
}

export function normalizeStoreImageUrl(value?: string | null): string | null {
  const trimmed = value?.trim();

  if (!trimmed) {
    return null;
  }

  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("/")
  ) {
    return trimmed;
  }

  return `/${trimmed}`;
}

export function toggleStoreFilterValue(
  values: string[],
  value: string,
): string[] {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

export function getStoreFilterOptions(
  stores: FoodStore[],
  getValue: (store: FoodStore) => string | number | null | undefined,
): StorePageOption[] {
  const optionMap = new Map<string, StorePageOption>();

  stores.forEach((store) => {
    const rawValue = getValue(store);

    if (
      rawValue === null ||
      rawValue === undefined ||
      String(rawValue).trim() === ""
    ) {
      return;
    }

    const code = String(rawValue);
    const existing = optionMap.get(code);

    if (existing) {
      existing.count += 1;
      return;
    }

    optionMap.set(code, {
      code,
      name: code,
      count: 1,
    });
  });

  return Array.from(optionMap.values()).sort((first, second) =>
    first.name.localeCompare(second.name),
  );
}

function matchesStoreSearch(store: FoodStore, searchQuery: string): boolean {
  const query = normalizeStoreText(searchQuery);

  if (!query) {
    return true;
  }

  const searchableValues = [
    store.storeName,
    store.description,
    store.addressLine,
    store.commune,
    store.district,
    store.city,
    store.province,
    store.countryCode,
    store.postalCode,
    store.phoneNumber,
    store.email,
    store.reviewStatus,
    store.operatingStatus,
    store.accountStatus,
    store.priceLevel,
    store.hygieneRating,
    store.averageRating,
  ];

  return searchableValues.some((value) =>
    normalizeStoreText(value).includes(query),
  );
}

export function applyStoreFilters(
  stores: FoodStore[],
  searchQuery: string,
  filters: StorePageFilters,
): FoodStore[] {
  const filteredStores = stores.filter((store) => {
    if (!matchesStoreSearch(store, searchQuery)) {
      return false;
    }

    if (filters.openNowOnly && store.isOpenNow !== true) {
      return false;
    }

    if (filters.approvedOnly && store.reviewStatus !== "APPROVED") {
      return false;
    }

    if (filters.activeOnly && store.accountStatus !== "ACTIVE") {
      return false;
    }

    if (
      filters.cities.length > 0 &&
      (!store.city || !filters.cities.includes(store.city))
    ) {
      return false;
    }

    if (
      filters.districts.length > 0 &&
      (!store.district || !filters.districts.includes(store.district))
    ) {
      return false;
    }

    if (
      filters.provinces.length > 0 &&
      (!store.province || !filters.provinces.includes(store.province))
    ) {
      return false;
    }

    if (
      filters.operatingStatuses.length > 0 &&
      !filters.operatingStatuses.includes(store.operatingStatus)
    ) {
      return false;
    }

    if (
      filters.priceLevels.length > 0 &&
      (store.priceLevel === null ||
        !filters.priceLevels.includes(String(store.priceLevel)))
    ) {
      return false;
    }

    if (
      filters.minimumRating !== null &&
      store.averageRating < filters.minimumRating
    ) {
      return false;
    }

    return true;
  });

  return [...filteredStores].sort((first, second) => {
    switch (filters.sortBy) {
      case "name-asc":
        return first.storeName.localeCompare(second.storeName);

      case "rating":
        return second.averageRating - first.averageRating;

      case "reviews":
        return second.totalReviews - first.totalReviews;

      case "default":
      default:
        return 0;
    }
  });
}

export function countActiveStoreFilters(filters: StorePageFilters): number {
  return (
    filters.cities.length +
    filters.districts.length +
    filters.provinces.length +
    filters.operatingStatuses.length +
    filters.priceLevels.length +
    (filters.openNowOnly ? 1 : 0) +
    (filters.approvedOnly ? 1 : 0) +
    (filters.activeOnly ? 1 : 0) +
    (filters.minimumRating !== null ? 1 : 0) +
    (filters.sortBy !== "default" ? 1 : 0)
  );
}

export function getStoreStatusLabel(store: FoodStore): string {
  if (store.isOpenNow === true) {
    return "បើកឥឡូវនេះ";
  }

  if (store.isOpenNow === false) {
    return "បានបិទ";
  }

  switch (store.operatingStatus) {
    case "OPEN":
      return "បើក";
    case "CLOSED":
      return "បានបិទ";
    case "TEMPORARILY_CLOSED":
      return "បិទជាបណ្ដោះអាសន្ន";
    case "UNKNOWN":
    default:
      return "មិនទាន់ដឹងស្ថានភាព";
  }
}

export function isStoreOpen(store: FoodStore): boolean {
  return store.isOpenNow === true || store.operatingStatus === "OPEN";
}

export function formatStorePriceLevel(
  value: FoodStore["priceLevel"],
): string | null {
  if (value === null || value === undefined || String(value).trim() === "") {
    return null;
  }

  if (typeof value === "number") {
    if (value <= 0) {
      return null;
    }

    return "$".repeat(Math.min(Math.round(value), 4));
  }

  return String(value);
}
