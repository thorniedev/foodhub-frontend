import type { Metadata, Viewport } from "next";

import localFont from "next/font/local";

import "./globals.css";

import Providers from "@/app/store/Providers";

import PWARegister from "@/components/providers/PWARegister";
import NearbyRecommendationPingTracker from "@/components/providers/NearbyRecommendationPingTracker";
import JsonLd from "@/components/common/JsonLd";
import PreconnectHints from "@/components/common/PreconnectHints";

import { generateWebSiteJsonLd } from "@/lib/seo";

/* =========================================================
   PRIMARY FONT (Self-hosted Google Sans with Khmer support)
========================================================= */

const googleSans = localFont({
  src: [
    {
      // ✅ PERF: WOFF2 uses Brotli compression — 473KB vs 1,952KB TTF (-76%)
      path: "./fonts/GoogleSans_17pt-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      // ✅ PERF: Removed Italic (mapped to regular) and SemiBold (mapped to Bold).
      // ✅ PERF: WOFF2 — 532KB vs 1,955KB TTF (-73%)
      path: "./fonts/GoogleSans_17pt-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      // ✅ PERF: WOFF2 — 503KB vs 1,955KB TTF (-74%)
      path: "./fonts/GoogleSans_17pt-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-google-sans",
  display: "swap",
  preload: false,
  fallback: [
    "Google Sans",
    "Kantumruy Pro",
    "Noto Sans Khmer",
    "system-ui",
    "-apple-system",
    "BlinkMacSystemFont",
    "sans-serif",
  ],
});

/* =========================================================
   SITE URL
========================================================= */

function getSafeSiteUrl(): URL {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (envUrl) {
    try {
      const value =
        envUrl.startsWith("http://") || envUrl.startsWith("https://")
          ? envUrl
          : `https://${envUrl}`;

      return new URL(value);
    } catch {
      // use fallback
    }
  }

  return new URL("https://www.mhoubahar.store");
}

/* =========================================================
   VIEWPORT
========================================================= */

export const viewport: Viewport = {
  width: "device-width",

  initialScale: 1,

  maximumScale: 5,

  themeColor: "#166534",
};

/* =========================================================
   GLOBAL METADATA
========================================================= */

export const metadata: Metadata = {
  metadataBase: getSafeSiteUrl(),

  title: {
    default: "ម្ហូបអាហារ Mhoubahar — FoodHub Cambodia",
    template: "%s | FoodHub",
  },

  description:
    "Mhoubahar FoodHub (ម្ហូបអាហារ) — ស្វែងរក និងណែនាំ Khmer food ភោជនីយដ្ឋាន ម្ហូប Halal ម្ហូបបួស តាមចំណូលចិត្ត និងទីតាំងនៅកម្ពុជា។ FoodHub Cambodia.",

  /* ── Hreflang: bilingual km + en ── */
  alternates: {
    canonical: "https://www.mhoubahar.store",
    languages: {
      "km-KH": "https://www.mhoubahar.store",
      "en-US": "https://www.mhoubahar.store",
      "x-default": "https://www.mhoubahar.store",
    },
  },

  authors: [
    {
      name: "Mhoubahar FoodHub Team",
      url: "https://www.mhoubahar.store/about",
    },
  ],

  creator: "Mhoubahar FoodHub",

  publisher: "Mhoubahar FoodHub",

  applicationName: "Mhoubahar FoodHub",

  generator: "Next.js",

  category: "Food & Drink",

  referrer: "origin-when-cross-origin",

  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  openGraph: {
    type: "website",
    url: "https://www.mhoubahar.store",
    siteName: "Mhoubahar FoodHub",
    locale: "km_KH",
    alternateLocale: ["en_US"],
    title: "ម្ហូបអាហារ Mhoubahar — FoodHub Cambodia",
    description:
      "Mhoubahar FoodHub (ម្ហូបអាហារ) — ស្វែងរក និងណែនាំ Khmer food ភោជនីយដ្ឋាន ម្ហូប Halal ម្ហូបបួស តាមចំណូលចិត្ត និងទីតាំងនៅកម្ពុជា។ FoodHub Cambodia.",
    images: [
      {
        url: "https://www.mhoubahar.store/og-image.jpeg",
        secureUrl: "https://www.mhoubahar.store/og-image.jpeg",
        width: 1200,
        height: 630,
        alt: "Mhoubahar FoodHub — ម្ហូបអាហារ Cambodia",
        type: "image/jpeg",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    site: "@mhoubahar",
    creator: "@mhoubahar",
    title: "Mhoubahar FoodHub — ម្ហូបអាហារ Cambodia",
    description:
      "ស្វែងរក និងណែនាំ Khmer food ភោជនីយដ្ឋាន ម្ហូប Halal ម្ហូបបួស តាមចំណូលចិត្ត អាឡែស៊ី និងទីតាំងនៅកម្ពុជា។ FoodHub Cambodia.",
    images: ["https://www.mhoubahar.store/og-image.jpeg"],
  },

  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icons/icon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/icon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/pwa-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/pwa-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/pwa-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },

  manifest: "/manifest.json",

  appleWebApp: {
    capable: true,
    title: "Mhoubahar FoodHub",
    statusBarStyle: "black-translucent",
  },

  other: {
    "mobile-web-app-capable": "yes",
    "msapplication-TileColor": "#166534",
    "msapplication-config": "/browserconfig.xml",
    "geo.region": "KH",
    "geo.placename": "Phnom Penh, Cambodia",
    language: "Khmer, English",
    "revisit-after": "7 days",
    rating: "general",
    copyright: "© 2025 Mhoubahar FoodHub. All rights reserved.",
  },
};

/* =========================================================
   ROOT LAYOUT
========================================================= */

import { GoogleAnalytics } from "@next/third-parties/google";

const isLiveProduction =
  process.env.NODE_ENV === "production" &&
  (process.env.NEXT_PUBLIC_SITE_URL?.includes("mhoubahar.store") ||
    process.env.VERCEL_ENV === "production");

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
        <JsonLd data={generateWebSiteJsonLd()} />

        <PreconnectHints />

        <PWARegister />

        <NearbyRecommendationPingTracker />

        <Providers>{children}</Providers>
      </body>
      {isLiveProduction && <GoogleAnalytics gaId="G-Y4SCK2S3P5" />}
    </html>
  );
}
