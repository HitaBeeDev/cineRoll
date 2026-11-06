import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { Breadcrumbs } from "@/components/breadcrumbs/breadcrumbs";
import { LastUpdated } from "@/components/last-updated";
import { RelatedPages } from "@/features/awards/components/related-pages";
import { CollectionsMotion } from "@/features/collections/components/collections-motion";
import { fetchCatalogUpdated } from "@/lib/api/fetch-catalog-updated";
import styles from "@/features/collections/components/collections.module.css";
import type { CollectionGroup } from "@/features/collections/collection-types";
import { fetchListableCollections } from "@/features/collections/fetch-collection-sizes";

export const metadata: Metadata = {
  alternates: { canonical: "/collections" },
  title: "Award-Winning Film Collections",
  description:
    "Complete lists of the biggest film prizes: every Best Picture winner, every Palme d'Or, every Golden Bear and every Oscar International Feature winner.",
};

// Rendered per request, never at build time: a build runs against the backend
// that is live before this deploy, which may not know the newest filters yet.
// The size checks behind it are cached API calls (a day), so this stays cheap;
// collections under five films are left off the list.
export const dynamic = "force-dynamic";

const GROUPS: { group: CollectionGroup; title: string }[] = [
  { group: "records", title: "All-time records" },
  { group: "winners", title: "Top-prize winners" },
  { group: "cross-award", title: "Multiple awards" },
  { group: "comparison", title: "Award overlaps" },
];

export default async function CollectionsPage() {
  const [collections, updatedAt] = await Promise.all([fetchListableCollections(), fetchCatalogUpdated()]);

  return (
    <main className="min-h-screen bg-ink-950 text-fg-hi">
      <AppHeader />
      <CollectionsMotion>
        <section className={styles.hero}>
          <div className="mx-auto max-w-6xl px-6 pb-8 pt-6 lg:px-10">
            <Breadcrumbs crumbs={[{ label: "Collections", href: "/collections" }]} />
            <p data-hero-reveal className="mt-6 flex items-center gap-3 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.3em] text-accent">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_14px_rgba(232,69,60,0.6)]" />
              Collections / The film archive
            </p>
            <h1 data-hero-reveal className="mt-4 max-w-4xl font-[family-name:var(--font-display)] text-3xl font-bold leading-[1.12] tracking-tight sm:text-5xl">
              Award-winning films.{" "}
              <span className="italic text-accent-soft">Extraordinary company.</span>
            </h1>
            <p data-hero-reveal className="mt-4 max-w-2xl text-sm leading-6 text-fg-muted">
              Ready-made watchlists from the Oscars, Golden Globes, Cannes and Berlinale.
              Choose a category and find your next great film.
            </p>
            <LastUpdated iso={updatedAt} className="mt-4" />
          </div>
        </section>

        <div id="archive-collections" className="mx-auto max-w-6xl space-y-8 px-6 py-8 lg:px-10">
          <div className={styles.browser}>
            <fieldset className="mb-6 flex flex-wrap gap-2">
              <legend className="sr-only">Collection category</legend>
              {GROUPS.filter(({ group }) => collections.some((collection) => collection.group === group)).map(({ group, title }, index) => (
                <label key={group} className="cursor-pointer">
                  <input type="radio" name="collection-category" value={group} defaultChecked={index === 0} className="peer sr-only" />
                  <span className="block rounded-full border border-white/15 px-4 py-2 text-xs text-fg-muted transition-colors hover:border-accent/50 peer-checked:border-accent/60 peer-checked:bg-accent/10 peer-checked:text-accent-soft peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-accent">
                    {title}
                  </span>
                </label>
              ))}
            </fieldset>
          {GROUPS.map(({ group, title }, groupIndex) => {
            const inGroup = collections.filter((collection) => collection.group === group);
            if (inGroup.length === 0) return null;
            return (
              <section key={group} data-collection-section data-category={group} className={styles.section} aria-labelledby={`group-${group}`}>
                <div className="flex items-center justify-between gap-4">
                  <h2 id={`group-${group}`} className="font-[family-name:var(--font-geist-mono)] text-[11px] font-semibold uppercase leading-6 tracking-[0.28em] text-accent">
                    <span aria-hidden className="mr-4 text-fg-faint">0{groupIndex + 1}</span>{title}
                  </h2>
                  <span aria-hidden className="shrink-0 font-[family-name:var(--font-geist-mono)] text-[10px] tracking-widest text-fg-faint">
                    {String(inGroup.length).padStart(2, "0")} LISTS
                  </span>
                </div>
                <ul className="mt-4 grid auto-rows-fr gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {inGroup.map((collection, index) => (
                    <li key={collection.slug} data-collection-card>
                      <Link href={`/collections/${collection.slug}`} className={styles.card}>
                        <span aria-hidden className="mb-3 font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.2em] text-fg-faint">
                          Collection / {String(groupIndex + 1).padStart(2, "0")}.{String(index + 1).padStart(2, "0")}
                        </span>
                        <h3 className="relative font-[family-name:var(--font-display)] text-xl font-bold leading-tight">{collection.h1}</h3>
                        <p className="relative mt-2 text-sm leading-6 text-fg-muted">{collection.description}</p>
                        <span className="relative mt-auto flex items-center justify-between pt-4 text-xs font-medium text-fg-dim">
                          Explore collection
                          <ArrowUpRight aria-hidden className={`${styles.arrow} h-5 w-5 text-accent`} />
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
          </div>
          <RelatedPages current="/collections" />
        </div>
      </CollectionsMotion>
    </main>
  );
}
