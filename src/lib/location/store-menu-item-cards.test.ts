import { describe, expect, it } from "vitest";
import {
  buildFoodMenuItemCards,
  buildStoreMenuItemCards,
} from "./store-menu-item-cards";
import type { RecommendedStore } from "@/types/location";
import type { MenuItem } from "@/types/manu";

describe("store-menu-item-cards", () => {
  const mockStore: RecommendedStore = {
    uuid: "store-uuid-1",
    name: "Kravanh Restaurant",
    localName: "ភោជនីយដ្ឋាន ក្រវាញ",
    description: "Authentic Khmer food",
    addressLine: "Street 240, Daun Penh",
    commune: "Chaktomuk",
    district: "Daun Penh",
    city: "Phnom Penh",
    province: "Phnom Penh",
    latitude: 11.5564,
    longitude: 104.9282,
    phoneNumber: "012345678",
    email: "info@kravanh.com",
    logoUrl: "/images/kravanh-logo.png",
    coverImageUrl: "/images/kravanh-cover.png",
    priceLevel: "$$",
    averageRating: 4.8,
    totalReviews: 120,
    operatingStatus: "OPEN",
    isOpenNow: true,
    deliveryAvailable: true,
    pickupAvailable: true,
    distanceKm: 1.5,
    recommendationScore: 92,
    voteCount: 15,
    menuCount: 2,
    matchingMenuCount: 2,
    menuItems: [
      {
        uuid: "item-1",
        name: "Fish Amok",
        localName: "អាម៉ុកត្រី",
        price: 6.5,
        currencyCode: "USD",
        thumbnail: "/images/fish-amok.png",
        dietaryTypes: ["HALAL", "NO_PORK"],
        allergenDeclarations: [{ code: "PEANUT", name: "Peanut" }],
        preparationTimeMinutes: 20,
      } as unknown as MenuItem,
      {
        uuid: "item-2",
        name: "Beef Lok Lak",
        localName: "ឡុកឡាក់សាច់គោ",
        price: 7.0,
        currencyCode: "USD",
        thumbnail: null,
        dietaryTypes: ["HALAL"],
        preparationTimeMinutes: 15,
      } as unknown as MenuItem,
    ],
  };

  it("flattens recommended stores into StoreMenuItemCard items", () => {
    const cards = buildStoreMenuItemCards([mockStore]);
    expect(cards).toHaveLength(2);

    expect(cards[0].menuItemUuid).toBe("item-1");
    expect(cards[0].name).toBe("អាម៉ុកត្រី");
    expect(cards[0].price).toBe(6.5);
    expect(cards[0].storeUuid).toBe("store-uuid-1");
    expect(cards[0].storeName).toBe("ភោជនីយដ្ឋាន ក្រវាញ");
    expect(cards[0].distanceKm).toBe(1.5);
    expect(cards[0].averageRating).toBe(4.8);
    expect(cards[0].isOpenNow).toBe(true);
    expect(cards[0].dietaryTypes).toEqual(["HALAL", "NO_PORK"]);
    expect(cards[0].allergens).toEqual(["Peanut"]);
  });

  it("handles stores with empty menu gracefully", () => {
    const emptyStore: RecommendedStore = {
      ...mockStore,
      uuid: "empty-store",
      menuItems: [],
    };
    const cards = buildStoreMenuItemCards([emptyStore]);
    expect(cards).toHaveLength(0);
  });

  it("builds food menu item cards directly from single user food items", () => {
    const foods: MenuItem[] = [
      {
        uuid: "food-uuid-10",
        name: "Khmer Noodle Curry",
        localName: "នំបញ្ចុកសម្លការី",
        price: 3.5,
        currencyCode: "USD",
        thumbnail: "/images/nom-banh-chok.png",
        dietaryTypes: ["VEGETARIAN"],
        distanceKm: 0.8,
        preparationTimeMinutes: 10,
        store: {
          uuid: "store-noodle",
          name: "Noodle House",
          localName: "ផ្ទះនំបញ្ចុក",
          addressLine: "BKK1",
          averageRating: 4.5,
          operatingStatus: "OPEN",
        },
      } as unknown as MenuItem,
    ];

    const cards = buildFoodMenuItemCards(foods);
    expect(cards).toHaveLength(1);
    expect(cards[0].name).toBe("នំបញ្ចុកសម្លការី");
    expect(cards[0].storeName).toBe("ផ្ទះនំបញ្ចុក");
    expect(cards[0].distanceKm).toBe(0.8);
    expect(cards[0].dietaryTypes).toEqual(["VEGETARIAN"]);
    expect(cards[0].isOpenNow).toBe(true);
  });
});
