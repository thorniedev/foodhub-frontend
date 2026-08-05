import type { LocationStore } from "./location-store";

export type StoreSortBy = "default" | "name-asc" | "rating" | "reviews";

export type StorePagePriceLevel = "$" | "$$" | "$$$" | "$$$$";

export interface StorePageFilters {
  cities: string[];
  districts: string[];
  provinces: string[];
  operatingStatuses: string[];
  priceLevels: string[];

  openNowOnly: boolean;
  approvedOnly: boolean;
  activeOnly: boolean;

  minimumRating: number | null;
  sortBy: StoreSortBy;
}

export interface StorePageOption {
  code: string;
  name: string;
  count: number;
}

export type FoodStore = LocationStore;

export type StorePriceLevel = LocationStore["priceLevel"];

export type StoreCardData = FoodStore;
