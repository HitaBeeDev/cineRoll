import { formatRuntime } from "@/lib/format";
import type { BattleFilmProps } from "../component-props";

export function BattleCardInfo({ film }: BattleFilmProps) {
  const genre = film.genres[0] ?? "";
  const runtime = formatRuntime(film.runtime);

  return (
    <div className="flex flex-col gap-1 px-3 py-2.5">
      <p className="truncate font-[family-name:var(--font-geist-mono)] text-[11px] font-semibold uppercase tracking-[0.16em] text-[#b6b6c8]">
        {film.year}
        {genre ? ` · ${genre}` : ""}
        {runtime ? ` · ${runtime}` : ""}
      </p>
      <h3 className="line-clamp-2 font-[family-name:var(--font-display)] text-sm font-bold leading-tight text-[#F5F5F0] sm:text-base">
        {film.title}
      </h3>
      {film.director && (
        <p className="truncate font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.1em] text-[#77778a]">
          Dir. {film.director}
        </p>
      )}
    </div>
  );
}
