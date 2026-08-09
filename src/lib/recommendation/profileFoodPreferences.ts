import type { CatalogMenuItem } from "@/types/catalog-menu-item";
import type { MemberProfile } from "@/types/member-profile/member-profile";

type FoodValue = {
  code?: unknown;
  name?: unknown;
  allergenCode?: unknown;
  dietaryTypeCode?: unknown;
  ingredientCode?: unknown;
};

function normalize(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFKC");
}

function valuesFromUnknown(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    if (typeof item === "string" || typeof item === "number") {
      return [normalize(item)];
    }

    if (!item || typeof item !== "object") return [];

    const option = item as FoodValue;
    return [
      normalize(option.code),
      normalize(option.name),
      normalize(option.allergenCode),
      normalize(option.dietaryTypeCode),
      normalize(option.ingredientCode),
    ].filter(Boolean);
  });
}

function foodDietaryValues(food: CatalogMenuItem): string[] {
  return valuesFromUnknown(food.dietaryTypes);
}

function foodAllergenValues(food: CatalogMenuItem): string[] {
  return valuesFromUnknown(food.allergenDeclarations);
}

function foodIngredientValues(food: CatalogMenuItem): string[] {
  return valuesFromUnknown(food.ingredients);
}

function profilePreferenceValues(
  profile: MemberProfile,
  keys: string[],
): string[] {
  if (!profile.preferences || typeof profile.preferences !== "object") {
    return [];
  }

  return keys.flatMap((key) => valuesFromUnknown(profile.preferences?.[key]));
}

/**
 * Returns true when a food conflicts with a strict allergy/avoid preference.
 * Unknown catalog metadata is treated as unknown, not as a conflict.
 */
export function conflictsWithProfile(
  food: CatalogMenuItem,
  profile: MemberProfile | null | undefined,
): boolean {
  if (!profile) return false;

  const allergens = foodAllergenValues(food);
  const ingredients = foodIngredientValues(food);
  const allergies = Array.isArray(profile.allergies) ? profile.allergies : [];
  const ingredientAvoids = Array.isArray(profile.ingredientAvoids)
    ? profile.ingredientAvoids
    : [];
  const blockedAllergens = allergies
    .map((item) => normalize(item?.allergenCode))
    .filter(Boolean)
    .concat(
      profilePreferenceValues(profile, ["allergies", "allergenCodes"]),
    );
  const blockedIngredients = ingredientAvoids
    .filter((item) => item?.avoidLevel === "STRICT_BLOCK")
    .map((item) => normalize(item?.ingredientCode))
    .filter(Boolean);

  return (
    blockedAllergens.some((code) => allergens.includes(code)) ||
    blockedIngredients.some((code) =>
      ingredients.some((ingredient) => ingredient.includes(code)),
    )
  );
}

/** Higher scores are more relevant to the member's saved preferences. */
export function getProfileFoodScore(
  food: CatalogMenuItem,
  profile: MemberProfile | null | undefined,
): number {
  if (!profile) return 0;

  const dietaryValues = foodDietaryValues(food);
  const dietaryTypes = Array.isArray(profile.dietaryTypes)
    ? profile.dietaryTypes
    : [];
  const ingredientAvoids = Array.isArray(profile.ingredientAvoids)
    ? profile.ingredientAvoids
    : [];
  const preferredDietaryTypes = dietaryTypes
    .map((item) => normalize(item?.dietaryTypeCode))
    .filter(Boolean)
    .concat(
      profilePreferenceValues(profile, [
        "dietaryTypes",
        "dietaryTypeCodes",
        "dietaryPreferences",
      ]),
    );
  const preferredIngredients = ingredientAvoids
    .filter((item) => item?.avoidLevel === "PREFERENCE")
    .map((item) => normalize(item?.ingredientCode));
  const preferenceIngredients = profilePreferenceValues(profile, [
    "ingredients",
    "ingredientPreferences",
  ]);
  const ingredients = foodIngredientValues(food);

  const dietaryScore =
    preferredDietaryTypes.filter((code) => dietaryValues.includes(code))
      .length * 10;
  const ingredientScore =
    [...preferredIngredients, ...preferenceIngredients].filter((code) =>
      ingredients.some((ingredient) => ingredient.includes(code)),
    ).length * 2;
  const featuredScore = food.isFeatured ? 1 : 0;

  return dietaryScore + ingredientScore + featuredScore;
}

export function sortFoodsForProfile(
  foods: CatalogMenuItem[],
  profile: MemberProfile | null | undefined,
): CatalogMenuItem[] {
  return foods
    .filter((food) => !conflictsWithProfile(food, profile))
    .map((food, index) => ({
      food,
      score: getProfileFoodScore(food, profile),
      index,
    }))
    .sort(
      (first, second) =>
        second.score - first.score || first.index - second.index,
    )
    .map(({ food }) => food);
}

export function getProfilePreferenceCount(
  profile: MemberProfile | null | undefined,
): number {
  if (!profile) return 0;
  return (
    (Array.isArray(profile.allergies) ? profile.allergies.length : 0) +
    (Array.isArray(profile.dietaryTypes) ? profile.dietaryTypes.length : 0) +
    (Array.isArray(profile.ingredientAvoids)
      ? profile.ingredientAvoids.length
      : 0)
  );
}
