import type { ChampionRailProps } from "../component-props";

export function ChampionRail({ champion, completedRound }: ChampionRailProps) {
  return (
    <aside className="hidden pt-28 lg:block">
      <div className="border-l border-[#1e1e2a] pl-4">
        <p className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.24em] text-[#555568]">
          {champion ? "Current Champion" : "Opening Bout"}
        </p>
        <p className="mt-2 line-clamp-2 font-[family-name:var(--font-display)] text-base font-bold leading-tight text-[#F5F5F0]/80">
          {champion?.title ?? "No champion yet"}
        </p>
        <p className="mt-2 font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.18em] text-[#77778a]">
          {champion ? `Won round ${completedRound}` : "First pick sets the bracket"}
        </p>
      </div>
    </aside>
  );
}
