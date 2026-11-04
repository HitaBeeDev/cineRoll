import type { Metadata } from "next";
import { AppHeader } from "@/components/app-header";
import { AboutContent } from "@/features/about/components/about-content";
import { AboutHero } from "@/features/about/components/about-hero";
import { fetchArchiveSize } from "@/features/home/fetch-archive-size";

export const metadata: Metadata = {
  alternates: { canonical: "/about" },
  title: "About CineRoll — Award-Winning Films in One Place",
  description:
    "What CineRoll is, how it differs from IMDb and Letterboxd, where its Oscar, Golden Globe, Cannes and Berlinale data comes from, and who makes it.",
};

// Regenerated at most daily, for the archive size it quotes.
export const revalidate = 86400;

export default async function AboutPage() {
  const archiveSize = await fetchArchiveSize();

  return (
    <main className="min-h-screen bg-ink-950 text-[#f4f4f5]">
      <AppHeader />
      <AboutHero />
      <AboutContent archiveSize={archiveSize} />
    </main>
  );
}
