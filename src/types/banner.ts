export type BannerCategory = "MAIN" | "POPULAR" | "LOCATION" | "SEASON";

export interface BannerItem {
  id: string | number;
  category?: BannerCategory;
  imageMediaUuid?: string | null;
  imageUrl?: string | null;
  image?: string | null;
  title?: string | null;
  description?: string | null;
  location?: string | null;
  isPublished?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type BannerResponse = BannerItem[];
