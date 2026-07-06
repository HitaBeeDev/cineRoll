import type { RollFilm } from "@/lib/api";

type SelectedFilmCardProps = {
  film: RollFilm;
};

export function SelectedFilmCard({ film }: SelectedFilmCardProps) {
  return (
    <div className="mt-2 w-full rounded-xl border border-[#D4AF37]/35 bg-[#D4AF37]/10 px-4 py-3">
      <p className="font-[family-name:var(--font-display)] text-2xl font-bold leading-tight text-[#F5F5F0]">
        {film.title}
      </p>
      <p className="mt-2 text-sm leading-5 text-[#c4c4d2]">
        Open the vault to check this pick against the hidden film.
      </p>
    </div>
  );
}
