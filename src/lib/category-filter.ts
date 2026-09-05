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
  "latte",
  "cappuccino",
  "espresso",
  "americano",
  "mocha",
  "matcha",
  "ភេសជ្ជៈ",
  "កាហ្វេ",
  "តែ",
  "ទឹកផ្លែឈើ",
  "ទឹកក្រឡុក",
  "ទឹកដោះគោ",
  "ទឹកសុទ្ធ",
  "ទឹកក្រូច",
  "ដោះគោ",
  "សូដា",
  "ស្រាបៀរ",
  "ស្រា",
  "ទឹកដូង",
  "ទឹកអំពៅ",
  "ទឹកតែ",
  "ស្ម៊ូតធី",
  "ឡាតេ",
  "កាពូឈីណូ",
  "ម៉ាចា",
  "ផាសិន",
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

export function isDrinkItem(item: {
  name?: string | null;
  localName?: string | null;
  food?: {
    category?: { code?: string; name?: string; type?: string } | null;
    cuisine?: { code?: string; name?: string } | null;
  } | null;
  category?: { code?: string; name?: string; type?: string } | null;
  rootCategoryCode?: string | null;
}): boolean {
  if (!item) return false;
  if (item.rootCategoryCode === "DRINK") return true;
  if (item.rootCategoryCode === "FOOD") return false;

  if (item.food?.category && isDrinkCategory(item.food.category)) {
    return true;
  }
  if (item.category && isDrinkCategory(item.category)) {
    return true;
  }

  const combined = `${item.name || ""} ${item.localName || ""}`.toLowerCase();
  return DRINK_KEYWORDS.some((kw) => combined.includes(kw.toLowerCase()));
}

export function isFoodItem(item: Parameters<typeof isDrinkItem>[0]): boolean {
  return !isDrinkItem(item);
}
