import type { Accent, FilmStat } from "../types";
import { FeaturedFilmCard } from "./featured-film-card";
import { RunnerUpFilmCard } from "./runner-up-film-card";

type FilmRecordGroupProps = { heading: string; films: FilmStat[]; unit: string; accent: Accent };

export function FilmRecordGroup({ heading, films, unit, accent }: FilmRecordGroupProps) {
  const [first, ...rest] = films;
  return (
    <div>
      <h3 className="mb-3 font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.2em] text-[#c4c1d2]">{heading}</h3>
      {first && <FeaturedFilmCard film={first} rank={1} unit={unit} accent={accent} />}
      {rest.length > 0 && <div className="mt-3 grid gap-3 sm:grid-cols-2">{rest.map((film, index) => <RunnerUpFilmCard key={film.id} film={film} rank={index + 2} unit={unit} accent={accent} />)}</div>}
    </div>
  );
}
