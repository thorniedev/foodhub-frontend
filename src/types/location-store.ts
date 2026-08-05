export type StoreReviewStatus = "PENDING" | "APPROVED" | "REJECTED";
export type StoreOperatingStatus =
  | "OPEN"
  | "CLOSED"
  | "TEMPORARILY_CLOSED"
  | "UNKNOWN";
export type StoreAccountStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";

export interface StoreSocialLink {
  platform: string;
  url: string;
}

export interface StoreOpeningHour {
  dayOfWeek: string;
  openTime: string | null;
  closeTime: string | null;
  isClosed: boolean;
}

/**
 * Exact shape used by public/data/stores.json.
 *
 * Keep this separate from MenuItem["store"] because the static store JSON uses
 * `storeName`, while menu-item data commonly uses `name` and `localName`.
 */
export interface LocationStore {
  uuid: string;
  storeName: string;
  localName?: string | null;
  description: string | null;

  addressLine: string;
  commune: string | null;
  district: string | null;
  city: string;
  province: string;
  countryCode: string;
  postalCode: string | null;
  timezone: string;

  latitude: number;
  longitude: number;

  phoneNumber: string | null;
  email: string | null;

  logoMediaUuid: string | null;
  coverMediaUuid: string | null;
  logoUrl: string | null;
  coverImageUrl: string | null;

  priceLevel: number | null;
  hygieneRating: number | null;
  averageRating: number;
  totalReviews: number;

  reviewStatus: StoreReviewStatus | string;
  operatingStatus: StoreOperatingStatus | string;
  accountStatus: StoreAccountStatus | string;
  isOpenNow: boolean | null;

  /**
   * These fields are optional because your current JSON does not contain them.
   * They are kept here so the location filters can support them later.
   */
  deliveryAvailable?: boolean;
  pickupAvailable?: boolean;

  socialLinks: StoreSocialLink[];
  openingHours: StoreOpeningHour[];
  externalSource: string | null;
}
