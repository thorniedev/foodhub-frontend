// services/recommendationService.ts
import { 
  CreateSessionRequest, 
  SessionResponse, 
  RecommendationItemDto, 
  ProfileSummary 
} from "@/types/recommendation";

const BASE_API = "https://api.mhoubahar.store/api/v1";

/**
 * Helper to get authentication headers
 */
function getAuthHeaders(token?: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/**
 * 1. Fetch user profiles to list selection options and identify default profile
 */
export async function fetchUserProfiles(token?: string): Promise<ProfileSummary[]> {
  const res = await fetch(`${BASE_API}/profiles?page=0&size=50`, {
    headers: getAuthHeaders(token),
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch profiles: ${res.statusText}`);
  }

  const data = await res.json();
  // Handle PageResponse structure: data.payload.content or data.content or data
  return data.payload?.content || data.content || data.items || (Array.isArray(data) ? data : []);
}

/**
 * 2. Full 2-step recommendation execution:
 *    Step 1 -> POST /recommendations/sessions (creates session)
 *    Step 2 -> GET /recommendations/sessions/{uuid}/items (retrieves items)
 */
export async function getRecommendations(
  request: CreateSessionRequest,
  token?: string,
  limit?: number
): Promise<{ session: SessionResponse; items: RecommendationItemDto[] }> {
  // Step 1: Create recommendation session
  const createRes = await fetch(`${BASE_API}/recommendations/sessions`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify(request),
  });

  if (!createRes.ok) {
    const errorBody = await createRes.json().catch(() => ({}));
    throw new Error(errorBody.message || `Failed to create session: ${createRes.statusText}`);
  }

  const sessionData = await createRes.json();
  const session: SessionResponse = sessionData.payload || sessionData;

  // Step 2: Fetch all ranked recommendation items for this session
  const itemsLimit = limit ?? request.requestedLimit ?? 50;
  const itemsRes = await fetch(`${BASE_API}/recommendations/sessions/${session.uuid}/items?limit=${itemsLimit}`, {
    headers: getAuthHeaders(token),
  });

  if (!itemsRes.ok) {
    throw new Error(`Failed to fetch recommendation items: ${itemsRes.statusText}`);
  }

  const itemsData = await itemsRes.json();
  const items: RecommendationItemDto[] = Array.isArray(itemsData)
    ? itemsData
    : itemsData.payload?.content || itemsData.payload || itemsData.content || itemsData.items || [];

  return { session, items };
}
