import type { MenuItem } from "@/types/manu";
import type { RecommendedStore } from "@/types/location";
import { DEFAULT_FOOD_IMAGE, toFrontendApiAssetUrl } from "@/lib/catalog-media";

/**
 * One menu item shown on the location tab, carrying the store it belongs to so
 * selecting the card can move the map to that store.
 */
export interface StoreMenuItemCard {
  key: string;
  menuItemUuid: string;
  foodUuid?: string;
  name: string;
  localName?: string;
  thumbnail: string | null;
  price: number | null;
  currencyCode: string;
  dietaryTypes: string[];
  allergens?: string[];
  storeUuid: string;
  storeName: string;
  storeAddress: string;
  distanceKm: number | null;
  averageRating: number | null;
  isOpenNow: boolean;
  preparationTimeMinutes?: number | null;
  safetyStatus?: "SAFE" | "CAUTION" | "UNSAFE" | string;
  reasonText?: string;
}

function readName(item: MenuItem): string {
  return (
    item.localName?.trim() ||
    item.name?.trim() ||
    item.food?.canonicalName?.trim() ||
    "ម្ហូប"
  );
}

function readThumbnail(item: MenuItem): string {
  const thumb =
    item.thumbnail ||
    (item.gallery && item.gallery.length > 0 ? item.gallery[0] : null) ||
    (item.uuid ? `/api/v1/catalog/menu-items/${item.uuid}/images/1` : null);

  return toFrontendApiAssetUrl(thumb, DEFAULT_FOOD_IMAGE);
}

function readDietaryTypes(item: MenuItem): string[] {
  if (!Array.isArray(item.dietaryTypes)) {
    return [];
  }

  return item.dietaryTypes
    .map((dietary) => {
      if (typeof dietary === "string") {
        return dietary;
      }

      const record = dietary as { localName?: string; name?: string; code?: string };

      return record.localName || record.name || record.code || "";
    })
    .filter((label): label is string => Boolean(label));
}

function readAllergens(item: MenuItem): string[] {
  if (!Array.isArray(item.allergenDeclarations)) {
    return [];
  }

  return item.allergenDeclarations
    .map((allergen) => {
      if (typeof allergen === "string") {
        return allergen;
      }

      const record = allergen as { name?: string; code?: string };
      return record.name || record.code || "";
    })
    .filter((label): label is string => Boolean(label));
}

/**
 * Flattens the stores already on screen into their menu items. Stores with no
 * menu attached still contribute nothing rather than rendering an empty card.
 */
export function buildStoreMenuItemCards(
  stores: RecommendedStore[],
  limitPerStore = 6,
): StoreMenuItemCard[] {
  const cards: StoreMenuItemCard[] = [];

  for (const store of stores) {
    const menuItems = Array.isArray(store.menuItems) ? store.menuItems : [];

    for (const item of menuItems.slice(0, Math.max(1, limitPerStore))) {
      if (!item?.uuid) {
        continue;
      }

      cards.push({
        key: `${store.uuid}-${item.uuid}`,
        menuItemUuid: item.uuid,
        foodUuid: item.food?.uuid,
        name: readName(item),
        localName: item.localName || undefined,
        thumbnail: readThumbnail(item),
        price: typeof item.price === "number" ? item.price : null,
        currencyCode: item.currencyCode || "USD",
        dietaryTypes: readDietaryTypes(item),
        allergens: readAllergens(item),
        storeUuid: store.uuid,
        storeName: store.localName?.trim() || store.name,
        storeAddress: store.addressLine || store.city || "",
        distanceKm:
          typeof store.distanceKm === "number" ? store.distanceKm : null,
        averageRating:
          typeof store.averageRating === "number" && store.averageRating > 0
            ? store.averageRating
            : null,
        isOpenNow: Boolean(store.isOpenNow),
        preparationTimeMinutes: item.preparationTimeMinutes ?? null,
        safetyStatus: item.recommendation?.safetyStatus,
        reasonText: item.recommendation?.reasonText,
      });
    }
  }

  return cards;
}

/**
 * Converts a list of food items into StoreMenuItemCard format,
 * preserving all store associations and safety scoring.
 */
export function buildFoodMenuItemCards(foods: MenuItem[]): StoreMenuItemCard[] {
  return foods
    .filter((food) => Boolean(food.uuid && food.store?.uuid))
    .map((food) => {
      const storeUuid = food.store?.uuid || "";
      const storeName = food.store?.localName || food.store?.name || "";
      const storeAddress = food.store?.addressLine || food.store?.city || "";

      return {
        key: `food-${food.uuid}`,
        menuItemUuid: food.uuid,
        foodUuid: food.food?.uuid,
        name: readName(food),
        localName: food.localName || undefined,
        thumbnail: readThumbnail(food),
        price: typeof food.price === "number" ? food.price : null,
        currencyCode: food.currencyCode || "USD",
        dietaryTypes: readDietaryTypes(food),
        allergens: readAllergens(food),
        storeUuid,
        storeName,
        storeAddress,
        distanceKm:
          typeof food.distanceKm === "number" ? food.distanceKm : null,
        averageRating:
          typeof food.store?.averageRating === "number" &&
          food.store.averageRating > 0
            ? food.store.averageRating
            : null,
        isOpenNow:
          food.store?.operatingStatus === "OPEN" ||
          Boolean((food.store as { isOpenNow?: boolean })?.isOpenNow),
        preparationTimeMinutes: food.preparationTimeMinutes ?? null,
        safetyStatus: food.recommendation?.safetyStatus,
        reasonText: food.recommendation?.reasonText,
      };
    });
}
