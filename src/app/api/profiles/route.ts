// import type { NextRequest } from "next/server";
// import { NextResponse } from "next/server";

// export const dynamic = "force-dynamic";

// interface BackendErrorResponse {
//   message?: string;
//   error?: string;
//   [key: string]: unknown;
// }

// function normalizeBaseUrl(url: string): string {
//   return url.trim().replace(/\/+$/, "");
// }

// async function parseResponse(response: Response): Promise<unknown> {
//   const responseText = await response.text();

//   if (!responseText) {
//     return null;
//   }

//   try {
//     return JSON.parse(responseText) as unknown;
//   } catch {
//     return {
//       message: responseText,
//     };
//   }
// }

// export async function GET(request: NextRequest) {
//   const backendApiUrl = process.env.BACKEND_API_URL;

//   /*
//    * This name must match the cookie created in:
//    * /api/auth/callback
//    */
//   const accessToken = request.cookies.get("foodhub_access_token")?.value;

//   console.log("GET PROFILES AUTH CHECK:", {
//     hasAccessToken: Boolean(accessToken),
//     hasBackendApiUrl: Boolean(backendApiUrl),
//     cookieNames: request.cookies.getAll().map((cookie) => cookie.name),
//   });

//   if (!backendApiUrl) {
//     console.error("GET PROFILES CONFIGURATION ERROR:", {
//       message: "BACKEND_API_URL is missing.",
//     });

//     return NextResponse.json(
//       {
//         source: "next-route-handler",
//         message: "BACKEND_API_URL is not configured.",
//       },
//       {
//         status: 500,
//       },
//     );
//   }

//   if (!accessToken) {
//     console.error("GET PROFILES AUTH ERROR:", {
//       message: "foodhub_access_token cookie is missing.",
//     });

//     return NextResponse.json(
//       {
//         source: "next-route-handler",
//         message: "You are not authenticated.",
//         reason: "foodhub_access_token cookie is missing.",
//       },
//       {
//         status: 401,
//       },
//     );
//   }

//   const normalizedBackendApiUrl = normalizeBaseUrl(backendApiUrl);

//   const backendUrl = new URL(`${normalizedBackendApiUrl}/profiles`);

//   /*
//    * Forward all query parameters:
//    * page, size, sort, search, etc.
//    */
//   request.nextUrl.searchParams.forEach((value, key) => {
//     backendUrl.searchParams.append(key, value);
//   });

//   console.log("GET PROFILES REQUEST:", {
//     url: backendUrl.toString(),
//     hasAccessToken: true,
//   });

//   try {
//     const backendResponse = await fetch(backendUrl, {
//       method: "GET",
//       headers: {
//         Accept: "application/json",
//         Authorization: `Bearer ${accessToken}`,
//       },
//       cache: "no-store",
//     });

//     const responseData = await parseResponse(backendResponse);

//     if (!backendResponse.ok) {
//       console.error("GET PROFILES BACKEND ERROR:", {
//         status: backendResponse.status,
//         statusText: backendResponse.statusText,
//         response: responseData,
//         url: backendUrl.toString(),
//       });

//       const backendError = (responseData ?? {}) as BackendErrorResponse;

//       return NextResponse.json(
//         {
//           source: "foodhub-backend",
//           message:
//             backendError.message ??
//             backendError.error ??
//             "The backend rejected the profiles request.",
//           backendStatus: backendResponse.status,
//           backendResponse: responseData,
//         },
//         {
//           status: backendResponse.status,
//         },
//       );
//     }

//     return NextResponse.json(responseData, {
//       status: backendResponse.status,
//       headers: {
//         "Cache-Control": "no-store",
//       },
//     });
//   } catch (error) {
//     console.error("GET PROFILES CONNECTION ERROR:", {
//       error,
//       url: backendUrl.toString(),
//     });

//     return NextResponse.json(
//       {
//         source: "next-route-handler",
//         message: "Could not connect to the FoodHub backend.",
//       },
//       {
//         status: 502,
//       },
//     );
//   }
// }
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import type { CreateMemberProfileRequest } from "@/types/member-profile/member-profile";

export const dynamic = "force-dynamic";

function normalizeBaseUrl(url: string): string {
  return url.trim().replace(/\/+$/, "");
}

async function parseBackendResponse(response: Response): Promise<unknown> {
  const responseText = await response.text();

  if (!responseText) {
    return null;
  }

  try {
    return JSON.parse(responseText) as unknown;
  } catch {
    return {
      message: responseText,
    };
  }
}

function getAccessToken(request: NextRequest): string | null {
  return request.cookies.get("foodhub_access_token")?.value ?? null;
}

function getBackendApiUrl(): string | null {
  const backendApiUrl = process.env.BACKEND_API_URL;

  if (!backendApiUrl) {
    return null;
  }

  return normalizeBaseUrl(backendApiUrl);
}

function configurationError() {
  return NextResponse.json(
    {
      source: "next-route-handler",
      message: "BACKEND_API_URL is not configured.",
    },
    {
      status: 500,
    },
  );
}

function authenticationError() {
  return NextResponse.json(
    {
      source: "next-route-handler",
      message: "You are not authenticated.",
      reason: "foodhub_access_token cookie is missing.",
    },
    {
      status: 401,
    },
  );
}

function createBackendResponse(data: unknown, status: number) {
  if (data === null && status === 204) {
    return new NextResponse(null, {
      status,
    });
  }

  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function decodeJwt(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = Buffer.from(parts[1], "base64url").toString("utf8");
    return JSON.parse(payload) as Record<string, unknown>;
  } catch {
    return null;
  }
}

async function syncUser(backendApiUrl: string, accessToken: string): Promise<boolean> {
  const claims = decodeJwt(accessToken);
  console.log("[SYNC USER ATTEMPT] Claims:", {
    sub: claims?.sub,
    email: claims?.email,
    username: claims?.preferred_username,
  });

  // 1. Try GET /users/me (triggers user creation/lookup in some Spring Boot auth filters)
  try {
    const res = await fetch(`${backendApiUrl}/users/me`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });
    const text = await res.text();
    console.log("[SYNC USER via GET /users/me]", res.status, text);
    if (res.ok) return true;
  } catch (err) {
    console.warn("[SYNC USER GET /users/me error]", err);
  }

  // 2. Try POST /users
  try {
    const res = await fetch(`${backendApiUrl}/users`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        keycloakId: claims?.sub,
        username: claims?.preferred_username || claims?.email,
        email: claims?.email,
        firstName: claims?.given_name,
        lastName: claims?.family_name,
      }),
      cache: "no-store",
    });
    const text = await res.text();
    console.log("[SYNC USER via POST /users]", res.status, text);
    if (res.ok || res.status === 409) return true;
  } catch (err) {
    console.warn("[SYNC USER POST /users error]", err);
  }

  return false;
}

/**
 * GET /api/profiles?page=0&size=20
 */
export async function GET(request: NextRequest) {
  const backendApiUrl = getBackendApiUrl();
  const accessToken = getAccessToken(request);

  console.log("GET PROFILES AUTH CHECK:", {
    hasAccessToken: Boolean(accessToken),
    hasBackendApiUrl: Boolean(backendApiUrl),
  });

  if (!backendApiUrl) {
    return configurationError();
  }

  if (!accessToken) {
    return authenticationError();
  }

  const backendUrl = new URL(`${backendApiUrl}/profiles`);

  request.nextUrl.searchParams.forEach((value, key) => {
    backendUrl.searchParams.append(key, value);
  });

  try {
    const backendResponse = await fetch(backendUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    const responseData = await parseBackendResponse(backendResponse);

    if (!backendResponse.ok) {
      console.error("GET PROFILES BACKEND ERROR:", {
        status: backendResponse.status,
        statusText: backendResponse.statusText,
        response: responseData,
        url: backendUrl.toString(),
      });

      // If user not found in backend database (new user) or has no profiles yet, return empty list
      if (backendResponse.status === 404) {
        console.log("No profiles found for user (404), returning empty profile collection.");
        return NextResponse.json(
          {
            contents: [],
            pageNumber: 0,
            pageSize: 20,
            totalElements: 0,
            totalPages: 0,
            first: true,
            last: true,
          },
          {
            status: 200,
            headers: {
              "Cache-Control": "no-store",
            },
          },
        );
      }
    }

    return createBackendResponse(responseData, backendResponse.status);
  } catch (error) {
    console.error("GET PROFILES CONNECTION ERROR:", {
      error,
      url: backendUrl.toString(),
    });

    return NextResponse.json(
      {
        source: "next-route-handler",
        message: "Could not connect to the FoodHub backend.",
      },
      {
        status: 502,
      },
    );
  }
}

/**
 * POST /api/profiles
 */
export async function POST(request: NextRequest) {
  const backendApiUrl = getBackendApiUrl();
  const accessToken = getAccessToken(request);

  console.log("CREATE PROFILE AUTH CHECK:", {
    hasAccessToken: Boolean(accessToken),
    hasBackendApiUrl: Boolean(backendApiUrl),
  });

  if (!backendApiUrl) {
    return configurationError();
  }

  if (!accessToken) {
    return authenticationError();
  }

  let requestBody: CreateMemberProfileRequest;

  try {
    requestBody = (await request.json()) as CreateMemberProfileRequest;
  } catch {
    return NextResponse.json(
      {
        source: "next-route-handler",
        message: "The request body is not valid JSON.",
      },
      {
        status: 400,
      },
    );
  }

  if (!requestBody.profileName?.trim()) {
    return NextResponse.json(
      {
        source: "next-route-handler",
        message: "Profile name is required.",
      },
      {
        status: 400,
      },
    );
  }

  if (!requestBody.relationship) {
    return NextResponse.json(
      {
        source: "next-route-handler",
        message: "Relationship is required.",
      },
      {
        status: 400,
      },
    );
  }

  if (!requestBody.gender) {
    return NextResponse.json(
      {
        source: "next-route-handler",
        message: "Gender is required.",
      },
      {
        status: 400,
      },
    );
  }

  if (!requestBody.dateOfBirth) {
    return NextResponse.json(
      {
        source: "next-route-handler",
        message: "Date of birth is required.",
      },
      {
        status: 400,
      },
    );
  }

  const backendUrl = `${backendApiUrl}/profiles`;

  const payload: CreateMemberProfileRequest = {
    profileName: requestBody.profileName.trim(),
    relationship: requestBody.relationship,
    gender: requestBody.gender,
    dateOfBirth: requestBody.dateOfBirth,
    preferredLanguage: requestBody.preferredLanguage || "km",
    avatarMediaUuid: requestBody.avatarMediaUuid ?? null,
    isDefault: requestBody.relationship === "SELF" ? true : (requestBody.isDefault ?? false),
    // allergies: requestBody.allergies ?? [],
    // dietaryTypes: requestBody.dietaryTypes ?? [],
    // medicalConditions: requestBody.medicalConditions ?? [],
    // ingredientAvoids: requestBody.ingredientAvoids ?? [],
    // preferences: requestBody.preferences ?? null,
  };

  try {
    console.log("CREATE PROFILE REQUEST:", {
      url: backendUrl,
      profileName: payload.profileName,
      relationship: payload.relationship,
    });

    const backendResponse = await fetch(backendUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const responseData = await parseBackendResponse(backendResponse);

    if (!backendResponse.ok) {
      console.error("CREATE PROFILE BACKEND ERROR:", {
        status: backendResponse.status,
        statusText: backendResponse.statusText,
        response: responseData,
        url: backendUrl,
      });

      // If user not synced in backend database, auto-sync and retry create
      if (backendResponse.status === 404) {
        console.log("User not synced for create profile, attempting auto-sync...");
        const synced = await syncUser(backendApiUrl, accessToken);
        if (synced) {
          console.log("Auto-sync succeeded, retrying POST /profiles...");
          const retryResponse = await fetch(backendUrl, {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(payload),
            cache: "no-store",
          });
          const retryData = await parseBackendResponse(retryResponse);
          return createBackendResponse(retryData, retryResponse.status);
        }
      }
    }

    return createBackendResponse(responseData, backendResponse.status);
  } catch (error) {
    console.error("CREATE PROFILE CONNECTION ERROR:", {
      error,
      url: backendUrl,
    });

    return NextResponse.json(
      {
        source: "next-route-handler",
        message: "Could not connect to the FoodHub backend.",
      },
      {
        status: 502,
      },
    );
  }
}
