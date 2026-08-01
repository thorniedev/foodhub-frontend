export type StoreOperatingStatus = "OPEN" | "CLOSED" | "UNKNOWN";

export interface BackendStoreDto {
  uuid: string;
  storeName: string;
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
  reviewStatus: string;
  operatingStatus: StoreOperatingStatus;
  accountStatus: string;
  isOpenNow: boolean | null;
  socialLinks: unknown[];
  openingHours: unknown[];
  externalSource: string | null;
}

/** Normalized model used by the location UI. */
export interface Store {
  uuid: string;
  name: string;
  localName: string | null;
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
  reviewStatus: string;
  operatingStatus: StoreOperatingStatus;
  accountStatus: string;
  isOpenNow: boolean | null;
  socialLinks: unknown[];
  openingHours: unknown[];
  externalSource: string | null;
  deliveryAvailable?: boolean;
  pickupAvailable?: boolean;
}

export function mapBackendStore(store: BackendStoreDto): Store {
  return {
    uuid: store.uuid,
    name: store.storeName,
    localName: null,
    description: store.description,
    addressLine: store.addressLine,
    commune: store.commune,
    district: store.district,
    city: store.city,
    province: store.province,
    countryCode: store.countryCode,
    postalCode: store.postalCode,
    timezone: store.timezone,
    latitude: store.latitude,
    longitude: store.longitude,
    phoneNumber: store.phoneNumber,
    email: store.email,
    logoMediaUuid: store.logoMediaUuid,
    coverMediaUuid: store.coverMediaUuid,
    logoUrl: store.logoUrl,
    coverImageUrl: store.coverImageUrl,
    priceLevel: store.priceLevel,
    hygieneRating: store.hygieneRating,
    averageRating: store.averageRating,
    totalReviews: store.totalReviews,
    reviewStatus: store.reviewStatus,
    operatingStatus: store.operatingStatus,
    accountStatus: store.accountStatus,
    isOpenNow: store.isOpenNow,
    socialLinks: store.socialLinks,
    openingHours: store.openingHours,
    externalSource: store.externalSource,
  };
}
