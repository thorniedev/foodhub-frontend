import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AOSInit } from "@/components/AOSInit";
import { DrawCircleText } from "@/components/ui/DrawCircleText";

import Providers from "@/app/store/Providers";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import Preloader from "@/components/ui/Preloader";
import PWARegister from "@/components/providers/PWARegister";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://foodhub-khmer.vercel.app",
  ),

  title: {
    default: "មូបអាហារ - FoodHub",
    template: "%s | មូបអាហារ FoodHub",
  },

  description:
    "ដែនាំអាហារដែលត្រូវនឹងចំណូលចិត្តរបស់អ្នក! Discover personalized food recommendations, explore restaurants, and find meals that match your taste with FoodHub Cambodia.",

  keywords: [
    "FoodHub",
    "មូបអាហារ",
    "food recommendation",
    "Cambodia food",
    "អាហារខ្មែរ",
    "restaurant finder",
    "personalized food",
    "meal recommendation",
    "Khmer food",
    "food discovery",
  ],

  authors: [{ name: "FoodHub Team" }],
  creator: "FoodHub",
  publisher: "FoodHub",

  applicationName: "FoodHub",
  category: "Food & Drink",

  openGraph: {
    type: "website",
    locale: "km_KH",
    alternateLocale: "en_US",
    siteName: "មូបអាហារ - FoodHub",
    title: "មូបអាហារ - FoodHub | ដែនាំអាហារដែលត្រូវនឹងចំណូលចិត្តរបស់អ្នក!",
    description:
      "Discover personalized food recommendations, explore restaurants, and find meals that match your taste with FoodHub Cambodia.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "មូបអាហារ FoodHub - Personalized Food Recommendations",
        type: "image/jpeg",
      },
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "មូបអាហារ FoodHub - Personalized Food Recommendations",
        type: "image/png",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "មូបអាហារ - FoodHub",
    description:
      "Discover personalized food recommendations, explore restaurants, and find meals that match your taste with FoodHub Cambodia.",
    images: ["/og-image.jpg"],
  },

  icons: {
    icon: "/favicon.ico",
    apple: "/icons/pwa-192x192.png",
  },

  appleWebApp: {
    capable: true,
    title: "FoodHub",
    statusBarStyle: "default",
  },

  other: {
    "mobile-web-app-capable": "yes",
    "theme-color": "#166534",
    "msapplication-TileColor": "#166534",
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full dark:bg-slate-950   overflow-x-hidden flex flex-col"
      >
        <PWARegister />
        {/* <AOSInit /> */}
        {/* <Navbar /> */}
        <Preloader />
        <Providers>{children}</Providers>
        {/* <footer>
          <DrawCircleText />
          <Footer />
        </footer> */}
      </body>
    </html>
  );
}
