import type { Metadata } from "next";
import Link from "next/link";
import { AwardPageShell } from "@/features/awards/components/award-page-shell";
import { COLLECTIONS } from "@/features/collections/collections";

export const metadata: Metadata = {
  alternates: { canonical: "/collections" },
  title: "Award-Winning Film Collections",
  description:
    "Complete lists of the biggest film prizes: every Best Picture winner, every Palme d'Or, every Golden Bear and every Oscar International Feature winner.",
};

export default function CollectionsPage() {
  return (
    <AwardPageShell
      crumbs={[{ label: "Collections", href: "/collections" }]}
      title="Award-Winning Film Collections"
      intro={
        <p>
          The complete winners&apos; lists of the most important film prizes, each in one place —
          a ready-made watchlist, newest first.
        </p>
      }
    >
      <ul className="grid gap-4 sm:grid-cols-2">
        {COLLECTIONS.map((collection) => (
          <li key={collection.slug}>
            <Link
              href={`/collections/${collection.slug}`}
              className="block h-full rounded-lg border border-edge bg-ink-900 p-6 transition-colors hover:border-edge-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
            >
              <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold">{collection.h1}</h2>
              <p className="mt-2 text-sm leading-6 text-fg-muted">{collection.description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </AwardPageShell>
  );
}
