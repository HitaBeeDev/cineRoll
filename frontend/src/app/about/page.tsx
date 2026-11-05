import type { Metadata } from "next";
import { AppHeader } from "@/components/app-header";
import { AboutClosing } from "@/features/about/components/about-closing";
import { AboutContent } from "@/features/about/components/about-content";
import { AboutHero } from "@/features/about/components/about-hero";
import { AboutStats } from "@/features/about/components/about-stats";
import { fetchArchiveSize } from "@/features/home/fetch-archive-size";
import { fetchCoverage } from "@/features/methodology/fetch-coverage";

export const metadata: Metadata = {
  alternates: { canonical: "/about" },
  title: "About CineRoll — Award-Winning Films in One Place",
  description:
    "What CineRoll is, how it differs from IMDb and Letterboxd, where its Oscar, Golden Globe, Cannes and Berlinale data comes from, and who makes it.",
};

// Regenerated at most daily, for the archive size and coverage it quotes.
export const revalidate = 86400;

export default async function AboutPage() {
  const [archiveSize, coverage] = await Promise.all([fetchArchiveSize(), fetchCoverage()]);

  return (
    <main className="min-h-screen bg-ink-950 text-[#f4f4f5]">
      <AppHeader />
      <AboutHero />
      <AboutStats archiveSize={archiveSize} coverage={coverage} />
      <AboutContent archiveSize={archiveSize} />
      <AboutClosing />
    </main>
  );
}
