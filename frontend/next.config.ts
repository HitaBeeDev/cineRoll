import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

function getApiOrigin() {
  try {
    return new URL(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").origin;
  } catch {
    return "http://localhost:4000";
  }
}

const connectSrc = [
  "'self'",
  getApiOrigin(),
  "https://image.tmdb.org",
  "https://*.tmdb.org",
];

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://image.tmdb.org https://*.tmdb.org https://img.youtube.com https://i.ytimg.com",
      "font-src 'self' data:",
      `connect-src ${connectSrc.join(" ")}`,
      "media-src 'self' blob:",
      "frame-src https://www.youtube-nocookie.com",
      "worker-src 'self' blob:",
      "manifest-src 'self'",
      "upgrade-insecure-requests",
    ].join("; "),
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: [
      "camera=()",
      "microphone=()",
      "geolocation=()",
      "payment=()",
      "usb=()",
      "magnetometer=()",
      "gyroscope=()",
      "accelerometer=()",
    ].join(", "),
  },
];

const nextConfig: NextConfig = {
  // Hide the dev-only Next.js indicator badge (the floating "N").
  devIndicators: false,
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  images: {
    // Vercel's image optimizer (/_next/image) isn't served in this multi-service
    // deployment, so optimized <Image> URLs 404. TMDB already delivers CDN-sized,
    // correctly-scaled posters (w500 etc.), so skip optimization and let next/image
    // emit plain <img> tags pointing straight at the source.
    unoptimized: true,
    deviceSizes: [360, 390, 640, 768, 1024, 1280, 1536],
    imageSizes: [38, 42, 44, 54, 92, 128, 144, 185, 200, 220, 307, 342, 500],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
      },
    ],
  },
};

export default withBundleAnalyzer(nextConfig);
