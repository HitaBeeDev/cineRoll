import type { Metadata } from "next";
import Link from "next/link";
import { AwardPageShell } from "@/features/awards/components/award-page-shell";
import { DECADES } from "@/features/decades/decades";

export const metadata: Metadata = {
  alternates: { canonical: "/decades" },
  title: "Award-Winning Films by Decade",
  description:
    "The best award-winning films of every decade, from the 1920s to the 2020s — Oscar, Golden Globe, Cannes and Berlinale films ranked by wins.",
};

export default function DecadesPage() {
  return (
    <AwardPageShell
      crumbs={[{ label: "Decades", href: "/decades" }]}
      title="Award-Winning Films by Decade"
      intro={
        <p>
          Pick a decade to see its most awarded films — everything released in those ten years
          that won or was nominated at the Oscars, the Golden Globes, Cannes or the Berlinale,
          ranked by wins.
        </p>
      }
    >
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {[...DECADES].reverse().map((start) => (
          <li key={start}>
            <Link
              href={`/decades/${start}s`}
              className="block rounded-lg border border-edge bg-ink-900 px-5 py-6 text-center font-[family-name:var(--font-display)] text-2xl font-bold transition-colors hover:border-edge-hover hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
            >
              The {start}s
            </Link>
          </li>
        ))}
      </ul>
    </AwardPageShell>
  );
}
