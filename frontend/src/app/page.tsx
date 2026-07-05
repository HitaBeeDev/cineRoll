import type { Metadata } from "next";
import { cookies } from "next/headers";
import { HomeClient } from "./home-client";
import { HomeHero } from "./home-hero";

// Must match the cookie written by `markOnboardedCookie` in home-client.tsx.
const ONBOARDED_COOKIE = "cineroll_onboarded";

export const metadata: Metadata = {
  // `absolute` opts out of the layout's "%s | CineRoll" template for the
  // landing page, where the brand should lead.
  title: { absolute: "CineRoll — Roll the dice on award-winning films" },
  description:
    "One spin, one film. Roll a random Oscar, Cannes, Golden Globe, or Berlinale winner to watch tonight — or filter by award, genre, decade, and rating.",
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
  const onboarded =
    (await cookies()).get(ONBOARDED_COOKIE)?.value === "true";

  return <HomeClient initialOnboarded={onboarded} hero={<HomeHero />} />;
}
