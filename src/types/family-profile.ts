export interface FamilyMember {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
}

export type MealTime = "breakfast" | "lunch" | "dinner";

export interface FoodRecommendation {
  id: string;
  mealTime: MealTime;
  imageUrl: string;
  restaurantName: string;
  dishName: string;
  priceLabel: string;
  description: string;
  rating: number;
  etaMinutes: number;
  distanceKm: number;
  openHours: string;
  badgeLabel: string;
  isFavorite: boolean;
}
