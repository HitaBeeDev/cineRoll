import Link from "next/link";
import type { Film } from "@cineroll/types";
import { EditorialSectionLabel } from "@/components/editorial-section-label";
import { DECADES } from "@/features/decades/decades";
import type { Place } from "@/features/places/place-types";
import { nameToSlug } from "@/lib/utils/name-to-slug";
import type { FilmLinks } from "../film-repository/fetch-film-links";

const CHIP =
  "rounded-md border border-[#2a2a42] px-3 py-1.5 text-sm text-[#b4b4c4] transition-colors hover:border-accent/50 hover:text-fg-hi";

// One film can sit in dozens of category races; past this many the list stops
// helping anyone and the category pages already lead to the rest.
const MAX_RACES = 12;

type Group = { title: string; links: { href: string; label: string }[] };

/**
 * Where this film sits in the rest of the site: its award ceremonies,
 * categories and races, its genre at each award, its decade, countries,
 * language and director. Every link is to a page that exists.
 */
export function FilmExploreSection({
  film,
  links,
  countries,
  languages,
}: {
  film: Film;
  links: FilmLinks | null;
  countries: Place[];
  languages: Place[];
}) {
  const pages = links?.awardPages ?? [];
  const of = (kind: string) => pages.filter((page) => page.kind === kind);

  const decade = Math.floor(film.year / 10) * 10;
  const countryLinks = (links?.originCountries ?? []).flatMap((name) => {
    const place = countries.find((candidate) => candidate.value === name);
    return place ? [{ href: `/countries/${place.slug}`, label: `Films from ${place.name}` }] : [];
  });
  const language = languages.find((candidate) => candidate.value === links?.language);

  const groups: Group[] = [
    { title: "Ceremonies", links: of("year") },
    { title: "Categories", links: of("category") },
    { title: "Its races", links: of("category-year").slice(0, MAX_RACES) },
    { title: "Its genres at the awards", links: of("genre") },
    {
      title: "More like it",
      links: [
        ...(DECADES.includes(decade) ? [{ href: `/decades/${decade}s`, label: `Best films of the ${decade}s` }] : []),
        ...countryLinks,
        ...(language ? [{ href: `/languages/${language.slug}`, label: `${language.name}-language films` }] : []),
        ...(film.director ? [{ href: `/person/${nameToSlug(film.director)}`, label: `Directed by ${film.director}` }] : []),
      ],
    },
  ].filter((group) => group.links.length > 0);

  if (groups.length === 0) return null;

  return (
    <section id="explore" className="scroll-mt-24">
      <EditorialSectionLabel>Explore Further</EditorialSectionLabel>
      <div className="mt-8 space-y-6">
        {groups.map((group) => (
          <div key={group.title}>
            <h3 className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.22em] text-[#7c7ca0]">
              {group.title}
            </h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={CHIP}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
