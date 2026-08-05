export type MealTime = "breakfast" | "lunch" | "dinner";

export type FoodItem = {
  dietaryTypes: any;
  id: number;
  mealTime: MealTime;
  store: string;
  name: string;
  description: string;
  rating: number;
  time: string;
  distance: string;
  price: string;
  tags: string[];
  foodTypes: string[];
  drinkTypes: string[];
  ageGroups: string[];
  image: string;
};

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