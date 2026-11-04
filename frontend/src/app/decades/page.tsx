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

// Refreshed daily so the "Last updated" date follows the catalogue.
export const revalidate = 86400;

export default function DecadesPage() {
  return (
    <AwardPageShell
      crumbs={[{ label: "Decades", href: "/decades" }]}
      title="Award-Winning Films by Decade"
      intro={
        <>
        <p>
          Pick a decade to see its most awarded films — everything released in those ten years
          that won or was nominated at the Oscars, the Golden Globes, Cannes or the Berlinale,
          ranked by wins.
        </p>
        <p>
          Each decade page shows how many films from those years were recognised, which one won
          the most, and how many won at each of the four awards — a quick way to see how film
          changed from the studio era of the 1930s through the New Hollywood 1970s to today. For
          something less planned, the random film by decade tool rolls one for you.
        </p>
        </>
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
