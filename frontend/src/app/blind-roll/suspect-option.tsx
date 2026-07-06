import type { RollFilm } from "@/lib/api";
import { getOptionMarker } from "./get-option-marker";
import { getOptionState } from "./get-option-state";
import type { Phase } from "./types";

type SuspectOptionProps = {
  index: number;
  option: RollFilm;
  answerId: string;
  phase: Phase;
  selected: boolean;
  onSelect: (filmId: string) => void;
};

export function SuspectOption({ index, option, answerId, phase, selected, onSelect }: SuspectOptionProps) {
  const state = getOptionState({ phase, selected, isAnswer: option.id === answerId });

  return (
    <button
      type="button"
      onClick={() => {
        if (phase !== "revealed") onSelect(option.id);
      }}
      className={[
        "group flex min-h-16 items-center gap-3 rounded-xl border p-3 text-left transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090f]",
        state.optionClass,
      ].join(" ")}
      disabled={phase === "revealed"}
    >
      <span
        className={[
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-widest transition-colors",
          state.markerClass,
        ].join(" ")}
      >
        {getOptionMarker(index)}
      </span>
      <span className="min-w-0">
        <span className="line-clamp-2 font-[family-name:var(--font-display)] text-base font-bold leading-tight text-[#F5F5F0]">
          {option.title}
        </span>
        <span
          className={[
            "mt-1 inline-flex rounded-full font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.1em]",
            state.labelClass,
          ].join(" ")}
        >
          {state.label}
        </span>
      </span>
    </button>
  );
}
