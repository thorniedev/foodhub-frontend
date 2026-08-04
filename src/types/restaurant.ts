/**
 * Domain types for the Restaurant Detail page (`/restaurant/[id]`).
 *
 * Kept separate from `food.ts` / `food-v1.ts` on purpose: those describe a
 * single dish inside the global "browse all food" catalogue, while this
 * file describes a single *restaurant/store* and everything rendered on
 * its own storefront page (hero, categories, map, menu sections, promos).
 */

/** Minimal weekly opening hours — every day defaults to the same window
 *  unless overridden. `null` means closed that day. */
export type OpeningHours = {
  opensAt: string; // "06:00"
  closesAt: string; // "21:00"
};

export type MenuItem = {
  id: number;
  categoryKey: string; // links back to RestaurantMenuCategory.key
  name: string;
  image: string;
  price: number;
  originalPrice?: number; // present -> renders strikethrough + "-N%" badge
  rating: number;
  etaMinutes: number;
  distanceKm: number;
  isHalal?: boolean;
  tags: string[]; // "ថ្មី", "លក់ដាច់"...
};

export type RestaurantMenuCategory = {
  key: string; // stable id used for anchor scrolling + sidebar highlight
  label: string; // Khmer label shown in the sidebar / section heading
  icon: string; // icon name, mapped in RestaurantCategorySidebar
  items: MenuItem[];
};

export type PromoVoucher = {
  id: number;
  title: string; // "បញ្ចុះតម្លៃ 20%"
  discountLabel: string; // "20%"
  minSpend: number; // 15
  expiresAt: string; // ISO date
};

export type HeroSlide = {
  id: number;
  image: string;
  alt: string;
};

export type RestaurantDetail = {
  id: number;
  slug: string;
  name: string;
  tagline: string;
  logo: string;
  brandColor: string; // hex, drives the hero card background
  heroSlides: HeroSlide[];
  rating: number;
  reviewCount: number;
  isOpen: boolean;
  openingHours: OpeningHours;
  etaMinutes: number;
  distanceKm: number;
  phone: string;
  province: string;
  address: string;
  latitude: number;
  longitude: number;
  isHalal?: boolean;
  vouchers: PromoVoucher[];
  categories: RestaurantMenuCategory[];
};
