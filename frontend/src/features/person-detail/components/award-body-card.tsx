import Link from "next/link";
import { sortAwardRows } from "../sort-award-rows";
import type { AwardBodyCardProps } from "../component-props";

export function AwardBodyCard({ body }: AwardBodyCardProps) {
  const records = sortAwardRows(body.records);

  return (
    <article className="overflow-hidden border border-[#1e1e30]">
      <div className="flex items-center justify-between border-b border-[#1a1a28] bg-[#0d0d18] px-5 py-4">
        <div>
          <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.55em] text-[#444460]">
            {body.code}
          </p>
          <h3 className="mt-1 font-[family-name:var(--font-display)] text-lg font-bold text-[#e0e0f0]">
            {body.label}
          </h3>
        </div>
        <div className="flex items-baseline gap-6">
          <div className="text-right">
            <span
              className="block font-[family-name:var(--font-display)] text-2xl font-bold leading-none tabular-nums"
              style={{ color: body.wins > 0 ? "#e8453c" : "#3a3a58" }}
            >
              {body.wins}
            </span>
            <span className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.4em] text-[#555570]">Wins</span>
          </div>
          <div className="text-right">
            <span className="block font-[family-name:var(--font-display)] text-xl font-bold leading-none tabular-nums text-[#555570]">
              {body.records.length}
            </span>
            <span className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.4em] text-[#555570]">Noms</span>
          </div>
        </div>
      </div>
      <div className="divide-y divide-[#0b0b12]">
        {records.map((record) => (
          <div
            key={`${record.awardYear}-${record.category}-${record.filmSlug}`}
            className={`grid grid-cols-[auto_1fr_auto] items-center gap-4 border-l-2 px-5 py-3.5 ${
              record.won
                ? "border-l-[#D4AF37]/50 bg-[#0e0d09]"
                : "border-l-transparent bg-[#080810]"
            }`}
          >
            <span
              className={`shrink-0 font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.4em] ${
                record.won ? "text-[#c8a048]" : "text-[#2a2a3a]"
              }`}
            >
              {record.won ? "◆ Won" : "Nom"}
            </span>
            <div className="min-w-0">
              <p className={`text-[0.8rem] font-medium leading-5 ${record.won ? "text-[#e8ddb8]" : "text-[#9090a8]"}`}>
                {record.category}
              </p>
              <Link
                href={`/film/${record.filmSlug}`}
                className="group mt-0.5 inline-flex items-center gap-1 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.14em] text-[#555570] transition-colors hover:text-[#e8453c]"
              >
                {record.filmTitle}
                <span className="text-[#2a2a3a] transition-colors group-hover:text-[#e8453c]">
                  ({record.releaseYear})
                </span>
              </Link>
            </div>
            <span className="shrink-0 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.3em] text-[#444460]">
              {record.awardYear}
            </span>
          </div>
        ))}
      </div>
    </article>
  );
}
