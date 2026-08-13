import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const accessToken = request.cookies.get("foodhub_access_token")?.value;

  console.log("[FOODHUB AUTH PROXY]", {
    pathname: request.nextUrl.pathname,

    authenticated: Boolean(accessToken),
  });

  if (!accessToken) {
    const loginUrl = new URL("/login", request.url);

    const returnTo = request.nextUrl.pathname + request.nextUrl.search;

    loginUrl.searchParams.set("returnTo", returnTo);

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
