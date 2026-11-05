import type { Metadata } from "next";
import { AppHeader } from "@/components/app-header";
import { AWARD_BODIES } from "@/features/awards/award-bodies";
import { AwardBodyCard } from "@/features/awards/components/award-body-card";
import { AwardsHubHero } from "@/features/awards/components/awards-hub-hero";
import { RelatedPages } from "@/features/awards/components/related-pages";
import { fetchCoverage } from "@/features/methodology/fetch-coverage";
import { fetchCatalogUpdated } from "@/lib/api/fetch-catalog-updated";

export const metadata: Metadata = {
  alternates: { canonical: "/awards" },
  title: "Oscars, Golden Globes, Cannes & Berlinale Winners",
  description:
    "Every winner and nominee at the Oscars, the Golden Globes, the Cannes Film Festival and the Berlinale — by year, by category and by genre.",
};

// Refreshed daily so the "Last updated" date and coverage follow the catalogue.
export const revalidate = 86400;

export default async function AwardsPage() {
  const [updatedAt, coverage] = await Promise.all([fetchCatalogUpdated(), fetchCoverage()]);
  const coverageBySlug = new Map(coverage.map((body) => [body.slug, body]));
  const span =
    coverage.length > 0
      ? {
          firstYear: Math.min(...coverage.map((body) => body.firstYear)),
          lastYear: Math.max(...coverage.map((body) => body.lastYear)),
        }
      : null;

  return (
    <main className="min-h-screen bg-ink-950 text-fg-hi">
      <AppHeader />
      <AwardsHubHero updatedAt={updatedAt} span={span} />
      <div className="mx-auto max-w-5xl space-y-14 px-6 py-10 lg:px-10 lg:py-12">
        <ul className="grid gap-5 sm:grid-cols-2">
          {AWARD_BODIES.map((body, index) => (
            <li key={body.slug}>
              <AwardBodyCard body={body} index={index} coverage={coverageBySlug.get(body.slug)} />
            </li>
          ))}
        </ul>
        <RelatedPages current="/awards" />
      </div>
    </main>
  );
}
