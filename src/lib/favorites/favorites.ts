export type StoredFavoriteFood = {
  id: string;
  imageUrl: string;
  dishName: string;
  restaurantName: string;
  categoryLabel: string;
  rating: number;
  etaMinutes: number;
  distanceKm: number;
  addedAt: string;
};

const FAVORITES_KEY = "foodhub-favorite-menu-items";

export const FAVORITES_UPDATED_EVENT = "foodhub-favorites-updated";

export function getFavorites(): StoredFavoriteFood[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = localStorage.getItem(FAVORITES_KEY);

    if (!stored) {
      return [];
    }

    return JSON.parse(stored) as StoredFavoriteFood[];
  } catch (error) {
    console.error("Failed to read favorites:", error);
    return [];
  }
}

export function isFavorite(id: string): boolean {
  return getFavorites().some((item) => item.id === id);
}

export function addFavorite(item: Omit<StoredFavoriteFood, "addedAt">) {
  if (typeof window === "undefined") {
    return;
  }

  const favorites = getFavorites();

  const exists = favorites.some((favorite) => favorite.id === item.id);

  if (exists) {
    return;
  }

  const updated: StoredFavoriteFood[] = [
    {
      ...item,
      addedAt: new Date().toISOString(),
    },
    ...favorites,
  ];

  localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));

  window.dispatchEvent(new Event(FAVORITES_UPDATED_EVENT));
}

export function removeFavorite(id: string) {
  if (typeof window === "undefined") {
    return;
  }

  const updated = getFavorites().filter((item) => item.id !== id);

  localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));

  window.dispatchEvent(new Event(FAVORITES_UPDATED_EVENT));
}

export function toggleFavorite(
  item: Omit<StoredFavoriteFood, "addedAt">,
): boolean {
  if (isFavorite(item.id)) {
    removeFavorite(item.id);
    return false;
  }

  addFavorite(item);
  return true;
}

export function clearFavorites() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(FAVORITES_KEY);

  window.dispatchEvent(new Event(FAVORITES_UPDATED_EVENT));
}
