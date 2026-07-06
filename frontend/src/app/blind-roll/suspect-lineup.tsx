"use client";

import type { RollFilm } from "@/lib/api";
import { LineupHeader } from "./lineup-header";
import { SuspectOptions } from "./suspect-options";
import { SuspectRevealBanner } from "./suspect-reveal-banner";
import type { Phase } from "./types";

type SuspectLineupProps = {
  film: RollFilm;
  options: RollFilm[];
  phase: Phase;
  correct: boolean | null;
  selectedFilmId: string | null;
  reduced: boolean;
  onSelect: (filmId: string) => void;
};

export function SuspectLineup({
  film,
  options,
  phase,
  correct,
  selectedFilmId,
  reduced,
  onSelect,
}: SuspectLineupProps) {
  return (
    <section className="relative shrink-0 overflow-hidden rounded-2xl border border-[#34344c] bg-[#0d0d1a] p-3 shadow-[0_24px_80px_rgba(0,0,0,0.32)]">
      <LineupHeader />
      {phase === "revealed" && <SuspectRevealBanner correct={correct} answer={film.title} reduced={reduced} />}
      <SuspectOptions
        answerId={film.id}
        options={options}
        phase={phase}
        selectedFilmId={selectedFilmId}
        onSelect={onSelect}
      />
    </section>
  );
}
