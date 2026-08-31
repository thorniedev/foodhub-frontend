import type { Metadata, Viewport } from "next";

import localFont from "next/font/local";

import "./globals.css";

import Providers from "@/app/store/Providers";

import Preloader from "@/components/ui/Preloader";
import PWARegister from "@/components/providers/PWARegister";
import JsonLd from "@/components/common/JsonLd";

import { generateWebSiteJsonLd } from "@/lib/seo";

/* =========================================================
   GOOGLE SANS
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
    default: "ម្ហូបអាហារ Mhoubahar | FoodHub",
    template: "%s | FoodHub",
  },

  description:
    "ណែនាំអាហារដែលត្រូវនឹងចំណូលចិត្តរបស់អ្នក! Discover personalized food recommendations, restaurants, and meals with FoodHub Cambodia.",

  alternates: {
    canonical: "https://www.mhoubahar.store",
  },

  authors: [
    {
      name: "FoodHub Team",
    },
  ],

  creator: "FoodHub Team",

  publisher: "FoodHub",

  applicationName: "ម្ហូបអាហារ",

  category: "Food & Drink",

  robots: {
    index: true,

    follow: true,

    googleBot: {
      index: true,

      follow: true,

      "max-image-preview": "large",

      "max-snippet": -1,

      "max-video-preview": -1,
    },
  },

  openGraph: {
    type: "website",

    url: "https://www.mhoubahar.store",

    siteName: "ម្ហូបអាហារ",

    title: "ម្ហូបអាហារ Mhoubahar | FoodHub",

    description:
      "Discover personalized food recommendations, explore restaurants, and find meals that match your taste with FoodHub Cambodia.",

    images: [
      {
        url: "/og-image.jpeg",

        width: 1200,

        height: 630,

        alt: "ម្ហូបអាហារ Mhoubahar - FoodHub Cambodia",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",

    title: "ម្ហូបអាហារ Mhoubahar | FoodHub",

    description:
      "Discover personalized food recommendations, restaurants, and meals with FoodHub Cambodia.",

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
        <JsonLd data={generateWebSiteJsonLd()} />

        <PWARegister />

        <Preloader />

        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
