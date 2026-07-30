export type AvailabilityStatus = "AVAILABLE" | "UNAVAILABLE";

export type OperatingStatus = "OPEN" | "CLOSED";

export type VerificationStatus = "VERIFIED" | "UNVERIFIED";

export type SafetyStatus = "SAFE" | "UNSAFE";

export interface MenuItemsResponse {
  menuItems: MenuItem[];
}

export interface MenuItem {
  uuid: string;
  legacyId: number;

  name: string;
  localName: string;

  description: string;
  localDescription: string;

  thumbnail: string;
  gallery: string[];

  price: number;
  currencyCode: string;

  preparationTimeMinutes: number;

  availabilityStatus: AvailabilityStatus;
  isFeatured: boolean;
  source: string;

  store: Store;
  food: Food;

  mealTypes: MealType[];
  dietaryTypes: DietaryType[];
  allergenDeclarations: AllergenDeclaration[];

  ingredients: string[];
  beveragePairings: string[];

  nutrition: Nutrition;

  distanceKm: number;
  deliveryFee: number;

  recommendation: Recommendation;

  createdAt: string;
  updatedAt: string;
}

export interface Store {
  uuid: string;

  name: string;
  localName: string;

  logoUrl: string;
  coverImageUrl: string;

  addressLine: string;
  district: string;
  city: string;

  latitude: number;
  longitude: number;

  operatingStatus: OperatingStatus;

  averageRating: number;
  totalReviews: number;
}

export interface Food {
  uuid: string;

  canonicalName: string;

  category: Category;
  cuisine: Cuisine;

  spiceLevel: number;

  ageGroups: AgeGroup[];
}

export interface Category {
  code: string;
  name: string;
}

export interface Cuisine {
  code: string;
  name: string;
}

export interface AgeGroup {
  code: string;
  name: string;
}

export interface MealType {
  code: string;
  name: string;
}

export interface DietaryType {
  code: string;
  name: string;
  verificationStatus: VerificationStatus;
}

export interface AllergenDeclaration {
  code: string;
  name: string;
  declarationType: string;
  riskLevel: string;
  verificationStatus: VerificationStatus;
}

export interface Nutrition {
  calories: number;
  protein: number;
  carbohydrate: number;
  fat: number;
  fiber: number;
  sodium: number;
}

export interface Recommendation {
  isRecommended: boolean;
  rankPosition: number;
  finalScore: number;

  safetyStatus: SafetyStatus;
  candidateSource: string;

  reasonCodes: string[];
  reasonText: string;

  isExploration: boolean;

  scoreBreakdown: RecommendationScoreBreakdown;
}

export interface RecommendationScoreBreakdown {
  mealMatch: number;
  cuisineMatch: number;
  budgetMatch: number;
  distanceMatch: number;
  popularity: number;
}
