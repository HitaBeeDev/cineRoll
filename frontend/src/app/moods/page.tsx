import type { Metadata } from "next";
import Link from "next/link";
import { AwardPageShell } from "@/features/awards/components/award-page-shell";
import { fetchListableMoods } from "@/features/moods/fetch-listable-moods";

export const metadata: Metadata = {
  alternates: { canonical: "/moods" },
  title: "Find Movies by Mood: Feel-Good, Tense & More",
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
      title="Find award-winning movies by mood"
      related={[{ href: "/tools/random-movie-by-mood", label: "Pick a random movie by mood" }]}
      intro={
        <>
        <p>
          Not sure what you want, but know how you want to feel? Pick a mood and see the most
          awarded films that match it.
        </p>
        <p>
          Every film in CineRoll is tagged with a few moods, themes and styles — feel-good or
          haunting, slow-burn or tense, black-and-white or epic — based on what the film is like
          to watch. Each mood page lists the award winners and nominees that carry the tag, most
          awarded first, so you can go from a feeling to a film in two clicks. Tags are assigned
          automatically, so treat them as a guide rather than a verdict.
        </p>
        </>
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
