import type { Metadata } from "next";
import { cookies } from "next/headers";
import { HomeClient } from "@/features/home/components/home-client";
import { ONBOARDED_COOKIE } from "@/features/home/constants/onboarded-cookie";
import { fetchArchiveSize } from "@/features/home/fetch-archive-size";
import { HomeHero } from "./home-hero";

export const metadata: Metadata = {
  // `absolute` opts out of the layout's "%s | CineRoll" template for the
  // landing page, where the brand should lead.
  title: { absolute: "CineRoll — Oscar, Cannes, Golden Globe & Berlinale Films" },
  description:
    "Every film nominated at the Oscars, Golden Globes, Cannes and the Berlinale. Roll a random award winner for tonight, or browse by award, year and genre.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "CineRoll — Roll the dice on award-winning films",
    description:
      "One spin, one film. Roll a random award-winning film to watch tonight.",
    url: "/",
    type: "website",
    images: [{ url: "/api/og", width: 1200, height: 630, alt: "CineRoll — award-winning films" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "CineRoll — Roll the dice on award-winning films",
    description:
      "One spin, one film. Roll a random award-winning film to watch tonight.",
    images: [{ url: "/api/og", width: 1200, height: 630, alt: "CineRoll — award-winning films" }],
  },
};

// Server Component: reads the onboarding cookie so the correct branch
// (onboarding vs. the main app) is decided on the server and server-rendered —
// no blank first paint, no first-visit flash. Reading cookies() opts this route
// into dynamic rendering, which is what we want for a per-visitor landing page.
export default async function HomePage() {
  const [cookieStore, archiveSize] = await Promise.all([cookies(), fetchArchiveSize()]);
  const onboarded = cookieStore.get(ONBOARDED_COOKIE)?.value === "true";

  return (
    <HomeClient initialOnboarded={onboarded} initialTotalCount={archiveSize} hero={<HomeHero />} />
  );
}
