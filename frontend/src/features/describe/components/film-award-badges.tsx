import type { FilmAwardSummary } from "../get-film-awards";

export function FilmAwardBadges({ awards }: { awards: FilmAwardSummary[] }) {
  if (awards.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1">
      {awards.map((award) => (
        <span
          key={award.key}
          className="rounded border border-[#2a2a3e] bg-[#09090f]/75 px-1.5 py-0.5 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-widest text-[#d8d8df]"
        >
          {award.label}{" "}
          {award.wins > 0 && <span className="text-[#e8453c]">{award.wins}W</span>}
          {award.wins > 0 && award.nominations > award.wins && " "}
          {award.nominations > award.wins && (
            <span className="text-[#888899]">
              {award.nominations - award.wins}N
            </span>
          )}
        </span>
      ))}
    </div>
  );
}
