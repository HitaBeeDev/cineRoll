import type { Metadata } from "next";
import Link from "next/link";
import { AwardPageShell } from "@/features/awards/components/award-page-shell";
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
  { group: "winners", title: "Every winner of a top prize" },
  { group: "cross-award", title: "Winners at more than one award" },
  { group: "comparison", title: "Where two awards agreed" },
];

export default async function CollectionsPage() {
  const collections = await fetchListableCollections();

  return (
    <AwardPageShell
      crumbs={[{ label: "Collections", href: "/collections" }]}
      title="Award-Winning Film Collections"
      intro={
        <p>
          Ready-made watchlists from the award records: the complete winners&apos; lists of the
          biggest prizes, the films that won at more than one of the big four awards, and the ones
          two very different juries both chose.
        </p>
      }
    >
      {GROUPS.map(({ group, title }) => {
        const inGroup = collections.filter((collection) => collection.group === group);
        if (inGroup.length === 0) return null;
        return (
          <section key={group} aria-labelledby={`group-${group}`}>
            <h2
              id={`group-${group}`}
              className="font-[family-name:var(--font-geist-mono)] text-[11px] font-semibold uppercase tracking-[0.4em] text-accent"
            >
              {title}
            </h2>
            <ul className="mt-4 grid gap-4 sm:grid-cols-2">
              {inGroup.map((collection) => (
                <li key={collection.slug}>
                  <Link
                    href={`/collections/${collection.slug}`}
                    className="block h-full rounded-lg border border-edge bg-ink-900 p-6 transition-colors hover:border-edge-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
                  >
                    <h3 className="font-[family-name:var(--font-display)] text-xl font-bold">{collection.h1}</h3>
                    <p className="mt-2 text-sm leading-6 text-fg-muted">{collection.description}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </AwardPageShell>
  );
}
