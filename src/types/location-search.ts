export interface LocationSearchResult {
  id: string;

  name: string;
  address: string;

  addressLine1: string | null;
  addressLine2: string | null;

  city: string | null;
  district: string | null;
  county: string | null;
  state: string | null;
  postcode: string | null;

  country: string | null;
  countryCode: string | null;

  latitude: number;
  longitude: number;

  type: string | null;
}

export interface LocationSearchResponse {
  query: string;

  results: LocationSearchResult[];

  message?: string | null;
}

export interface LocationReverseResponse {
  place: LocationSearchResult | null;

  message?: string | null;
}
