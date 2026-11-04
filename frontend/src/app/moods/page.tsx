import type { Metadata } from "next";
import Link from "next/link";
import { AwardPageShell } from "@/features/awards/components/award-page-shell";
import { fetchListableMoods } from "@/features/moods/fetch-listable-moods";

export const metadata: Metadata = {
  alternates: { canonical: "/moods" },
  title: "Award-Winning Films by Mood",
  description:
    "Find an award-winning film for your mood: feel-good, bittersweet, tense, haunting, slow-burn, twist endings and more.",
};

// Rendered per request (its size checks are cached API calls), never at build time.
export const dynamic = "force-dynamic";

export default async function MoodsPage() {
  const moods = await fetchListableMoods();

  return (
    <AwardPageShell
      crumbs={[{ label: "Moods", href: "/moods" }]}
      title="Award-Winning Films by Mood"
      intro={
        <p>
          Not sure what you want, but know how you want to feel? Pick a mood and see the most
          awarded films that match it.
        </p>
      }
    >
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {moods.map((mood) => (
          <li key={mood.tag}>
            <Link
              href={`/moods/${mood.tag}`}
              className="block h-full rounded-lg border border-edge bg-ink-900 p-5 transition-colors hover:border-edge-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
            >
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold">{mood.name}</h2>
              <p className="mt-2 text-sm leading-6 text-fg-muted">{mood.blurb}</p>
            </Link>
          </li>
        ))}
      </ul>
    </AwardPageShell>
  );
}
