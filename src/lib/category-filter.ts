export const DRINK_KEYWORDS = [
  "drink",
  "beverage",
  "coffee",
  "tea",
  "juice",
  "smoothie",
  "soda",
  "cocktail",
  "beer",
  "wine",
  "water",
  "milk",
  "shake",
  "boba",
  "frappe",
  "ភេសជ្ជៈ",
  "កាហ្វេ",
  "តែ",
  "ទឹកផ្លែឈើ",
  "ទឹកក្រឡុក",
  "ទឹកដោះគោ",
  "ទឹកសុទ្ធ",
  "ទឹកក្រូច",
  "ដោះគោ",
];

export function isDrinkCategory(cat: {
  name?: string;
  code?: string;
  type?: string;
  parentCategoryName?: string;
  parentCategoryCode?: string;
}): boolean {
  if (!cat) return false;
  const type = String(cat.type || "").toUpperCase().trim();
  if (type === "DRINK" || type === "BEVERAGE") return true;
  if (type === "FOOD") return false;

  const code = String(cat.code || "").toUpperCase().trim();
  if (
    code.startsWith("DRINK") ||
    code.includes("BEVERAGE") ||
    code.includes("COFFEE") ||
    code.includes("TEA") ||
    code.includes("JUICE")
  ) {
    return true;
  }
  if (code.startsWith("FOOD")) return false;

  const pCode = String(cat.parentCategoryCode || "").toUpperCase().trim();
  if (pCode.startsWith("DRINK")) return true;
  if (pCode.startsWith("FOOD")) return false;

  const name = String(cat.name || "").toLowerCase().trim();
  const parentName = String(cat.parentCategoryName || "").toLowerCase().trim();

  return (
    DRINK_KEYWORDS.some((kw) => name.includes(kw.toLowerCase())) ||
    DRINK_KEYWORDS.some((kw) => parentName.includes(kw.toLowerCase()))
  );
}

export function isFoodCategory(cat: {
  name?: string;
  code?: string;
  type?: string;
  parentCategoryName?: string;
  parentCategoryCode?: string;
}): boolean {
  return !isDrinkCategory(cat);
}

export type CategoryFilterType = "ALL" | "FOOD" | "DRINK";
