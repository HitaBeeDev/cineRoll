"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { FilmRecordType, StatsResponse } from "../types";
import { FilmRecordGroup } from "./film-record-group";
import { SectionHeader } from "./section-header";

type RecordTab = "all" | FilmRecordType;

const TAB_LABELS: Array<{ key: RecordTab; label: string }> = [
  { key: "all", label: "All" },
  { key: "movie", label: "Movies" },
  { key: "series", label: "Series" },
  { key: "animation", label: "Animation" },
  { key: "documentary", label: "Documentaries" },
  { key: "short", label: "Shorts" },
];

export function HallOfRecordsSection({ stats }: { stats: StatsResponse }) {
  const [tab, setTab] = useState<RecordTab>("all");

  const records = recordsFor(stats, tab);
  // Only offer tabs that actually hold records — an empty bucket is a data
  // gap, not a leaderboard.
  const tabs = TAB_LABELS.filter(
    ({ key }) =>
      recordsFor(stats, key).topWinning.length > 0 ||
      recordsFor(stats, key).topNominated.length > 0,
  );

  if (stats.topWinningFilms.length === 0 && stats.topNominatedFilms.length === 0) return null;
  return (
    <section>
      <SectionHeader eyebrow="Archive records" title="Hall of Records" description="The films and people that dominate the archive." actionHref="/browse?sort=awards" actionLabel="Enter the leaderboard" />
      {tabs.length > 2 && (
        <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Record type">
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              aria-pressed={tab === key}
              onClick={() => setTab(key)}
              className={cn(
                "rounded-full border px-4 py-1.5 font-[family-name:var(--font-geist-mono)] text-[12px] uppercase tracking-[0.08em] transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]",
                tab === key
                  ? "border-[#e8453c]/60 bg-[#e8453c]/10 text-[#ff766d]"
                  : "border-[#1e1e2a] text-[#aaa6ba] hover:border-white/25 hover:text-[#F5F5F0]",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      )}
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        {records.topWinning.length > 0 && <FilmRecordGroup heading="Most awarded" films={records.topWinning} unit="wins" accent="red" />}
        {records.topNominated.length > 0 && <FilmRecordGroup heading="Most nominated" films={records.topNominated} unit="nominations" accent="blue" />}
      </div>
    </section>
  );
}

function recordsFor(stats: StatsResponse, tab: RecordTab) {
  if (tab === "all") {
    return { topWinning: stats.topWinningFilms, topNominated: stats.topNominatedFilms };
  }
  return (
    stats.filmRecordsByType?.[tab] ?? { topWinning: [], topNominated: [] }
  );
}
