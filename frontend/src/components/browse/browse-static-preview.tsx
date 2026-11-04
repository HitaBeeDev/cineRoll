import type { PaginatedFilms } from "@cineroll/types";
import { AppHeader } from "@/components/app-header";
import { BrowseHero } from "@/components/browse/browse-hero";
import { FilmTile } from "@/components/film-tile";
import { FILM_GRID_CLASS } from "@/components/film-tile/film-grid-class";

/**
 * Server-rendered stand-in for the browse page, shown as the Suspense fallback.
 * The interactive page reads the URL (filters live there), so it can only render
 * in the browser; without this, crawlers and the first paint got an empty page.
 * It mirrors the real layout so the swap on hydration is quiet.
 */
export function BrowseStaticPreview({ preview }: { preview: PaginatedFilms | null }) {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-ink-950 text-fg-hi">
      <AppHeader />
      <main className="flex flex-1 flex-col">
        <BrowseHero />
        <section className="mx-auto w-full max-w-[100vw] flex-1 px-4 py-6 sm:max-w-screen-2xl sm:px-6 sm:py-8 lg:px-8 xl:px-12">
          <p className="mb-6 max-w-2xl text-sm leading-relaxed text-fg-muted">
            Every film nominated at the Oscars, Golden Globes, Cannes and the Berlinale
            {preview ? ` — ${preview.total.toLocaleString("en-US")} titles` : ""}, ranked here by
            most wins. Filter by award, year, genre, country or language to narrow it down.
          </p>
          <p className="mb-6 max-w-2xl text-sm leading-relaxed text-fg-muted">
            Every title links to its own page with the complete award record — each nomination
            and each win, at all four awards — plus cast, ratings and similar films. Search by
            title or by person to find a director or actor&apos;s award-recognised work, sort by
            rating, wins or nominations, or let CineRoll roll a random film from whatever you
            have filtered.
          </p>
          {preview && preview.films.length > 0 && (
            <h2 className="mb-5 font-[family-name:var(--font-geist-mono)] text-[11px] font-semibold uppercase tracking-[0.4em] text-accent">
              Most awarded first
            </h2>
          )}
          {preview && preview.films.length > 0 && (
            <div className={FILM_GRID_CLASS}>
              {preview.films.map((film) => (
                <FilmTile key={film.id} film={film} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
