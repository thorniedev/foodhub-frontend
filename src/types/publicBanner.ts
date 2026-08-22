export type BannerCategory = 'MAIN' | 'POPULAR' | 'LOCATION' | 'SEASON';

export interface PublicBannerResponse {
  id: string;              // UUID
  image: string;           // Relative path: "/api/v1/media/{uuid}/file"
  location?: string | null;// Only present for LOCATION category banners (e.g. "Siem Reap")
  title: string;           // Banner headline
  description?: string | null; // Promotional subtitle or details
}
