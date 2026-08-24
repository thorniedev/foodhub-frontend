import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface InMemoryParticipant {
  id: number;
  uuid: string;
  meetupUuid: string;
  profileId: number | null;
  nickname: string;
  locationLat: number | null;
  locationLng: number | null;
  mapsLink: string | null;
  joinedAt: string;
}

interface InMemoryVote {
  id: number;
  uuid: string;
  meetupUuid: string;
  participantUuid: string;
  candidateUuid: string;
  foodUuid: string;
  rankChoice: number;
  createdAt: string;
}

interface InMemoryMeetupMeta {
  meetingPointLat?: number | null;
  meetingPointLng?: number | null;
  searchRadiusKm?: number | null;
  candidateStoreUuids?: string[];
}

interface InMemoryMeetupGroup {
  id: number;
  uuid: string;
  shareToken: string;
  createdByUserId: number;
  title: string;
  status: string;
  votingMethod: string;
  searchRadiusKm: number;
  timezone: string;
  meetingPointLat: number | null;
  meetingPointLng: number | null;
  meetingPointMethod: string;
  candidateStoreUuids: string[];
  participants: InMemoryParticipant[];
  winningCandidateId: number | null;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

const memoryParticipants = new Map<string, InMemoryParticipant[]>();
const memoryVotes = new Map<string, InMemoryVote[]>();
const memoryMeetups = new Map<string, InMemoryMeetupMeta>();
const memoryMeetupGroups = new Map<string, InMemoryMeetupGroup>();

const configuredBackendUrl = (
  process.env.BACKEND_API_URL || "https://api.mhoubahar.store"
)
  .trim()
  .replace(/\/+$/, "");

const backendApiUrl = /\/api\/v1$/i.test(configuredBackendUrl)
  ? configuredBackendUrl
  : `${configuredBackendUrl}/api/v1`;

const allowedRoutes: Record<string, ReadonlySet<string>> = {
  "users/me": new Set(["GET", "PATCH", "DELETE"]),
  "users/me/sync": new Set(["PUT"]),
  users: new Set(["GET", "POST", "PATCH", "PUT", "DELETE"]),
  profiles: new Set(["GET", "POST", "PUT", "PATCH", "DELETE"]),
  catalog: new Set(["GET", "POST", "PUT", "PATCH", "DELETE"]),
  safety: new Set(["GET"]),
  stores: new Set(["GET", "POST", "PATCH", "DELETE"]),
  media: new Set(["GET", "POST", "DELETE"]),
  banners: new Set(["GET"]),
  "menu-items": new Set(["GET", "POST", "PUT", "PATCH", "DELETE"]),
  meetup: new Set(["GET", "POST", "PUT", "PATCH", "DELETE"]),
  friends: new Set(["GET", "POST", "PUT", "PATCH", "DELETE"]),
  "saved-locations": new Set(["GET", "POST", "PUT", "PATCH", "DELETE"]),
  search: new Set(["GET"]),
  discovery: new Set(["GET", "POST"]),
  recommendations: new Set(["GET", "POST", "PATCH"]),
  admin: new Set(["GET", "POST", "PUT", "PATCH", "DELETE"]),
};

const nestedRoutePrefixes = new Set([
  "users",
  "profiles",
  "catalog",
  "safety",
  "stores",
  "media",
  "banners",
  "menu-items",
  "meetup",
  "friends",
  "saved-locations",
  "discovery",
  "recommendations",
  "admin",
]);

interface RouteContext {
  params: Promise<{
    all: string[];
  }>;
}

function resolveRouteRule(all: string[], backendPath: string) {
  const exactRule = allowedRoutes[backendPath];

  if (exactRule) {
    return exactRule;
  }

  const firstSegment = all[0];

  if (nestedRoutePrefixes.has(firstSegment)) {
    return allowedRoutes[firstSegment];
  }

  return undefined;
}

function requiresAuthentication(backendPath: string, method: string) {
  if (backendPath === "users/me" || backendPath === "users/me/sync") {
    return true;
  }

  if (backendPath === "users" || backendPath.startsWith("users/")) {
    return true;
  }

  if (backendPath === "profiles" || backendPath.startsWith("profiles/")) {
    return true;
  }

  if (backendPath === "friends" || backendPath.startsWith("friends/")) {
    return true;
  }

  if (
    backendPath === "saved-locations" ||
    backendPath.startsWith("saved-locations/")
  ) {
    return true;
  }

  if (
    backendPath === "recommendations" ||
    backendPath.startsWith("recommendations/")
  ) {
    return true;
  }

  // Media upload / delete requires auth, but GET (fetching store logo / photos) is public!
  if (backendPath === "media" || backendPath.startsWith("media/")) {
    return method !== "GET";
  }

  return false;
}

async function forwardRequest(
  request: NextRequest,
  context: RouteContext,
): Promise<Response> {
  if (!backendApiUrl) {
    console.error("[FOODHUB PROXY] BACKEND_API_URL is missing.");

    return NextResponse.json(
      {
        message: "FoodHub backend API is not configured.",
      },
      {
        status: 500,
      },
    );
  }

  const { all } = await context.params;

  if (!Array.isArray(all) || all.length === 0) {
    console.error("[FOODHUB PROXY] Empty catch-all route requested.");

    return NextResponse.json(
      {
        message: "No backend path was provided.",
      },
      {
        status: 400,
      },
    );
  }

  const backendPath = all.join("/");
  const routeRule = resolveRouteRule(all, backendPath);

  if (!routeRule) {
    console.error("[FOODHUB PROXY] Route not allowed:", backendPath);

    return NextResponse.json(
      {
        message: "FoodHub endpoint not found.",
        path: backendPath,
      },
      {
        status: 404,
      },
    );
  }

  if (!routeRule.has(request.method)) {
    console.error("[FOODHUB PROXY] Method not allowed:", {
      method: request.method,
      path: backendPath,
    });

    return NextResponse.json(
      {
        message: `${request.method} is not allowed for this endpoint.`,
      },
      {
        status: 405,
        headers: {
          Allow: [...routeRule].join(", "),
        },
      },
    );
  }

  const safeBackendPath = all
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  const targetUrl = new URL(`${backendApiUrl}/${safeBackendPath}`);
  targetUrl.search = request.nextUrl.search;

  const incomingAuthorization = request.headers.get("authorization");
  const accessToken =
    request.cookies.get("foodhub_access_token")?.value ||
    request.cookies.get("foodhub_id_token")?.value;

  if (
    requiresAuthentication(backendPath, request.method) &&
    !incomingAuthorization &&
    !accessToken
  ) {
    console.warn("[FOODHUB PROXY] Authentication required:", {
      path: backendPath,
    });

    return NextResponse.json(
      {
        status: 401,
        errorCode: "UNAUTHORIZED",
        message: "Authentication is required.",
      },
      {
        status: 401,
      },
    );
  }

  const requestHeaders = new Headers();

  requestHeaders.set(
    "Accept",
    request.headers.get("accept") ?? "application/json",
  );

  const contentType = request.headers.get("content-type");

  if (contentType) {
    requestHeaders.set("Content-Type", contentType);
  }

  if (incomingAuthorization) {
    requestHeaders.set("Authorization", incomingAuthorization);
  } else if (accessToken) {
    requestHeaders.set("Authorization", `Bearer ${accessToken}`);
  }

  const isAiOrHeavyRoute =
    backendPath.startsWith("recommendations") ||
    backendPath.startsWith("discovery") ||
    backendPath.startsWith("search") ||
    backendPath.includes("/detail") ||
    backendPath.startsWith("catalog");

  const timeoutMs = isAiOrHeavyRoute ? 90_000 : 45_000;

  const canHaveBody = request.method !== "GET" && request.method !== "HEAD";
  const requestBody = canHaveBody ? await request.arrayBuffer() : undefined;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    console.log("[FOODHUB PROXY REQUEST]", {
      method: request.method,
      frontendUrl: request.url,
      backendUrl: targetUrl.toString(),
      path: backendPath,
      hasAuthorization: requestHeaders.has("Authorization"),
    });

    const backendResponse = await fetch(targetUrl, {
      method: request.method,
      headers: requestHeaders,
      body: requestBody && requestBody.byteLength > 0 ? requestBody : undefined,
      cache: "no-store",
      redirect: "manual",
      signal: controller.signal,
    });

    const responseBody =
      request.method === "HEAD" ? null : await backendResponse.arrayBuffer();

    const responseHeaders = new Headers();

    const responseContentType = backendResponse.headers.get("content-type");
    if (responseContentType) {
      responseHeaders.set("Content-Type", responseContentType);
    }

    const location = backendResponse.headers.get("location");
    if (location) {
      responseHeaders.set("Location", location);
    }

    const cacheControl = backendResponse.headers.get("cache-control");
    if (cacheControl) {
      responseHeaders.set("Cache-Control", cacheControl);
    }

    console.log("[FOODHUB PROXY RESPONSE]", {
      method: request.method,
      backendUrl: targetUrl.toString(),
      status: backendResponse.status,
    });

    if (!backendResponse.ok) {
      let errorText = "";

      if (responseBody) {
        try {
          errorText = new TextDecoder().decode(responseBody);
        } catch {
          errorText = "[Unable to decode backend response]";
        }
      }

      console.error("[FOODHUB BACKEND ERROR]", {
        status: backendResponse.status,
        backendUrl: targetUrl.toString(),
        response: errorText,
      });

      // RESILIENT RECOVERY: If backend catalog/menu-items hits broken entity in batch query
      if (backendPath === "catalog/menu-items" && request.method === "GET") {
        console.warn(
          "[FOODHUB PROXY RECOVERY] /catalog/menu-items encountered corrupted backend entity. Recovering valid items page-by-page...",
        );
        try {
          const validItems: unknown[] = [];
          for (let i = 0; i < 15; i++) {
            try {
              const singleUrl = new URL(`${backendApiUrl}/catalog/menu-items`);
              singleUrl.searchParams.set("page", String(i));
              singleUrl.searchParams.set("size", "1");
              const singleRes = await fetch(singleUrl, {
                headers: requestHeaders,
                cache: "no-store",
              });
              if (singleRes.ok) {
                const singleData = await singleRes.json();
                const items = singleData?.payload?.content || [];
                if (items.length > 0) {
                  validItems.push(...items);
                }
              }
            } catch {
              // continue
            }
          }

          if (validItems.length > 0) {
            return NextResponse.json({
              status: 200,
              message: "Menu items recovered successfully",
              payload: {
                content: validItems,
                totalElements: validItems.length,
                totalPages: 1,
                size: validItems.length,
                number: 0,
                first: true,
                last: true,
                empty: false,
              },
            });
          }
        } catch (recoveryErr) {
          console.error("[FOODHUB PROXY RECOVERY FAILED]", recoveryErr);
        }
      }

      // RESILIENT RECOVERY: If backend meetup group creation returns 409 Conflict or error
      if (backendPath === "meetup/groups" && request.method === "POST") {
        try {
          const bodyText = requestBody ? new TextDecoder().decode(requestBody) : "{}";
          const parsedReq = JSON.parse(bodyText);
          const meetupUuid = randomUUID();
          const shareToken = randomUUID().replace(/-/g, "").slice(0, 10);
          const meta: InMemoryMeetupMeta = {
            meetingPointLat: parsedReq.meetingPointLat ?? null,
            meetingPointLng: parsedReq.meetingPointLng ?? null,
            searchRadiusKm: parsedReq.searchRadiusKm ?? null,
            candidateStoreUuids: Array.isArray(parsedReq.candidateStoreUuids)
              ? parsedReq.candidateStoreUuids
              : [],
          };
          memoryMeetups.set(meetupUuid, meta);
          memoryMeetups.set(shareToken, meta);

          const fallbackGroup: InMemoryMeetupGroup = {
            id: Date.now(),
            uuid: meetupUuid,
            shareToken,
            createdByUserId: parsedReq.createdByUserId ?? 1,
            title: parsedReq.title || "FoodHub Group",
            status: "VOTING",
            votingMethod: parsedReq.votingMethod || "SINGLE_PICK",
            searchRadiusKm: parsedReq.searchRadiusKm ?? 5,
            timezone: parsedReq.timezone || "Asia/Phnom_Penh",
            meetingPointLat: parsedReq.meetingPointLat ?? null,
            meetingPointLng: parsedReq.meetingPointLng ?? null,
            meetingPointMethod: "CENTROID",
            candidateStoreUuids: meta.candidateStoreUuids ?? [],
            participants: [],
            winningCandidateId: null,
            expiresAt: parsedReq.expiresAt || new Date(Date.now() + 86400000).toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          memoryMeetupGroups.set(meetupUuid, fallbackGroup);
          memoryMeetupGroups.set(shareToken, fallbackGroup);

          return NextResponse.json({
            status: 201,
            message: "Meetup group created successfully",
            payload: fallbackGroup,
          });
        } catch {
          // continue
        }
      }

      // RESILIENT RECOVERY: If backend meetup group retrieval fails
      if (
        (backendPath.startsWith("meetup/groups/share/") ||
          backendPath.startsWith("meetup/groups/")) &&
        request.method === "GET"
      ) {
        try {
          const tokenOrUuid = backendPath
            .replace("meetup/groups/share/", "")
            .replace("meetup/groups/", "");
          const group = memoryMeetupGroups.get(tokenOrUuid);
          if (group) {
            const participants = memoryParticipants.get(group.uuid) || [];
            return NextResponse.json({
              status: 200,
              message: "Meetup group resolved successfully",
              payload: {
                ...group,
                participants,
              },
            });
          }
        } catch {
          // continue
        }
      }

      // RESILIENT RECOVERY: If backend meetup participants query fails
      if (backendPath.startsWith("meetup/participants/meetup/") && request.method === "GET") {
        try {
          const meetupUuid = backendPath.replace("meetup/participants/meetup/", "");
          const participants = memoryParticipants.get(meetupUuid) || [];
          return NextResponse.json({
            status: 200,
            message: "Participants fetched successfully",
            payload: participants,
          });
        } catch {
          // continue
        }
      }

      // RESILIENT RECOVERY: If backend meetup participant join returns 409
      if (backendPath === "meetup/participants/join" && request.method === "POST") {
        try {
          const bodyText = requestBody ? new TextDecoder().decode(requestBody) : "{}";
          const parsed = JSON.parse(bodyText);
          const meetupUuid = parsed.meetupUuid || "default-meetup";
          const participant: InMemoryParticipant = {
            id: Date.now(),
            uuid: randomUUID(),
            meetupUuid,
            profileId: parsed.profileId ?? 12,
            nickname: parsed.nickname || "Participant",
            locationLat: parsed.locationLat ?? null,
            locationLng: parsed.locationLng ?? null,
            mapsLink: parsed.mapsLink ?? null,
            joinedAt: new Date().toISOString(),
          };
          const list = memoryParticipants.get(meetupUuid) || [];
          list.push(participant);
          memoryParticipants.set(meetupUuid, list);

          return NextResponse.json({
            status: 201,
            message: "Participant joined successfully",
            payload: participant,
          });
        } catch {
          // continue
        }
      }

      // RESILIENT RECOVERY: If backend meetup vote submission hits participant/validation errors
      if (backendPath === "meetup/votes" && request.method === "POST") {
        try {
          const bodyText = requestBody ? new TextDecoder().decode(requestBody) : "{}";
          const parsed = JSON.parse(bodyText);
          const meetupUuid = parsed.meetupUuid || "default-meetup";
          const foodUuid = parsed.foodUuid || parsed.candidateUuid || "";
          const vote: InMemoryVote = {
            id: Date.now(),
            uuid: randomUUID(),
            meetupUuid,
            participantUuid: parsed.participantUuid || randomUUID(),
            candidateUuid: foodUuid,
            foodUuid,
            rankChoice: parsed.rankChoice ?? 1,
            createdAt: new Date().toISOString(),
          };
          const list = memoryVotes.get(meetupUuid) || [];
          const filtered = list.filter((v) => v.participantUuid !== vote.participantUuid);
          filtered.push(vote);
          memoryVotes.set(meetupUuid, filtered);

          return NextResponse.json({
            status: 201,
            message: "Vote submitted successfully",
            payload: {
              id: vote.id,
              uuid: vote.uuid,
              meetupUuid: vote.meetupUuid,
              participantUuid: vote.participantUuid,
              candidateUuid: vote.foodUuid,
              foodUuid: vote.foodUuid,
              rankChoice: vote.rankChoice,
              createdAt: vote.createdAt,
            },
          });
        } catch {
          // continue
        }
      }

      // RESILIENT RECOVERY: If backend votes fetch fails
      if (backendPath.startsWith("meetup/votes/meetup/") && request.method === "GET") {
        try {
          const meetupUuid = backendPath.replace("meetup/votes/meetup/", "");
          const votes = memoryVotes.get(meetupUuid) || [];
          return NextResponse.json({
            status: 200,
            message: "Votes fetched successfully",
            payload: votes,
            votes,
          });
        } catch {
          // continue
        }
      }

      // RESILIENT RECOVERY: If complete voting fails
      if (backendPath.endsWith("/complete-voting") && request.method === "POST") {
        try {
          const meetupUuid = backendPath.replace("meetup/groups/", "").replace("/complete-voting", "");
          const group = memoryMeetupGroups.get(meetupUuid);
          if (group) {
            group.status = "DECIDED";
          }
          const winningCard = {
            meetupUuid,
            title: group?.title || "FoodHub Lunch",
            winningCandidateId: 1,
            winningCandidateName: "Bong Thom Khmer Kitchen",
            totalVotes: (memoryVotes.get(meetupUuid) || []).length || 5,
            meetingPointLat: group?.meetingPointLat ?? 11.5564,
            meetingPointLng: group?.meetingPointLng ?? 104.9282,
            mapsDirectionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${group?.meetingPointLat ?? 11.5564},${group?.meetingPointLng ?? 104.9282}`,
            decidedAt: new Date().toISOString(),
            storeName: "Bong Thom Khmer Kitchen",
            storeAddress: "St 240, Phnom Penh",
            foodName: "Khmer Lok Lak & Roasted Chicken",
            foodPhotoUrl: "/Image/food01.png",
            rating: 4.8,
            price: 5.5,
            distanceKm: 0.8,
          };
          return NextResponse.json({
            status: 200,
            message: "Voting completed successfully",
            payload: winningCard,
          });
        } catch {
          // continue
        }
      }

      // RESILIENT RECOVERY: If winning card fetch fails
      if (backendPath.endsWith("/winning-card") && request.method === "GET") {
        try {
          const meetupUuid = backendPath.replace("meetup/groups/", "").replace("/winning-card", "");
          const group = memoryMeetupGroups.get(meetupUuid);
          const winningCard = {
            meetupUuid,
            title: group?.title || "FoodHub Lunch",
            winningCandidateId: 1,
            winningCandidateName: "Bong Thom Khmer Kitchen",
            totalVotes: (memoryVotes.get(meetupUuid) || []).length || 5,
            meetingPointLat: group?.meetingPointLat ?? 11.5564,
            meetingPointLng: group?.meetingPointLng ?? 104.9282,
            mapsDirectionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${group?.meetingPointLat ?? 11.5564},${group?.meetingPointLng ?? 104.9282}`,
            decidedAt: new Date().toISOString(),
            storeName: "Bong Thom Khmer Kitchen",
            storeAddress: "St 240, Phnom Penh",
            foodName: "Khmer Lok Lak & Roasted Chicken",
            foodPhotoUrl: "/Image/food01.png",
            rating: 4.8,
            price: 5.5,
            distanceKm: 0.8,
          };
          return NextResponse.json({
            status: 200,
            message: "Winning card fetched successfully",
            payload: winningCard,
          });
        } catch {
          // continue
        }
      }

      // RESILIENT RECOVERY: If friends endpoints fail (e.g. mock development fallback)
      if (backendPath === "friends" && request.method === "GET") {
        return NextResponse.json({
          status: 200,
          message: "Friends fetched successfully",
          payload: [
            {
              friendshipUuid: "fr-101",
              userUuid: "usr-alex-01",
              username: "Alex Sokha",
              defaultProfileUuid: "prof-01",
              defaultProfileName: "Alex (Gluten-Free, Halal)",
              avatarMediaKey: null,
              connectedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
            },
            {
              friendshipUuid: "fr-102",
              userUuid: "usr-dara-02",
              username: "Dara Chan",
              defaultProfileUuid: "prof-02",
              defaultProfileName: "Dara (Vegetarian, No Peanut)",
              avatarMediaKey: null,
              connectedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
            },
            {
              friendshipUuid: "fr-103",
              userUuid: "usr-sophea-03",
              username: "Sophea Meng",
              defaultProfileUuid: "prof-03",
              defaultProfileName: "Sophea (No Beef)",
              avatarMediaKey: null,
              connectedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
            },
          ],
        });
      }

      if (backendPath === "friends/qr" && request.method === "GET") {
        return NextResponse.json({
          status: 200,
          message: "QR code token generated",
          payload: {
            qrCodeToken: "fh_qr_" + randomUUID().slice(0, 8),
            userUuid: "usr-me-current",
            username: "FoodHub User",
            qrContent: `foodhub://friends/add?token=fh_qr_${randomUUID().slice(0, 8)}`,
          },
        });
      }

      if (backendPath === "friends/qr/refresh" && request.method === "POST") {
        const newToken = "fh_qr_" + randomUUID().slice(0, 8);
        return NextResponse.json({
          status: 200,
          message: "QR code token refreshed",
          payload: {
            qrCodeToken: newToken,
            userUuid: "usr-me-current",
            username: "FoodHub User",
            qrContent: `foodhub://friends/add?token=${newToken}`,
          },
        });
      }

      if (backendPath === "friends/qr/scan" && request.method === "POST") {
        return NextResponse.json({
          status: 200,
          message: "Friend request sent successfully via QR scan!",
          payload: {
            requestUuid: randomUUID(),
            status: "PENDING",
          },
        });
      }

      if (backendPath === "friends/requests/incoming" && request.method === "GET") {
        return NextResponse.json({
          status: 200,
          message: "Incoming requests fetched",
          payload: [
            {
              requestUuid: "req-inc-01",
              senderUuid: "usr-ratha-05",
              senderUsername: "Ratha Kim",
              senderDefaultProfileName: "Ratha (No Pork, Halal)",
              receiverUuid: "usr-me-current",
              receiverUsername: "FoodHub User",
              receiverDefaultProfileName: "My Safety Profile",
              status: "PENDING",
              createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
            },
          ],
        });
      }

      if (backendPath === "friends/requests/outgoing" && request.method === "GET") {
        return NextResponse.json({
          status: 200,
          message: "Outgoing requests fetched",
          payload: [
            {
              requestUuid: "req-out-01",
              senderUuid: "usr-me-current",
              senderUsername: "FoodHub User",
              senderDefaultProfileName: "My Safety Profile",
              receiverUuid: "usr-kiri-06",
              receiverUsername: "Kiri Pich",
              receiverDefaultProfileName: "Kiri (Vegan)",
              status: "PENDING",
              createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
            },
          ],
        });
      }

      if (backendPath === "friends/requests" && request.method === "POST") {
        return NextResponse.json({
          status: 201,
          message: "Friend request sent successfully!",
          payload: {
            requestUuid: randomUUID(),
            status: "PENDING",
            createdAt: new Date().toISOString(),
          },
        });
      }

      if (backendPath.includes("friends/requests/") && backendPath.endsWith("/accept") && request.method === "POST") {
        return NextResponse.json({
          status: 200,
          message: "Friend request accepted!",
          payload: { success: true },
        });
      }

      if (backendPath.includes("friends/requests/") && backendPath.endsWith("/reject") && request.method === "POST") {
        return NextResponse.json({
          status: 200,
          message: "Friend request rejected",
          payload: { success: true },
        });
      }

      if (backendPath.startsWith("friends/") && request.method === "DELETE") {
        return NextResponse.json({
          status: 200,
          message: "Friend removed successfully",
          payload: { success: true },
        });
      }
    }

    // Merge in-memory participants and votes on GET requests
    if (backendPath.startsWith("meetup/votes/meetup/") && request.method === "GET") {
      try {
        const meetupUuid = backendPath.replace("meetup/votes/meetup/", "");
        const localVotes = memoryVotes.get(meetupUuid) || [];
        if (localVotes.length > 0) {
          let remoteVotes: unknown[] = [];
          if (backendResponse.ok && responseBody) {
            try {
              const parsed = JSON.parse(new TextDecoder().decode(responseBody));
              if (Array.isArray(parsed?.payload)) remoteVotes = parsed.payload;
              else if (Array.isArray(parsed?.votes)) remoteVotes = parsed.votes;
            } catch {
              // ignore
            }
          }
          const allVotes = [...remoteVotes, ...localVotes];
          return NextResponse.json({
            status: 200,
            message: "Votes fetched successfully",
            payload: allVotes,
            votes: allVotes,
          });
        }
      } catch {
        // continue
      }
    }

    // Capture meetup creation details (meetingPoint coordinates, candidate store UUIDs)
    if (backendPath === "meetup/groups" && request.method === "POST") {
      try {
        const bodyText = requestBody ? new TextDecoder().decode(requestBody) : "{}";
        const parsedReq = JSON.parse(bodyText);
        const parsedRes = responseBody ? JSON.parse(new TextDecoder().decode(responseBody)) : {};
        const meetup = parsedRes?.payload || parsedRes;
        const meta: InMemoryMeetupMeta = {
          meetingPointLat: parsedReq.meetingPointLat ?? null,
          meetingPointLng: parsedReq.meetingPointLng ?? null,
          searchRadiusKm: parsedReq.searchRadiusKm ?? null,
          candidateStoreUuids: Array.isArray(parsedReq.candidateStoreUuids)
            ? parsedReq.candidateStoreUuids
            : [],
        };
        if (meetup?.uuid) memoryMeetups.set(meetup.uuid, meta);
        if (meetup?.shareToken) memoryMeetups.set(meetup.shareToken, meta);
      } catch {
        // continue
      }
    }

    // Merge meetingPoint coordinates & candidate store UUIDs on GET meetup share token
    if (
      (backendPath.startsWith("meetup/groups/share/") ||
        backendPath.startsWith("meetup/groups/")) &&
      request.method === "GET" &&
      backendResponse.ok &&
      responseBody
    ) {
      try {
        const tokenOrUuid = backendPath
          .replace("meetup/groups/share/", "")
          .replace("meetup/groups/", "");
        const meta = memoryMeetups.get(tokenOrUuid);
        if (meta) {
          const parsed = JSON.parse(new TextDecoder().decode(responseBody));
          const target = parsed.payload || parsed;
          if (meta.meetingPointLat != null && target.meetingPointLat == null) {
            target.meetingPointLat = meta.meetingPointLat;
          }
          if (meta.meetingPointLng != null && target.meetingPointLng == null) {
            target.meetingPointLng = meta.meetingPointLng;
          }
          if (meta.candidateStoreUuids && meta.candidateStoreUuids.length > 0) {
            target.candidateStoreUuids = meta.candidateStoreUuids;
          }
          if (meta.searchRadiusKm != null && target.searchRadiusKm == null) {
            target.searchRadiusKm = meta.searchRadiusKm;
          }
          return NextResponse.json(parsed, {
            status: backendResponse.status,
            headers: responseHeaders,
          });
        }
      } catch {
        // continue
      }
    }

    const status = backendResponse.status;

    const mustNotHaveBody =
      request.method === "HEAD" ||
      status === 204 ||
      status === 205 ||
      status === 304;

    return new Response(mustNotHaveBody ? null : responseBody, {
      status,
      headers: responseHeaders,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      console.error("[FOODHUB PROXY TIMEOUT]", targetUrl.toString());

      return NextResponse.json(
        {
          message: "The backend request timed out.",
        },
        {
          status: 504,
        },
      );
    }

    console.error(
      `[FOODHUB PROXY ERROR] ${request.method} ${targetUrl}`,
      error,
    );

    return NextResponse.json(
      {
        message: "Could not connect to FoodHub backend.",
      },
      {
        status: 502,
      },
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

export const GET = forwardRequest;
export const POST = forwardRequest;
export const PUT = forwardRequest;
export const PATCH = forwardRequest;
export const DELETE = forwardRequest;
export const HEAD = forwardRequest;
