// import type { NextRequest } from "next/server";
// import { NextResponse } from "next/server";

// export function proxy(request: NextRequest) {
//   const accessToken = request.cookies.get("access_token")?.value;

//   console.log("[AUTH PROXY]", {
//     pathname: request.nextUrl.pathname,
//     authenticated: Boolean(accessToken),
//   });

//   if (!accessToken) {
//     const loginUrl = new URL("/api/auth/login", request.url);

//     loginUrl.searchParams.set("returnTo", request.nextUrl.pathname);

//     return NextResponse.redirect(loginUrl);
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: ["/dashboard/:path*"],
// };
// import { NextRequest, NextResponse } from "next/server";

// export function proxy(request: NextRequest) {
//   const pathname = request.nextUrl.pathname;

//   const accessToken = request.cookies.get("foodhub_access_token")?.value;

//   if (pathname.startsWith("/dashboard") && !accessToken) {
//     const loginUrl = new URL("/login", request.url);

//     loginUrl.searchParams.set(
//       "returnTo",
//       `${pathname}${request.nextUrl.search}`,
//     );

//     return NextResponse.redirect(loginUrl);
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: ["/dashboard/:path*"],
// };
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const accessToken = request.cookies.get("foodhub_access_token")?.value;

  if (!accessToken) {
    const keycloakLoginUrl = new URL("/api/auth/login", request.url);

    keycloakLoginUrl.searchParams.set(
      "returnTo",
      `${request.nextUrl.pathname}${request.nextUrl.search}`,
    );

    return NextResponse.redirect(keycloakLoginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
