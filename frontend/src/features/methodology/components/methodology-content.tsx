import Link from "next/link";
import { PolicySection } from "@/features/legal/components/policy-section";
import type { BodyCoverage } from "../coverage-types";
import { CoverageTable } from "./coverage-table";

const LINK_CLASS =
  "text-fg-hi underline decoration-white/25 underline-offset-4 transition-colors hover:text-accent";

export function MethodologyContent({
  coverage,
  filmCount,
}: {
  coverage: BodyCoverage[];
  filmCount: number | null;
}) {
  const size = filmCount ? filmCount.toLocaleString("en-US") : "thousands of";

  return (
    <div className="mx-auto max-w-4xl space-y-10 px-6 py-14 text-[#c8c8d8] lg:px-10">
      <PolicySection title="Sources">
        <ul>
          <li>
            <strong>Awards</strong> — the published nomination and winner lists of the Academy
            Awards, the Golden Globes, the Cannes Film Festival and the Berlinale, collected one
            ceremony at a time. One row per nomination: award, category, year, won or not.
          </li>
          <li>
            <strong>Film details</strong> — title, year, poster, cast, director, genres, country,
            language and plot from{" "}
            <a href="https://www.themoviedb.org" target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>
              TMDB
            </a>
            .
          </li>
          <li>
            <strong>Ratings</strong> — IMDb ratings and Rotten Tomatoes scores from the{" "}
            <a href="https://www.omdbapi.com" target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>
              OMDb API
            </a>
            . CineRoll shows these numbers; it does not make its own.
          </li>
        </ul>
        <p className="text-xs text-fg-muted">
          This product uses the TMDB API but is not endorsed or certified by TMDB.
        </p>
      </PolicySection>

      <PolicySection title="How films are matched">
        <p>
          The same film often appears under different names: an English title at the Oscars, the
          original title at Cannes, a slightly different year at the Globes. Left alone, one film
          would become three pages.
        </p>
        <ul>
          <li>
            Nominations are first grouped by title and release year, then each group is looked up
            on TMDB. The <strong>TMDB ID is the match key</strong>: every nomination that points to
            the same ID lands on the same film page, whatever title it was listed under.
          </li>
          <li>
            A film already in the catalogue only gets its new award rows added. Nothing else about
            it is fetched or changed again.
          </li>
          <li>
            When no confident match is found, the nomination goes to a manual review list. It is
            never dropped and never attached to a best guess.
          </li>
          <li>
            Series are matched with extra care: two shows with the same title from different
            decades are kept apart, so one show&apos;s awards do not leak onto the other.
          </li>
        </ul>
      </PolicySection>

      <PolicySection title="What is covered">
        <p>
          {size} films and series. Year ranges below are the ceremonies on record right now, read
          from the live data. The decade-by-decade breakdown and the missing years are on the{" "}
          <Link href="/data" className={LINK_CLASS}>data page</Link>.
        </p>
        <CoverageTable coverage={coverage} />
      </PolicySection>

      <PolicySection title="How it is checked">
        <ul>
          <li>
            Each ceremony&apos;s records are compared, line by line, with the award body&apos;s own
            published list. Missing films are added; wrong categories or winners are corrected.
          </li>
          <li>
            Every match is checked for title and year drift between the award list and TMDB. A
            large gap in years is reviewed by hand before it is accepted.
          </li>
          <li>
            This audit is ongoing and works back from the most recent ceremonies, so older years
            have had fewer passes than recent ones.
          </li>
        </ul>
      </PolicySection>

      <PolicySection title="Known gaps">
        <ul>
          <li>
            <strong>Honours with no film attached</strong> — honorary Oscars, the Cecil B. DeMille
            Award, the Honorary Golden Bear and similar lifetime prizes go to people, not films, so
            they are not recorded.
          </li>
          <li>
            <strong>Side prizes at festivals</strong> — independent juries such as FIPRESCI, the
            Ecumenical Jury and Critics&apos; Week at Cannes are not tracked as awards. Films
            selected there may still be in the catalogue for their other awards.
          </li>
          <li>
            <strong>Other festivals</strong> — Venice, BAFTA, the Emmys and others are not covered.
          </li>
          <li>
            <strong>Ratings</strong> — some older, foreign-language and short films have no IMDb
            rating or Rotten Tomatoes score, because OMDb has none for them.
          </li>
          <li>
            <strong>Person pages</strong> — they list Oscar, Golden Globe and Cannes records; the
            Berlinale is not shown there yet. It is shown on every film page.
          </li>
          <li>
            <strong>Thin pages</strong> — a category or year with only a handful of films does not
            get its own page; those films are still in the catalogue, with the award on their film page.
          </li>
        </ul>
      </PolicySection>

      <PolicySection title="Found a mistake?">
        <p>
          A wrong winner, a missing nomination or a film matched to the wrong title — use the
          feedback button at the bottom of any page. Every report is reviewed, and confirmed fixes go into the data.
          More about the project is on the <Link href="/about" className={LINK_CLASS}>about page</Link>,
          and the numbers are on the <Link href="/stats" className={LINK_CLASS}>stats page</Link>.
        </p>
      </PolicySection>
    </div>
  );
}
