import type { RollBattleGenresProps } from "../component-props";

export function RollBattleGenres({ genres }: RollBattleGenresProps) {
  if (genres.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {genres.slice(0, 4).map((genre) => (
        <span
          key={genre}
          className="rounded-full border border-[#e8453c]/25 bg-[#e8453c]/10 px-3 py-1 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.16em] text-[#e8453c]"
        >
          {genre}
        </span>
      ))}
    </div>
  );
}
