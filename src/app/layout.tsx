import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

import Providers from "@/app/store/Providers";
import Preloader from "@/components/ui/Preloader";
import PWARegister from "@/components/providers/PWARegister";
import JsonLd from "@/components/common/JsonLd";
import { generateOrganizationJsonLd, generateWebSiteSearchJsonLd } from "@/lib/seo";

/* =========================================================
   LOCAL GOOGLE SANS FONT
========================================================= */

const googleSans = localFont({
  src: [
    {
      path: "./fonts/GoogleSans-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/GoogleSans-Italic.ttf",
      weight: "400",
      style: "italic",
    },
    {
      path: "./fonts/GoogleSans-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/GoogleSans-MediumItalic.ttf",
      weight: "500",
      style: "italic",
    },
    {
      path: "./fonts/GoogleSans-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/GoogleSans-SemiBoldItalic.ttf",
      weight: "600",
      style: "italic",
    },
    {
      path: "./fonts/GoogleSans-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/GoogleSans-BoldItalic.ttf",
      weight: "700",
      style: "italic",
    },
  ],
  variable: "--font-google-sans",
  display: "swap",
  fallback: ["Arial", "sans-serif"],
});

/* =========================================================
   VIEWPORT
========================================================= */

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

/* =========================================================
   SITE URL
========================================================= */

function getSafeSiteUrl(): URL {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (envUrl && envUrl !== "") {
    try {
      const urlString =
        envUrl.startsWith("http://") || envUrl.startsWith("https://")
          ? envUrl
          : `https://${envUrl}`;

      return new URL(urlString);
    } catch {
      // fallback
    }
  }

  return new URL("https://www.mhoubahar.store");
}

/* =========================================================
   METADATA
========================================================= */

export const metadata: Metadata = {
  metadataBase: getSafeSiteUrl(),

  title: {
    default: "ម្ហូបអាហារ (FoodHub) - កម្មវិធីស្វែងរក និងណែនាំអាហារ | mhoubahar.store",
    template: "%s | ម្ហូបអាហារ FoodHub",
  },

  description:
    "ស្វែងរកមុខម្ហូប និងហាងអាហារឆ្ងាញ់ៗនៅកម្ពុជាជាមួយ ម្ហូបអាហារ (FoodHub - mhoubahar.store)។ ណែនាំអាហារឆ្លាតវៃតាមចំណូលចិត្ត សុខភាព និងទីតាំងរបស់អ្នក។",

  keywords: [
    "mhoubahar.store",
    "mhoubahar",
    "mhou bahar",
    "mhoub ahar",
    "ម្ហូបអាហារ",
    "មហូបអាហារ",
    "FoodHub",
    "ម្ហូបអាហារ",
    "FoodHub Cambodia",
    "Food Hub",
    "food recommendation",
    "Cambodia food",
    "អាហារខ្មែរ",
    "restaurant finder",
    "personalized food",
    "meal recommendation",
    "Khmer food",
    "food discovery",
    "safe food",
    "healthy food",
    "food delivery",
    "restaurant reviews",
    "food blog",
    "food guide",
    "food map",
    "food app",
    "Mhoub",
    "Mhoub ahar",
    "Mhoubahar",
    "food service",
  ],

  authors: [{ name: "FoodHub Team" }],
  creator: "FoodHub Team",
  publisher: "FoodHub",

  applicationName: "ម្ហូបអាហារ",
  category: "Food & Drink",

  openGraph: {
    type: "website",
    url: "https://www.mhoubahar.store",
    siteName: "ម្ហូបអាហារ - FoodHub",
    title: "ម្ហូបអាហារ (FoodHub) - mhoubahar.store",
    description:
      "ស្វែងរកមុខម្ហូប និងហាងអាហារឆ្ងាញ់ៗនៅកម្ពុជាជាមួយ ម្ហូបអាហារ (FoodHub - mhoubahar.store)។ ណែនាំអាហារឆ្លាតវៃតាមចំណូលចិត្ត សុខភាព និងទីតាំងរបស់អ្នក។",
    images: [
      {
        url: "/og-image.jpeg",
        width: 1200,
        height: 630,
        alt: "ម្ហូបអាហារ - FoodHub",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "ម្ហូបអាហារ (FoodHub) - mhoubahar.store",
    description:
      "ស្វែងរកមុខម្ហូប និងហាងអាហារឆ្ងាញ់ៗនៅកម្ពុជាជាមួយ ម្ហូបអាហារ (FoodHub - mhoubahar.store)។",
    images: ["/og-image.jpeg"],
  },

  icons: {
    icon: "/favicon.ico",
    apple: "/icons/pwa-192x192.png",
  },

  appleWebApp: {
    capable: true,
    title: "ម្ហូបអាហារ",
    statusBarStyle: "default",
  },

  other: {
    "mobile-web-app-capable": "yes",
    "theme-color": "#166534",
    "msapplication-TileColor": "#166534",
  },
};

/* =========================================================
   ROOT LAYOUT
========================================================= */

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="km"
      suppressHydrationWarning
      className={`${googleSans.variable} h-full`}
    >
      <body
        suppressHydrationWarning
        className="flex min-h-full flex-col overflow-x-hidden bg-white font-sans text-slate-900 antialiased transition-colors duration-200 dark:bg-slate-950 dark:text-slate-100"
      >
        <JsonLd data={generateWebSiteSearchJsonLd()} />
        <JsonLd data={generateOrganizationJsonLd()} />

        <PWARegister />

        <Preloader />

        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

// import type { Metadata, Viewport } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
// import "./globals.css";

// import Providers from "@/app/store/Providers";
// import Preloader from "@/components/ui/Preloader";
// import PWARegister from "@/components/providers/PWARegister";
// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

// export const viewport: Viewport = {
//   width: "device-width",
//   initialScale: 1,
//   maximumScale: 5,
// };

// function getSafeSiteUrl(): URL {
//   const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
//   if (envUrl && envUrl !== "") {
//     try {
//       const urlString =
//         envUrl.startsWith("http://") || envUrl.startsWith("https://")
//           ? envUrl
//           : `https://${envUrl}`;
//       return new URL(urlString);
//     } catch {
//       // fallback
//     }
//   }
//   return new URL("https://www.mhoubahar.store");
// }

// export const metadata: Metadata = {
//   metadataBase: getSafeSiteUrl(),

//   title: {
//     default: "មូបអាហារ - FoodHub",
//     template: "%s | មូបអាហារ FoodHub",
//   },

//   description:
//     "ដែនាំអាហារដែលត្រូវនឹងចំណូលចិត្តរបស់អ្នក! Discover personalized food recommendations, explore restaurants, and find meals that match your taste with FoodHub Cambodia.",

//   keywords: [
//     "FoodHub",
//     "មូបអាហារ",
//     "food recommendation",
//     "Cambodia food",
//     "អាហារខ្មែរ",
//     "restaurant finder",
//     "personalized food",
//     "meal recommendation",
//     "Khmer food",
//     "food discovery",
//     "safe food",
//     "healthy food",
//     "food delivery",
//     "restaurant reviews",
//     "food blog",
//     "food guide",
//     "food map",
//     "food app",
//     "food service",
//   ],

//   authors: [{ name: "FoodHub Team" }],
//   creator: "FoodHub Team",
//   publisher: "FoodHub",

//   applicationName: "ម្ហូបអាហារ",
//   category: "Food & Drink",

//   openGraph: {
//     type: "website",
//     url: "https://www.mhoubahar.store",
//     siteName: "មូបអាហារ - FoodHub",
//     title: "មូបអាហារ - FoodHub",
//     description:
//       "Discover personalized food recommendations, explore restaurants, and find meals that match your taste with FoodHub Cambodia.",
//     images: [
//       {
//         url: "/og-image.jpeg",
//         width: 1200,
//         height: 630,
//         alt: "មូបអាហារ - FoodHub",
//       },
//     ],
//   },

//   twitter: {
//     card: "summary_large_image",
//     title: "មូបអាហារ - FoodHub",
//     description:
//       "Discover personalized food recommendations, explore restaurants, and find meals that match your taste with FoodHub Cambodia.",
//     images: ["/og-image.jpeg"],
//   },

//   icons: {
//     icon: "/favicon.ico",
//     apple: "/icons/pwa-192x192.png",
//   },

//   appleWebApp: {
//     capable: true,
//     title: "ម្ហូបអាហារ",
//     statusBarStyle: "default",
//   },

//   other: {
//     "mobile-web-app-capable": "yes",
//     "theme-color": "#166534",
//     "msapplication-TileColor": "#166534",
//   },
// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html
//       lang="en"
//       suppressHydrationWarning
//       className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
//     >
//       <body
//         suppressHydrationWarning
//         className="min-h-full bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-200 overflow-x-hidden flex flex-col"
//       >
//         <PWARegister />
//         {/* <AOSInit /> */}
//         {/* <Navbar /> */}
//         <Preloader />
//         <Providers>{children}</Providers>
//         {/* <footer>
//           <DrawCircleText />
//           <Footer />
//         </footer> */}
//       </body>
//     </html>
//   );
// }
