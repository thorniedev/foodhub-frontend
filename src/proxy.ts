import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function proxy(req: NextRequest) {
  console.log("--- proxy ---");
  console.log("Request URL:", req.url);

  // Replace this with a real cookie or session check
  //   const accessToken = req.cookies.get("access_token")?.value;
  const isLoggedIn = false;
  const keycloakUrl = process.env.NEXT_PUBLIC_KEYCLOAK_URL;
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL(keycloakUrl, req.url));
  }

  return NextResponse.next();
  //   if (!keycloakUrl) {
  //     console.error("KEYCLOAK_URL is not configured");

  //     return new NextResponse("Authentication configuration is missing", {
  //       status: 500,
  //     });
  //   }

  //   return NextResponse.redirect(new URL(keycloakUrl));
}

export const config = {
  matcher: [
    /*
     * Ignore Next.js files, images, favicon and authentication callback routes.
     */
    // "/((?!api/auth|_next/static|_next/image|favicon.ico|images).*)",
    "/dashboard/:path*",
  ],
};
