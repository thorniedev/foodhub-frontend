import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  reactStrictMode: true,
  devIndicators: false,
  turbopack: {
    root: __dirname,
  },
  allowedDevOrigins: [
    "idealist-distrust-buffed.ngrok-free.dev",
  ],
  images: {
    // Cache optimized images for 1 year (they are content-addressed by URL)
    minimumCacheTTL: 31536000,
    // Breakpoints that match the card grid (50vw → 33vw → 25vw)
    deviceSizes: [375, 640, 768, 1024, 1280, 1536],
    imageSizes: [96, 128, 200, 256, 384, 485],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.mhoubahar.store",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8080",
      },
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
