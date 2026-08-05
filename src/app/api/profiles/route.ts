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
    isDefault: requestBody.isDefault ?? false,
    allergies: requestBody.allergies ?? [],
    dietaryTypes: requestBody.dietaryTypes ?? [],
    medicalConditions: requestBody.medicalConditions ?? [],
    ingredientAvoids: requestBody.ingredientAvoids ?? [],
    preferences: requestBody.preferences ?? null,
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
