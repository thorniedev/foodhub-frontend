import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const accessToken = request.cookies.get("access_token")?.value;

  console.log("[AUTH PROXY]", {
    pathname: request.nextUrl.pathname,
    authenticated: Boolean(accessToken),
  });

  if (!accessToken) {
    const loginUrl = new URL("api/auth/login", request.url);

    loginUrl.searchParams.set("returnTo", request.nextUrl.pathname);

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
