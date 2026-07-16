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
    // HSTS — force HTTPS for two years incl. subdomains. Ignored by browsers
    // over plain HTTP (localhost), so it's a no-op in dev and only binds in prod.
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    // Isolate our browsing context from cross-origin openers (Spectre / tabnabbing
    // mitigation Lighthouse checks for). `allow-popups` keeps redirect/popup OAuth
    // flows working while still severing opener access from unrelated origins.
    key: "Cross-Origin-Opener-Policy",
    value: "same-origin-allow-popups",
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
  async redirects() {
    return [
      // The natural-language roll moved from /describe when it became "Ask AI".
      { source: "/describe", destination: "/ask-ai", permanent: true },
    ];
  },
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
