import type { Metadata } from "next";
import { AppHeader } from "@/components/app-header";
import { JsonLd } from "@/components/json-ld";
import { fetchArchiveSize } from "@/features/home/fetch-archive-size";
import { MethodologyContent } from "@/features/methodology/components/methodology-content";
import { MethodologyHero } from "@/features/methodology/components/methodology-hero";
import { fetchCoverage } from "@/features/methodology/fetch-coverage";
import { fetchCatalogUpdated } from "@/lib/api/fetch-catalog-updated";
import { buildDataset } from "@/lib/seo/build-dataset";

export const metadata: Metadata = {
  alternates: { canonical: "/methodology" },
  title: "Methodology — How CineRoll's Award Data Is Built",
  description:
    "Where CineRoll's Oscar, Golden Globe, Cannes and Berlinale records come from, how nominations are matched to films, what is checked and the known gaps.",
};

// Regenerated at most daily, like the award data it reads.
export const revalidate = 86400;

export default async function MethodologyPage() {
  const [coverage, filmCount, updatedAt] = await Promise.all([
    fetchCoverage(),
    fetchArchiveSize(),
    fetchCatalogUpdated(),
  ]);

  return (
    <main className="min-h-screen bg-ink-950 text-[#f4f4f5]">
      <JsonLd data={buildDataset({ coverage, filmCount, updatedAt })} />
      <AppHeader />
      <MethodologyHero updatedAt={updatedAt} />
      <MethodologyContent coverage={coverage} filmCount={filmCount} />
    </main>
  );
}
