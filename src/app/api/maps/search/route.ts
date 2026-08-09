import { NextRequest, NextResponse } from "next/server";

import type {
  LocationSearchResponse,
  LocationSearchResult,
} from "@/types/location-search";

type SearchLanguage = "km" | "en";
type SearchSource = "autocomplete" | "places";

interface GeoapifyAutocompleteResult {
  place_id?: string;

  name?: string;
  formatted?: string;

  address_line1?: string;
  address_line2?: string;

  city?: string;
  district?: string;
  suburb?: string;
  county?: string;
  state?: string;
  postcode?: string;

  country?: string;
  country_code?: string;

  lat?: number | string;
  lon?: number | string;

  result_type?: string;
}

interface GeoapifyAutocompleteResponse {
  results?: GeoapifyAutocompleteResult[];
}

interface GeoapifyPlacesProperties {
  place_id?: string;

  name?: string;
  formatted?: string;

  address_line1?: string;
  address_line2?: string;

  city?: string;
  district?: string;
  suburb?: string;
  county?: string;
  state?: string;
  postcode?: string;

  country?: string;
  country_code?: string;

  lat?: number | string;
  lon?: number | string;

  categories?: string[];
}

interface GeoapifyPlacesFeature {
  type?: string;

  properties?: GeoapifyPlacesProperties;

  geometry?: {
    type?: string;
    coordinates?: [number, number];
  };
}

interface GeoapifyPlacesResponse {
  type?: string;
  features?: GeoapifyPlacesFeature[];
}

interface SearchCandidate extends LocationSearchResult {
  geoapifyPlaceId: string | null;
  source: SearchSource;
  language: SearchLanguage;
}

interface UserBias {
  latitude: number;
  longitude: number;
}

const CAMBODIA_POI_CATEGORIES = [
  "commercial",
  "catering",
  "accommodation",
  "service",
  "healthcare",
  "entertainment",
  "leisure",
  "tourism",
  "education",
  "public_transport",
  "rental",
  "sport",
  "parking",
  "childcare",
].join(",");

let cambodiaPlaceIdPromise: Promise<string | null> | null = null;

function containsKhmerText(value: string): boolean {
  return /[\u1780-\u17FF]/u.test(value);
}

function normalizeText(value: string): string {
  return value.trim().toLocaleLowerCase().normalize("NFKC");
}

function toFiniteNumber(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string") {
    const normalized = value.trim();

    if (!normalized) {
      return null;
    }

    const parsed = Number(normalized);

    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function getUserBias(searchParams: URLSearchParams): UserBias | null {
  const latitudeParam = searchParams.get("lat");
  const longitudeParam = searchParams.get("lng");

  if (latitudeParam === null || longitudeParam === null) {
    return null;
  }

  const latitude = Number(latitudeParam);
  const longitude = Number(longitudeParam);

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return null;
  }

  return {
    latitude,
    longitude,
  };
}

function buildAddress(
  formatted: string | undefined,
  addressLine1: string | undefined,
  addressLine2: string | undefined,
  fallbackName: string | undefined,
): string {
  return (
    formatted?.trim() ||
    [addressLine1, addressLine2].filter(Boolean).join(", ") ||
    fallbackName?.trim() ||
    "Unknown location"
  );
}

function buildName(
  name: string | undefined,
  addressLine1: string | undefined,
  city: string | undefined,
  district: string | undefined,
  suburb: string | undefined,
  state: string | undefined,
  country: string | undefined,
  address: string,
): string {
  return (
    name?.trim() ||
    addressLine1?.trim() ||
    city?.trim() ||
    district?.trim() ||
    suburb?.trim() ||
    state?.trim() ||
    country?.trim() ||
    address
  );
}

function normalizeAutocompleteResult(
  item: GeoapifyAutocompleteResult,
  index: number,
  language: SearchLanguage,
): SearchCandidate | null {
  const latitude = toFiniteNumber(item.lat);
  const longitude = toFiniteNumber(item.lon);

  if (
    latitude === null ||
    longitude === null ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return null;
  }

  const address = buildAddress(
    item.formatted,
    item.address_line1,
    item.address_line2,
    item.name,
  );

  const name = buildName(
    item.name,
    item.address_line1,
    item.city,
    item.district,
    item.suburb,
    item.state,
    item.country,
    address,
  );

  const placeId = item.place_id?.trim() || null;

  return {
    id:
      placeId ??
      `autocomplete-${language}-${latitude.toFixed(7)}-${longitude.toFixed(7)}-${index}`,

    name,
    address,

    addressLine1: item.address_line1 ?? null,
    addressLine2: item.address_line2 ?? null,

    city: item.city ?? null,
    district: item.district ?? item.suburb ?? null,
    county: item.county ?? null,
    state: item.state ?? null,
    postcode: item.postcode ?? null,

    country: item.country ?? null,
    countryCode: item.country_code?.trim().toLowerCase() ?? null,

    latitude,
    longitude,

    type: item.result_type ?? null,

    geoapifyPlaceId: placeId,
    source: "autocomplete",
    language,
  };
}

function normalizePlacesFeature(
  feature: GeoapifyPlacesFeature,
  index: number,
  language: SearchLanguage,
): SearchCandidate | null {
  const properties = feature.properties;

  if (!properties) {
    return null;
  }

  const geometryLongitude = feature.geometry?.coordinates?.[0];
  const geometryLatitude = feature.geometry?.coordinates?.[1];

  const latitude =
    toFiniteNumber(properties.lat) ?? toFiniteNumber(geometryLatitude);

  const longitude =
    toFiniteNumber(properties.lon) ?? toFiniteNumber(geometryLongitude);

  if (
    latitude === null ||
    longitude === null ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return null;
  }

  const address = buildAddress(
    properties.formatted,
    properties.address_line1,
    properties.address_line2,
    properties.name,
  );

  const name = buildName(
    properties.name,
    properties.address_line1,
    properties.city,
    properties.district,
    properties.suburb,
    properties.state,
    properties.country,
    address,
  );

  const placeId = properties.place_id?.trim() || null;

  return {
    id:
      placeId ??
      `places-${language}-${latitude.toFixed(7)}-${longitude.toFixed(7)}-${index}`,

    name,
    address,

    addressLine1: properties.address_line1 ?? null,
    addressLine2: properties.address_line2 ?? null,

    city: properties.city ?? null,
    district: properties.district ?? properties.suburb ?? null,
    county: properties.county ?? null,
    state: properties.state ?? null,
    postcode: properties.postcode ?? null,

    country: properties.country ?? null,
    countryCode: properties.country_code?.trim().toLowerCase() ?? null,

    latitude,
    longitude,

    type: properties.categories?.[0] ?? "place",

    geoapifyPlaceId: placeId,
    source: "places",
    language,
  };
}

async function fetchAutocomplete(
  query: string,
  language: SearchLanguage,
  apiKey: string,
  userBias: UserBias | null,
): Promise<SearchCandidate[]> {
  const params = new URLSearchParams({
    text: query,
    format: "json",
    lang: language,
    filter: "countrycode:kh",
    limit: "15",
    apiKey,
  });

  if (userBias) {
    params.set("bias", `proximity:${userBias.longitude},${userBias.latitude}`);
  }

  const response = await fetch(
    `https://api.geoapify.com/v1/geocode/autocomplete?${params.toString()}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const errorText = await response.text();

    console.error(`[GEOAPIFY AUTOCOMPLETE ${language.toUpperCase()} ERROR]`, {
      status: response.status,
      response: errorText,
    });

    return [];
  }

  const data = (await response.json()) as GeoapifyAutocompleteResponse;

  const rawResults = Array.isArray(data.results) ? data.results : [];

  return rawResults.flatMap((item, index) => {
    const normalized = normalizeAutocompleteResult(item, index, language);

    return normalized ? [normalized] : [];
  });
}

async function resolveCambodiaPlaceId(apiKey: string): Promise<string | null> {
  const params = new URLSearchParams({
    text: "Cambodia",
    type: "country",
    filter: "countrycode:kh",
    format: "json",
    lang: "en",
    limit: "1",
    apiKey,
  });

  const response = await fetch(
    `https://api.geoapify.com/v1/geocode/search?${params.toString()}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "force-cache",
    },
  );

  if (!response.ok) {
    const errorText = await response.text();

    console.error("[GEOAPIFY CAMBODIA PLACE ID ERROR]", {
      status: response.status,
      response: errorText,
    });

    return null;
  }

  const data = (await response.json()) as GeoapifyAutocompleteResponse;

  const placeId = data.results?.[0]?.place_id;

  return typeof placeId === "string" && placeId.trim() ? placeId.trim() : null;
}

function getCambodiaPlaceId(apiKey: string): Promise<string | null> {
  if (!cambodiaPlaceIdPromise) {
    cambodiaPlaceIdPromise = resolveCambodiaPlaceId(apiKey);
  }

  return cambodiaPlaceIdPromise;
}

async function fetchPlaces(
  query: string,
  language: SearchLanguage,
  apiKey: string,
  cambodiaPlaceId: string | null,
  userBias: UserBias | null,
): Promise<SearchCandidate[]> {
  if (!cambodiaPlaceId) {
    return [];
  }

  const params = new URLSearchParams({
    categories: CAMBODIA_POI_CATEGORIES,
    name: query,
    filter: `place:${cambodiaPlaceId}`,
    lang: language,
    limit: "30",
    apiKey,
  });

  if (userBias) {
    params.set("bias", `proximity:${userBias.longitude},${userBias.latitude}`);
  }

  const response = await fetch(
    `https://api.geoapify.com/v2/places?${params.toString()}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const errorText = await response.text();

    console.error(`[GEOAPIFY PLACES ${language.toUpperCase()} ERROR]`, {
      status: response.status,
      response: errorText,
    });

    return [];
  }

  const data = (await response.json()) as GeoapifyPlacesResponse;

  const features = Array.isArray(data.features) ? data.features : [];

  return features.flatMap((feature, index) => {
    const normalized = normalizePlacesFeature(feature, index, language);

    return normalized ? [normalized] : [];
  });
}

function scoreCandidate(
  candidate: SearchCandidate,
  query: string,
  preferredLanguage: SearchLanguage,
): number {
  const normalizedQuery = normalizeText(query);
  const normalizedName = normalizeText(candidate.name);
  const normalizedAddress = normalizeText(candidate.address);

  let score = 0;

  if (normalizedName === normalizedQuery) {
    score += 1_000;
  } else if (normalizedName.startsWith(normalizedQuery)) {
    score += 750;
  } else if (normalizedName.includes(normalizedQuery)) {
    score += 550;
  }

  if (normalizedAddress.includes(normalizedQuery)) {
    score += 250;
  }

  if (candidate.source === "places") {
    score += 140;
  }

  if (candidate.language === preferredLanguage) {
    score += 80;
  }

  if (candidate.countryCode === "kh") {
    score += 20;
  }

  return score;
}

function createDeduplicationKey(candidate: SearchCandidate): string {
  if (candidate.geoapifyPlaceId) {
    return `place:${candidate.geoapifyPlaceId}`;
  }

  return [
    normalizeText(candidate.name),
    candidate.latitude.toFixed(5),
    candidate.longitude.toFixed(5),
  ].join("|");
}

function toPublicResult(candidate: SearchCandidate): LocationSearchResult {
  return {
    id: candidate.id,

    name: candidate.name,
    address: candidate.address,

    addressLine1: candidate.addressLine1,
    addressLine2: candidate.addressLine2,

    city: candidate.city,
    district: candidate.district,
    county: candidate.county,
    state: candidate.state,
    postcode: candidate.postcode,

    country: candidate.country,
    countryCode: candidate.countryCode,

    latitude: candidate.latitude,
    longitude: candidate.longitude,

    type: candidate.type,
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const query = searchParams.get("q")?.trim() ?? "";

    if (query.length < 2) {
      return NextResponse.json({
        query,
        results: [],
      } satisfies LocationSearchResponse);
    }

    const apiKey = process.env.GEOAPIFY_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          query,
          results: [],
          message: "GEOAPIFY_API_KEY is not configured.",
        } satisfies LocationSearchResponse,
        {
          status: 500,
        },
      );
    }

    const userBias = getUserBias(searchParams);

    const preferredLanguage: SearchLanguage = containsKhmerText(query)
      ? "km"
      : "en";

    const cambodiaPlaceId = await getCambodiaPlaceId(apiKey);

    const [autocompleteKm, autocompleteEn, placesKm, placesEn] =
      await Promise.all([
        fetchAutocomplete(query, "km", apiKey, userBias),
        fetchAutocomplete(query, "en", apiKey, userBias),
        fetchPlaces(query, "km", apiKey, cambodiaPlaceId, userBias),
        fetchPlaces(query, "en", apiKey, cambodiaPlaceId, userBias),
      ]);

    const candidates = [
      ...autocompleteKm,
      ...autocompleteEn,
      ...placesKm,
      ...placesEn,
    ];

    const rankedCandidates = [...candidates].sort(
      (first, second) =>
        scoreCandidate(second, query, preferredLanguage) -
        scoreCandidate(first, query, preferredLanguage),
    );

    const seen = new Set<string>();

    const uniqueCandidates = rankedCandidates.filter((candidate) => {
      const key = createDeduplicationKey(candidate);

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);

      return true;
    });

    const cambodiaOnlyCandidates = uniqueCandidates.filter(
      (candidate) =>
        candidate.countryCode === "kh" ||
        (candidate.source === "places" && candidate.countryCode === null),
    );

    const results = cambodiaOnlyCandidates.slice(0, 12).map(toPublicResult);

    console.log("[CAMBODIA GEOAPIFY SEARCH]", {
      query,
      preferredLanguage,
      hasUserBias: Boolean(userBias),
      cambodiaPlaceIdResolved: Boolean(cambodiaPlaceId),
      autocompleteKm: autocompleteKm.length,
      autocompleteEn: autocompleteEn.length,
      placesKm: placesKm.length,
      placesEn: placesEn.length,
      finalResults: results.length,
    });

    return NextResponse.json({
      query,
      results,
      message:
        results.length === 0 ? "រកមិនឃើញទីតាំងនេះនៅក្នុងប្រទេសកម្ពុជា។" : null,
    } satisfies LocationSearchResponse);
  } catch (error) {
    console.error("[CAMBODIA GEOAPIFY SEARCH ERROR]", error);

    return NextResponse.json(
      {
        query: "",
        results: [],
        message: "មានបញ្ហាក្នុងការស្វែងរកទីតាំង។",
      } satisfies LocationSearchResponse,
      {
        status: 500,
      },
    );
  }
}
