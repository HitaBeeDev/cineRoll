import type { Metadata } from "next";
import Link from "next/link";
import { AWARD_BODIES } from "@/features/awards/award-bodies";
import { AwardPageShell } from "@/features/awards/components/award-page-shell";

export const metadata: Metadata = {
  alternates: { canonical: "/awards" },
  title: "Oscars, Golden Globes, Cannes & Berlinale Winners",
  description:
    "Every winner and nominee at the Oscars, the Golden Globes, the Cannes Film Festival and the Berlinale — by year, by category and by genre.",
};

export default function AwardsPage() {
  return (
    <AwardPageShell
      crumbs={[{ label: "Awards", href: "/awards" }]}
      title="Film Awards: Winners and Nominees"
      intro={
        <p>
          CineRoll covers the four awards that shape film history: the Oscars, the Golden Globes,
          the Cannes Film Festival and the Berlinale. Pick one to see every ceremony, every
          category, and every film that won or was nominated. For the complete winners&apos; lists
          of the biggest prizes, see the{" "}
          <Link href="/collections" className="text-fg-hi underline underline-offset-4 hover:text-accent">
            collections
          </Link>
          , or browse the best films{" "}
          <Link href="/decades" className="text-fg-hi underline underline-offset-4 hover:text-accent">
            by decade
          </Link>
          ,{" "}
          <Link href="/countries" className="text-fg-hi underline underline-offset-4 hover:text-accent">
            country
          </Link>{" "}
          or{" "}
          <Link href="/languages" className="text-fg-hi underline underline-offset-4 hover:text-accent">
            language
          </Link>
          , or{" "}
          <Link href="/moods" className="text-fg-hi underline underline-offset-4 hover:text-accent">
            by mood
          </Link>
          .
        </p>
      }
    >
      <ul className="grid gap-4 sm:grid-cols-2">
        {AWARD_BODIES.map((body) => (
          <li key={body.slug}>
            <Link
              href={`/awards/${body.slug}`}
              className="block h-full rounded-lg border border-edge bg-ink-900 p-6 transition-colors hover:border-edge-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
            >
              <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold">{body.name}</h2>
              <p className="mt-2 text-sm leading-6 text-fg-muted">{body.intro[0]}</p>
              <p className="mt-3 text-sm text-accent">{body.headline} winners and more →</p>
            </Link>
          </li>
        ))}
      </ul>
    </AwardPageShell>
  );
}
