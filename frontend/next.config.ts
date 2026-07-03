import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hide the dev-only Next.js indicator badge (the floating "N").
  devIndicators: false,
  images: {
    // Vercel's image optimizer (/_next/image) isn't served in this multi-service
    // deployment, so optimized <Image> URLs 404. TMDB already delivers CDN-sized,
    // correctly-scaled posters (w500 etc.), so skip optimization and let next/image
    // emit plain <img> tags pointing straight at the source.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
      },
    ],
  },
};

export default nextConfig;
