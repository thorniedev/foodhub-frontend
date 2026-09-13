import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { EnrichedRecommendationItem } from "@/hooks/useEnrichedRecommendationItems";
import type { BookmarkResponse } from "@/types/interaction";

/**
 * Regression coverage for the bookmark heart bug that shipped twice (most
 * recently reintroduced by PR #19 / commit bb2787c): SwipeFoodCard used to
 * union useBookmarks' server-backed `findBookmark` result with a parallel
 * copy of saved ids kept in localStorage ("foodhub-favorite-menu-items"), so
 * a bookmark removed by another device/admin/direct DB change kept showing
 * as saved here forever, because only this card's own click handler ever
 * cleared that localStorage entry. useBookmarks (backed by the shared
 * useGetBookmarksQuery RTK Query cache) must be the only source of truth.
 */
const {
  useBookmarksMock,
  addBookmarkMock,
  removeBookmarkMock,
  findBookmarkMock,
  trackMock,
} = vi.hoisted(() => ({
  useBookmarksMock: vi.fn(),
  addBookmarkMock: vi.fn(),
  removeBookmarkMock: vi.fn(),
  findBookmarkMock: vi.fn(),
  trackMock: vi.fn(),
}));

vi.mock("@/hooks/useBookmarks", () => ({
  useBookmarks: useBookmarksMock,
}));

vi.mock("@/hooks/useTrackInteraction", () => ({
  useTrackInteraction: () => ({ track: trackMock }),
}));

import { SwipeFoodCard } from "./SwipeCardTinderStyle";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  window.localStorage.clear();
});

const FAVORITES_STORAGE_KEY = "foodhub-favorite-menu-items";

const baseFood: EnrichedRecommendationItem = {
  uuid: "swipe-item-1",
  legacyId: 202,
  name: "Num Banh Chok",
  localName: null,
  description: null,
  localDescription: null,
  thumbnail: null,
  gallery: [],
  price: 2.75,
  currencyCode: "USD",
  preparationTimeMinutes: 10,
  availabilityStatus: "AVAILABLE",
  isFeatured: false,
  source: "CATALOG",
  store: {
    uuid: "store-2",
    name: "Khmer Noodle House",
    localName: null,
    logoUrl: null,
    coverImageUrl: null,
    social: [],
    addressLine: null,
    district: null,
    city: null,
    latitude: 11.56,
    longitude: 104.92,
    operatingStatus: "OPEN",
    averageRating: 4.2,
    totalReviews: 8,
  },
  distanceKm: null,
  food: {
    uuid: "food-2",
    canonicalName: "Num Banh Chok",
    category: { code: "MAIN", name: "Main" },
    cuisine: { code: "KH", name: "Khmer" },
    spiceLevel: 0,
    ageGroups: [],
    mealTypes: [],
    seasons: [],
    dietaryTypes: [],
    events: [],
    suitableWeather: [],
  },
  allergenDeclarations: [],
  ingredients: [],
  beveragePairings: [],
  nutrition: { calories: 0, fatGrams: 0, carbsGrams: 0, proteinGrams: 0 },
  recommendation: null,
  createdAt: "2026-08-01T00:00:00",
  updatedAt: "2026-08-01T00:00:00",
  origin: {
    countryCode: "KH",
    countryName: "Cambodia",
    countryLocalName: null,
    provinceCode: null,
    provinceName: null,
    provinceLocalName: null,
    isTraditional: true,
  },
  filterOption: {
    seasons: [],
    events: [],
    provincePopularity: [],
    suitableWeather: [],
  },
  isExploration: false,
  rankPosition: 1,
};

const existingBookmark: BookmarkResponse = {
  uuid: "bm-swipe-1",
  profileUuid: "profile-1",
  foodUuid: null,
  menuItemUuid: "swipe-item-1",
  storeUuid: null,
  sourceRecommendationItemUuid: null,
  notes: null,
  createdAt: "2026-08-20T00:00:00",
};

const ADD_LABEL = "Add Num Banh Chok to favorites";
const REMOVE_LABEL = "Remove Num Banh Chok from favorites";

function mockUseBookmarks(bookmark: BookmarkResponse | null) {
  findBookmarkMock.mockReturnValue(bookmark);
  useBookmarksMock.mockReturnValue({
    bookmarks: bookmark ? [bookmark] : [],
    totalElements: bookmark ? 1 : 0,
    activeProfile: { uuid: "profile-1" },
    activeProfileUuid: "profile-1",
    loading: false,
    refetch: vi.fn(),
    isBookmarked: vi.fn(() => Boolean(bookmark)),
    findBookmark: findBookmarkMock,
    addBookmark: addBookmarkMock,
    removeBookmark: removeBookmarkMock,
  });
}

beforeEach(() => {
  addBookmarkMock.mockReset().mockResolvedValue({ uuid: "new-bookmark" });
  removeBookmarkMock.mockReset().mockResolvedValue(undefined);
  trackMock.mockReset();
  mockUseBookmarks(null);
});

describe("SwipeFoodCard bookmark heart", () => {
  it("renders unsaved when the server has no bookmark, even with a stale localStorage entry for this item", () => {
    window.localStorage.setItem(
      FAVORITES_STORAGE_KEY,
      JSON.stringify([baseFood.uuid]),
    );
    mockUseBookmarks(null);

    render(<SwipeFoodCard food={baseFood} />);

    expect(screen.getByRole("button", { name: ADD_LABEL })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: REMOVE_LABEL }),
    ).not.toBeInTheDocument();
  });

  it("renders saved when the server has a matching bookmark", () => {
    mockUseBookmarks(existingBookmark);

    render(<SwipeFoodCard food={baseFood} />);

    expect(screen.getByRole("button", { name: REMOVE_LABEL })).toBeInTheDocument();
  });

  it("clicking the unsaved heart calls addBookmark with the menu item uuid and never touches localStorage", async () => {
    const setItemSpy = vi.spyOn(Storage.prototype, "setItem");
    mockUseBookmarks(null);

    render(<SwipeFoodCard food={baseFood} />);
    fireEvent.click(screen.getByRole("button", { name: ADD_LABEL }));

    await waitFor(() =>
      expect(addBookmarkMock).toHaveBeenCalledWith({
        menuItemUuid: "swipe-item-1",
        sourceRecommendationItemUuid: undefined,
        notes: undefined,
      }),
    );
    expect(removeBookmarkMock).not.toHaveBeenCalled();
    expect(setItemSpy).not.toHaveBeenCalledWith(
      FAVORITES_STORAGE_KEY,
      expect.anything(),
    );
  });

  it("clicking the saved heart calls removeBookmark with the bookmark uuid and never touches localStorage", async () => {
    const setItemSpy = vi.spyOn(Storage.prototype, "setItem");
    mockUseBookmarks(existingBookmark);

    render(<SwipeFoodCard food={baseFood} />);
    fireEvent.click(screen.getByRole("button", { name: REMOVE_LABEL }));

    await waitFor(() =>
      expect(removeBookmarkMock).toHaveBeenCalledWith("bm-swipe-1"),
    );
    expect(addBookmarkMock).not.toHaveBeenCalled();
    expect(setItemSpy).not.toHaveBeenCalledWith(
      FAVORITES_STORAGE_KEY,
      expect.anything(),
    );
  });

  it("flips the icon optimistically before the addBookmark call resolves", () => {
    mockUseBookmarks(null);
    // Never resolves -- this test only checks the synchronous optimistic
    // update, and an eternally-pending promise avoids any post-unmount
    // "state update on an unmounted component" noise from a later resolve.
    addBookmarkMock.mockImplementation(() => new Promise(() => {}));

    render(<SwipeFoodCard food={baseFood} />);
    fireEvent.click(screen.getByRole("button", { name: ADD_LABEL }));

    expect(screen.getByRole("button", { name: REMOVE_LABEL })).toBeInTheDocument();
  });

  it("rolls back the optimistic flip when addBookmark rejects", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    mockUseBookmarks(null);
    addBookmarkMock.mockRejectedValue(new Error("network error"));

    render(<SwipeFoodCard food={baseFood} />);
    fireEvent.click(screen.getByRole("button", { name: ADD_LABEL }));

    // Optimistic flip happens synchronously before the rejection settles.
    expect(screen.getByRole("button", { name: REMOVE_LABEL })).toBeInTheDocument();

    await waitFor(() =>
      expect(screen.getByRole("button", { name: ADD_LABEL })).toBeInTheDocument(),
    );
  });
});
