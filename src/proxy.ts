// import type { NextRequest } from "next/server";
// import { NextResponse } from "next/server";

// export function proxy(request: NextRequest) {
//   const accessToken = request.cookies.get("foodhub_access_token")?.value;

//   if (!accessToken) {
//     const keycloakLoginUrl = new URL("/api/auth/login", request.url);

//     keycloakLoginUrl.searchParams.set(
//       "returnTo",
//       `${request.nextUrl.pathname}${request.nextUrl.search}`,
//     );

//     return NextResponse.redirect(keycloakLoginUrl);
//   }

//   return NextResponse.next();
// }

// export const config = {
//     matcher: ["/dashboard/:path*"],
// };
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const accessToken = request.cookies.get("foodhub_access_token")?.value;

  console.log("[FOODHUB AUTH PROXY]", {
    pathname: request.nextUrl.pathname,

    authenticated: Boolean(accessToken),
  });

  if (!accessToken) {
    const loginUrl = new URL("/api/auth/login", request.url);

    const returnTo =
      `${request.nextUrl.pathname}` + `${request.nextUrl.search}`;

    loginUrl.searchParams.set("returnTo", returnTo);

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
