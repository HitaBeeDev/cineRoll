import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hide the dev-only Next.js indicator badge (the floating "N").
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
      },
    ],
  },
};

export default nextConfig;
