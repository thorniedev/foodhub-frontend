export type MealTime = "breakfast" | "lunch" | "dinner";

export type AgeGroup =
  | "baby" // ទារក (6m–2y)
  | "kid" // កុមារ
  | "teen" // ក្មេងជំទង់
  | "adult" // មនុស្សពេញវ័យ
  | "senior" // មនុស្សចាស់
  | "all"; // គ្រប់វ័យ

export type DietaryTag =
  | "halal"
  | "vegan"
  | "vegetarian"
  | "no-pork"
  | "no-beef"
  | "gluten-free"
  | "no-msg"
  | "low-sugar"
  | "seafood-free"
  | "nut-free";
export type SpiceLevel = 0 | 1 | 2 | 3;
// export type FoodItem = {
//   id: number;
//   mealTime: MealTime;
//   store: string;
//   name: string;
//   description: string;
//   rating: number;
//   time: string;
//   distance: string;
//   price: string;
//   tags: string[];
//   foodTypes: string[];
//   drinkTypes: string[];
//   ageGroups: string[];
//   image: string;
// };
export type FoodItem = {
  id: number;
  name: string;
  description: string;
  image: string;

  store: string;
  storeId?: string;
  isOpen: boolean;
  opensAt?: string; // "06:30" — used for the "opens in 20 min" hint
  closesAt?: string; // "21:00"

  price: number; // 3
  originalPrice?: number; // 4  → renders a strikethrough + discount badge
  deliveryFee?: number; // 0.5
  currency: "USD" | "KHR";

  rating: number; // 4.8
  reviewCount: number; // 214 — a 5.0 from 2 reviews should not outrank a 4.8 from 900

  etaMinutes: number; // 8
  distanceKm: number; // 0.5

  mealTimes: MealTime[]; // a dish can be both breakfast and lunch
  foodTypes: string[]; // ម្ហូបខ្មែរ, ជប៉ុន, ...
  drinkTypes: string[];
  cuisines?: string[];
  dietary: DietaryTag[];
  ageGroups: AgeGroup[];
  spiceLevel: SpiceLevel;
  tags: string[]; // free-form marketing labels: ពេញនិយម, រហ័ស...

  createdAt: string; // ISO — drives the "new" sort and the ថ្មី badge
  promoLabel?: string; // "-20%"
};

export type RawFoodItem = {
  id: number;
  mealTime: string;
  store: string;
  name: string;
  description: string;
  rating: number;
  time: string; // "8 min"
  distance: string; // "500m" | "1.2km"
  price: string; // "3"
  tags: string[];
  foodTypes: string[];
  drinkTypes: string[];
  ageGroups: string[];
  image: string;
} & Partial<FoodItem>;
export type SortKey =
  | "recommended"
  | "rating"
  | "newest"
  | "distance"
  | "eta"
  | "price_asc"
  | "price_desc"
  | "popular";
export type FilterState = {
  query: string;
  food: Set<string>;
  drink: Set<string>;
  age: Set<string>;
};

export const EMPTY_FILTERS: FilterState = {
  query: "",
  food: new Set(),
  drink: new Set(),
  age: new Set(),
};

export type FoodFilters = {
  q: string;
  sort: SortKey;
  mealTimes: MealTime[];
  foodTypes: string[];
  drinkTypes: string[];
  dietary: DietaryTag[];
  tags: string[];
  ageGroups: AgeGroup[];
  minPrice: number | null;
  maxPrice: number | null;
  minRating: number | null;
  maxDistanceKm: number | null;
  maxEtaMinutes: number | null;
  maxSpice: SpiceLevel | null;
  openNow: boolean;
  freeDelivery: boolean;
  hasPromo: boolean;
};
