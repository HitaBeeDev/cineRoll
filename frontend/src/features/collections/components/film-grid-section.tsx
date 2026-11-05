import type { ReactNode } from "react";
import type { Film } from "@cineroll/types";
import { FilmTile } from "@/components/film-tile";
import { FILM_GRID_CLASS } from "@/components/film-tile/film-grid-class";

/**
 * A titled poster grid. The section heading is an <h2> because each tile's
 * title is an <h3> — without it, list pages jumped from h1 straight to h3.
 */
export function FilmGridSection({
  title,
  films,
  id = "film-grid-title",
  footer,
}: {
  title: string;
  films: Film[];
  /** Needed when a page has several grids — heading ids must be unique. */
  id?: string;
  footer?: ReactNode;
}) {
  return (
    <section aria-labelledby={id}>
      <h2
        id={id}
        className="font-[family-name:var(--font-geist-mono)] text-[11px] font-semibold uppercase tracking-[0.4em] text-accent"
      >
        {title}
      </h2>
      <div className={`mt-5 ${FILM_GRID_CLASS}`}>
        {films.map((film) => (
          <FilmTile key={film.id} film={film} />
        ))}
      </div>
      {footer && <div className="mt-4 text-sm text-fg-muted">{footer}</div>}
    </section>
  );
}
