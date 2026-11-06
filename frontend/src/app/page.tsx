import type { Metadata } from "next";
import { cookies } from "next/headers";
import { JsonLd } from "@/components/json-ld";
import { HomeClient } from "@/features/home/components/home-client";
import { ONBOARDED_COOKIE } from "@/features/home/constants/onboarded-cookie";
import { fetchArchiveSize } from "@/features/home/fetch-archive-size";
import { buildOrganization } from "@/lib/seo/build-organization";
import { buildWebSite } from "@/lib/seo/build-web-site";
import { SITE_DESCRIPTION } from "@/lib/seo/site-description";
import { HomeHero } from "./home-hero";

export const metadata: Metadata = {
  // `absolute` opts out of the layout's "%s | CineRoll" template for the
  // landing page, where the brand should lead.
  title: { absolute: "CineRoll — Oscar, Cannes, Golden Globe & Berlinale Films" },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    title: "CineRoll — Roll the dice on award-winning films",
    description: SITE_DESCRIPTION,
    url: "/",
    type: "website",
    images: [{ url: "/api/og", width: 1200, height: 630, alt: "CineRoll — award-winning films" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "CineRoll — Roll the dice on award-winning films",
    description: SITE_DESCRIPTION,
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
    <>
      <JsonLd data={buildOrganization()} />
      <JsonLd data={buildWebSite()} />
      <HomeClient initialOnboarded={onboarded} initialTotalCount={archiveSize} hero={<HomeHero />} />
    </>
  );
}
