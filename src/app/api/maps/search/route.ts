import { NextRequest, NextResponse } from "next/server";
import type {
  LocationSearchResponse,
  LocationSearchResult,
} from "@/types/location-search";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface UserBias {
  latitude: number;
  longitude: number;
}

function containsKhmerText(value: string): boolean {
  return /[\u1780-\u17FF]/u.test(value);
}

function normalizeText(value: string): string {
  return value.trim().toLowerCase().normalize("NFKC");
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

  return { latitude, longitude };
}

// 1. PHOTON SEARCH (Fast, multilingual, OpenStreetMap POIs & autocomplete)
async function fetchFromPhoton(
  query: string,
  userBias: UserBias | null,
): Promise<LocationSearchResult[]> {
  try {
    const lat = userBias ? userBias.latitude : 11.5564;
    const lon = userBias ? userBias.longitude : 104.9282;

    const params = new URLSearchParams({
      q: query,
      limit: "15",
      lat: String(lat),
      lon: String(lon),
      lang: "default",
    });

    const response = await fetch(
      `https://photon.komoot.io/api/?${params.toString()}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "User-Agent": "FoodHub-Cambodia-Search/1.0",
        },
        cache: "no-store",
      },
    );

    if (!response.ok) return [];

    const data = await response.json();
    const features = Array.isArray(data?.features) ? data.features : [];

    const results: LocationSearchResult[] = [];

    for (let index = 0; index < features.length; index++) {
      const f = features[index];
      const props = f?.properties || {};
      const coords = f?.geometry?.coordinates;

      if (!coords || coords.length < 2) continue;
      const longitude = Number(coords[0]);
      const latitude = Number(coords[1]);

      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) continue;

      const countryCode = (props.countrycode || props.country_code || "")
        .trim()
        .toLowerCase();
      // Filter primarily for Cambodia (KH) or close proximity
      if (countryCode && countryCode !== "kh") continue;

      const name =
        props.name?.trim() ||
        props.street?.trim() ||
        props.district?.trim() ||
        props.city?.trim() ||
        query;

      const parts = [
        props.name,
        props.street ? `${props.street}${props.housenumber ? ` #${props.housenumber}` : ""}` : null,
        props.district,
        props.city,
        props.state,
        props.country || "Cambodia",
      ].filter(Boolean);

      const address = Array.from(new Set(parts)).join(", ");

      results.push({
        id: `photon-${latitude.toFixed(6)}-${longitude.toFixed(6)}-${index}`,
        name,
        address,
        addressLine1: props.street || null,
        addressLine2: props.district || null,
        city: props.city || null,
        district: props.district || null,
        county: props.county || null,
        state: props.state || null,
        postcode: props.postcode || null,
        country: props.country || "Cambodia",
        countryCode: "kh",
        latitude,
        longitude,
        type: props.osm_value || props.type || "place",
      });
    }

    return results;
  } catch (err) {
    console.error("[PHOTON SEARCH ERROR]", err);
    return [];
  }
}

// 2. NOMINATIM SEARCH (Cambodia-specific countrycode: kh)
async function fetchFromNominatim(
  query: string,
): Promise<LocationSearchResult[]> {
  try {
    const params = new URLSearchParams({
      q: query,
      format: "jsonv2",
      countrycodes: "kh",
      addressdetails: "1",
      limit: "10",
    });

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?${params.toString()}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "User-Agent": "FoodHub-Cambodia-Search/1.0",
        },
        cache: "no-store",
      },
    );

    if (!response.ok) return [];

    const data = await response.json();
    if (!Array.isArray(data)) return [];

    return data.map((item: any, index: number) => {
      const addr = item.address || {};
      const name =
        addr.amenity ||
        addr.shop ||
        addr.tourism ||
        addr.building ||
        addr.road ||
        addr.village ||
        addr.suburb ||
        addr.neighbourhood ||
        addr.quarter ||
        addr.city ||
        addr.town ||
        item.name ||
        query;

      const latitude = Number(item.lat);
      const longitude = Number(item.lon);

      return {
        id: `osm-${item.osm_id || index}-${latitude.toFixed(6)}-${longitude.toFixed(6)}`,
        name: String(name).trim() || item.display_name.split(",")[0],
        address: item.display_name,
        addressLine1: addr.road || null,
        addressLine2: addr.suburb || addr.village || null,
        city: addr.city || addr.town || null,
        district: addr.suburb || addr.county || null,
        county: addr.county || null,
        state: addr.state || null,
        postcode: addr.postcode || null,
        country: addr.country || "Cambodia",
        countryCode: "kh",
        latitude,
        longitude,
        type: item.type || item.category || "place",
      };
    });
  } catch (err) {
    console.error("[NOMINATIM SEARCH ERROR]", err);
    return [];
  }
}

// 3. GEOAPIFY SEARCH (Optional fallback if API key is provided)
async function fetchFromGeoapify(
  query: string,
  apiKey: string,
  userBias: UserBias | null,
): Promise<LocationSearchResult[]> {
  try {
    const lang = containsKhmerText(query) ? "km" : "en";
    const params = new URLSearchParams({
      text: query,
      format: "json",
      lang,
      filter: "countrycode:kh",
      limit: "10",
      apiKey,
    });

    if (userBias) {
      params.set("bias", `proximity:${userBias.longitude},${userBias.latitude}`);
    }

    const response = await fetch(
      `https://api.geoapify.com/v1/geocode/autocomplete?${params.toString()}`,
      {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
      },
    );

    if (!response.ok) return [];

    const data = await response.json();
    const results = Array.isArray(data?.results) ? data.results : [];

    return results.map((item: any, index: number) => ({
      id: item.place_id || `geoapify-${index}`,
      name: item.name || item.address_line1 || query,
      address: item.formatted || item.address_line1 || query,
      addressLine1: item.address_line1 || null,
      addressLine2: item.address_line2 || null,
      city: item.city || null,
      district: item.district || item.suburb || null,
      county: item.county || null,
      state: item.state || null,
      postcode: item.postcode || null,
      country: item.country || "Cambodia",
      countryCode: "kh",
      latitude: Number(item.lat),
      longitude: Number(item.lon),
      type: item.result_type || "place",
    }));
  } catch (err) {
    console.error("[GEOAPIFY SEARCH ERROR]", err);
    return [];
  }
}

function scoreCandidate(candidate: LocationSearchResult, query: string): number {
  const normQuery = normalizeText(query);
  const normName = normalizeText(candidate.name);
  const normAddress = normalizeText(candidate.address);

  let score = 0;
  if (normName === normQuery) score += 1000;
  else if (normName.startsWith(normQuery)) score += 700;
  else if (normName.includes(normQuery)) score += 500;

  if (normAddress.includes(normQuery)) score += 250;

  if (candidate.countryCode === "kh") score += 100;
  return score;
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

    const userBias = getUserBias(searchParams);
    const geoapifyKey = process.env.GEOAPIFY_API_KEY?.trim();

    // Query Photon + Nominatim + Geoapify (if key exists) in parallel
    const searchPromises: Promise<LocationSearchResult[]>[] = [
      fetchFromPhoton(query, userBias),
      fetchFromNominatim(query),
    ];

    if (geoapifyKey) {
      searchPromises.push(fetchFromGeoapify(query, geoapifyKey, userBias));
    }

    const searchResponses = await Promise.allSettled(searchPromises);
    const allCandidates: LocationSearchResult[] = [];

    for (const res of searchResponses) {
      if (res.status === "fulfilled" && Array.isArray(res.value)) {
        allCandidates.push(...res.value);
      }
    }

    // Deduplicate by close latitude/longitude or name
    const seen = new Set<string>();
    const uniqueCandidates: LocationSearchResult[] = [];

    for (const c of allCandidates) {
      if (!Number.isFinite(c.latitude) || !Number.isFinite(c.longitude)) continue;
      const key = `${normalizeText(c.name)}|${c.latitude.toFixed(4)}|${c.longitude.toFixed(4)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      uniqueCandidates.push(c);
    }

    // Rank results
    const ranked = uniqueCandidates.sort(
      (a, b) => scoreCandidate(b, query) - scoreCandidate(a, query),
    );

    const results = ranked.slice(0, 15);

    return NextResponse.json({
      query,
      results,
      message:
        results.length === 0 ? "រកមិនឃើញទីតាំងនេះនៅក្នុងប្រទេសកម្ពុជាទេ។" : null,
    } satisfies LocationSearchResponse);
  } catch (error) {
    console.error("[CAMBODIA SEARCH ERROR]", error);
    return NextResponse.json(
      {
        query: "",
        results: [],
        message: "មានបញ្ហាក្នុងការស្វែងរកទីតាំង។",
      } satisfies LocationSearchResponse,
      { status: 500 },
    );
  }
}
