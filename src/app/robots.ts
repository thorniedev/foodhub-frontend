import type {
  MetadataRoute,
} from "next";

import {
  SITE_URL,
} from "@/lib/seo";

export default function robots():
  MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent:
          "*",

        allow:
          "/",

        disallow: [
          "/api/",

          "/dashboard/",

          "/login",

          "/register",

          "/notifications/",

          "/group-vote/",

          "/meetup/create",

          "/friends",
        ],
      },
    ],

    sitemap:
      `${SITE_URL}/sitemap.xml`,

    host:
      SITE_URL,
  };
}

// import type { MetadataRoute } from "next";

// export default function robots(): MetadataRoute.Robots {
//   const siteUrl =
//     process.env.NEXT_PUBLIC_SITE_URL || "https://www.mhoubahar.store";

//   return {
//     rules: [
//       {
//         userAgent: "*",
//         allow: "/",
//         disallow: ["/api/", "/dashboard/"],
//       },
//     ],
//     sitemap: `${siteUrl}/sitemap.xml`,
//   };
// }
