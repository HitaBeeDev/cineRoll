import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { AwardPageShell } from "@/features/awards/components/award-page-shell";
import { FilmGridSection } from "@/features/collections/components/film-grid-section";
import { TonightPicker } from "@/features/tonight/components/tonight-picker";
import { fetchTonightPicks } from "@/features/tonight/fetch-tonight-picks";
import { TONIGHT_DEFAULT_REGION } from "@/features/tonight/tonight-constants";
import { buildItemList } from "@/lib/seo/build-item-list";
import { regionName } from "@/lib/streaming/region-name";

export const metadata: Metadata = {
  alternates: { canonical: "/tonight" },
  title: "What to Watch Tonight? Find a Movie to Stream",
  description:
    "Can't decide what to watch tonight? Pick your streaming services and how long you have, and get one award-winning film you can stream right now.",
};

// An hour. The picks rotate daily, but a render that caught the backend down
// (e.g. at build time) must not leave the page without them for a whole day.
export const revalidate = 3600;

const LINK = "text-fg-hi underline decoration-white/25 underline-offset-4 hover:text-accent";

export default async function TonightPage() {
  const region = TONIGHT_DEFAULT_REGION;
  const { films, pool } = await fetchTonightPicks(region);
  const name = regionName(region);

  return (
    <AwardPageShell
      crumbs={[{ label: "What to watch tonight", href: "/tonight" }]}
      title="What to watch tonight"
      related={[
        { href: "/tools/random-award-winning-movie", label: "Movie roulette: roll a random award winner" },
        { href: "/streaming", label: "Award films streaming now, by country" },
        { href: "/picks", label: "Today's picks" },
        { href: "/browse", label: "Browse and filter every film" },
      ]}
      intro={
        <>
          <p>
            Not sure what movie to watch tonight? CineRoll picks an award-recognised film that
            fits your evening. Choose your country, streaming services and available time below.
          </p>
          <p>
            Scrolling through five apps for half an hour is how a free evening disappears. Tell us
            where you are, which services you already pay for and how much time you have, and you
            get one film — a feature that won or was nominated at the Oscars, the Golden Globes,
            Cannes or the Berlinale, and that is streaming on one of your services right now.
          </p>
          <p>
            Only subscription streaming counts: nothing to rent or buy. Availability is checked
            against TMDB every week, with data from JustWatch. Don&apos;t like the pick? Ask for
            something else — a film you have already been shown won&apos;t come back.
          </p>
        </>
      }
    >
      <TonightPicker />

      {films.length > 0 && (
        <>
          <JsonLd data={buildItemList(`Award-winning films to stream tonight in ${name}`, "/tonight", films)} />
          <FilmGridSection
            id="tonight-picks"
            title={`Tonight's picks, streaming in ${name}`}
            films={films}
            footer={
              <>
                Twelve of the {pool} award winners rated 7 or more on IMDb that are streaming in {name}{" "}
                — a new set every day. Elsewhere? See{" "}
                <Link href="/streaming" className={LINK}>
                  what is streaming in your country
                </Link>
                .
              </>
            }
          />
        </>
      )}
    </AwardPageShell>
  );
}
