export type CatalogOperatingStatus = "OPEN" | "CLOSED";

export type CatalogAvailabilityStatus = "AVAILABLE" | "UNAVAILABLE";

export interface CatalogCodeName {
  code: string;
  name: string;
}

export interface CatalogMenuItemStore {
  uuid: string;
  name: string;
  operatingStatus: CatalogOperatingStatus;
  averageRating: number;
  latitude: number;
  longitude: number;
}

export interface CatalogMenuItemFilterData {
  category: CatalogCodeName;
  cuisine: CatalogCodeName;
  spiceLevel: number;
  mealTypes: CatalogCodeName[];
  ageGroups: CatalogCodeName[];
}

/**
 * Exact menu-item list shape used by the current catalog endpoint.
 *
 * The sample response currently contains empty arrays for ingredients,
 * dietaryTypes and allergenDeclarations, so their inner object shapes
 * cannot be inferred safely from that sample alone.
 */
export interface CatalogMenuItem {
  id: number;
  uuid: string;
  storeId: number;

  store: CatalogMenuItemStore;

  foodUuid: string | null;
  foodName: string | null;

  name: string;
  localName: string | null;
  description: string | null;

  primaryMediaId: number | null;
  thumbnail: string | null;

  price: number;
  currencyCode: string;
  preparationTimeMinutes: number | null;

  availabilityStatus: CatalogAvailabilityStatus;
  ingredientDataStatus: string;

  isFeatured: boolean;
  source: string;
  createdBy: number | null;

  filterData: CatalogMenuItemFilterData;

  availabilityUpdatedAt: string | null;
  createdAt: string;
  updatedAt: string;

  ingredients: unknown[];
  dietaryTypes: unknown[];
  allergenDeclarations: unknown[];
}

export interface CatalogPageSort {
  empty: boolean;
  sorted: boolean;
  unsorted: boolean;
}

export interface CatalogPageable {
  offset: number;
  pageNumber: number;
  pageSize: number;
  paged: boolean;
  sort: CatalogPageSort;
  unpaged: boolean;
}

export interface CatalogMenuItemsPayload {
  content: CatalogMenuItem[];

  empty: boolean;
  first: boolean;
  last: boolean;

  number: number;
  numberOfElements: number;

  pageable: CatalogPageable;

  size: number;
  sort: CatalogPageSort;

  totalElements: number;
  totalPages: number;
}

export interface CatalogMenuItemsResponse {
  status: number;
  message: string;
  payload: CatalogMenuItemsPayload;
  timestamp: string;
}
