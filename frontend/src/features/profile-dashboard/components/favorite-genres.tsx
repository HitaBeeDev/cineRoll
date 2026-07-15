import type { FavoriteGenresProps } from "../profile-component-types";

export function FavoriteGenres({ genres }: FavoriteGenresProps) {
  return (
    <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2">
      <span className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.18em] text-[#9a9aac]">
        Favorite genres
      </span>
      <span className="flex flex-wrap gap-2">
        {genres.map((genre) => (
          <span
            key={genre}
            className="rounded-full border border-[#26263a] bg-[#0d0d1a] px-3 py-1 font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.12em] text-[#b9b9c6]"
          >
            {genre}
          </span>
        ))}
      </span>
    </div>
  );
}
