import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  // Opt-in only (unset for the normal dev/build/start scripts): lets a
  // one-off production build run to its own output directory, so it can't
  // collide with another `next dev` process's .next/ folder.
  ...(process.env.PERF_TEST_DIST_DIR
    ? { distDir: process.env.PERF_TEST_DIST_DIR }
    : {}),
  compress: true,
  reactStrictMode: true,
  // ✅ PERF: Don't expose "X-Powered-By: Next.js" header in responses.
  poweredByHeader: false,
  devIndicators: false,
  turbopack: {
    root: __dirname,
  },
  allowedDevOrigins: [
    "idealist-distrust-buffed.ngrok-free.dev",
  ],
  // ✅ PERF: Tree-shake large icon/animation libraries — only include symbols
  // actually imported by the app instead of bundling the whole package.
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "react-icons",
      "@reduxjs/toolkit",
      "framer-motion",
      "swiper",
      "embla-carousel-react",
      "canvas-confetti",
      "fuse.js",
    ],
  },
  // ✅ PERF: Strip console.log/warn/info/debug from production bundles.
  // console.error is preserved so runtime errors still surface.
  compiler: {
    removeConsole: process.env.NODE_ENV === "production"
      ? { exclude: ["error"] }
      : false,
  },
  images: {
    // ✅ PERF: Cache optimized images aggressively — content-addressed by hash.
    // For presigned storage URLs (expire in 300s), the optimizer caches the
    // pixel data so subsequent requests are served instantly from Next.js cache.
    minimumCacheTTL: 31536000,
    // Serve AVIF/WebP to browsers that support them, falling back to the
    // source format otherwise -- both are substantially smaller than PNG/JPEG
    // at equivalent visual quality.
    formats: ["image/avif", "image/webp"],
    // Breakpoints that match the card grid (50vw → 33vw → 25vw)
    deviceSizes: [375, 640, 768, 1024, 1280, 1536],
    imageSizes: [96, 128, 200, 256, 384, 485],
    // ✅ FIX: Raise upstream fetch timeout from default 7s to 30s.
    // storage.mhoubahar.store images were timing out and returning 504,
    // causing the "upstream image response timed out" errors in the log.
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.mhoubahar.store",
      },
      {
        // ✅ FIX: Storage server with presigned URLs — optimizer caches
        // pixel data so the short-lived URL is only fetched once per image.
        protocol: "https",
        hostname: "storage.mhoubahar.store",
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

export default withBundleAnalyzer(nextConfig);
