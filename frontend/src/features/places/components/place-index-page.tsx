import Link from "next/link";
import { AwardPageShell } from "@/features/awards/components/award-page-shell";
import { fetchPlaces } from "../fetch-places";
import { PLACE_COPY } from "../place-copy";
import type { PlaceKind } from "../place-types";

/** `/countries` or `/languages`: every one with a page, biggest first. */
export async function PlaceIndexPage({ kind }: { kind: PlaceKind }) {
  const copy = PLACE_COPY[kind];
  const places = await fetchPlaces(kind);

  return (
    <AwardPageShell
      crumbs={[{ label: copy.crumb, href: `/${kind}` }]}
      title={copy.indexTitle}
      intro={<p>{copy.indexIntro}</p>}
    >
      <ul className="grid gap-x-6 sm:grid-cols-2 lg:grid-cols-3">
        {places.map((place) => (
          <li key={place.slug} className="border-b border-white/5 py-2.5">
            <Link href={`/${kind}/${place.slug}`} className="text-fg-hi hover:text-accent">
              {place.name}
            </Link>
            <span className="ml-2 text-sm text-fg-muted">{place.films.toLocaleString("en-US")} films</span>
          </li>
        ))}
      </ul>
    </AwardPageShell>
  );
}
