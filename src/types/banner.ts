export const bannerCategories = [
  "MAIN",
  "POPULAR",
  "LOCATION",
  "SEASON",
] as const;

export type BannerCategory = (typeof bannerCategories)[number];

/**
 * Verified against kh.edu.istad.ite.foodhub.feature.banner.dto.PublicBannerResponse
 * (backend record fields: id, image, location, title, description).
 * @JsonInclude(NON_NULL) means `location`/`description` are omitted from the
 * JSON entirely when null, never sent as an explicit `null`.
 */
export interface PublicBannerResponse {
  id: string;
  image: string;
  location?: string | null;
  title: string;
  description?: string | null;
}
