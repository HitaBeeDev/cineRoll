"use client";

import { motion } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";
import type { RollFilm } from "@/lib/api";
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
      {phase === "revealed" && <RevealBanner correct={correct} answer={film.title} reduced={reduced} />}
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((option, index) => (
          <SuspectOption
            key={option.id}
            index={index}
            option={option}
            answerId={film.id}
            phase={phase}
            selected={selectedFilmId === option.id}
            onSelect={onSelect}
          />
        ))}
      </div>
    </section>
  );
}

function LineupHeader() {
  return (
    <div className="mb-2.5">
      <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.28em] text-[#D4AF37]">
        Suspect Lineup
      </p>
      <p className="mt-1 text-sm text-[#c4c4d2]">
        Choose one title, then reveal the answer in the vault.
      </p>
    </div>
  );
}

type RevealBannerProps = {
  correct: boolean | null;
  answer: string;
  reduced: boolean;
};

function RevealBanner({ correct, answer, reduced }: RevealBannerProps) {
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className={[
        "mb-2 flex items-center justify-between gap-3 rounded-xl border px-3 py-2",
        correct ? "border-[#4ade80]/45 bg-[#4ade80]/10 text-[#bbf7d0]" : "border-[#e8453c]/45 bg-[#e8453c]/10 text-[#fecaca]",
      ].join(" ")}
    >
      <div className="flex min-w-0 items-center gap-2">
        {correct ? (
          <CheckCircle2 className="h-4 w-4 shrink-0 text-[#4ade80]" />
        ) : (
          <XCircle className="h-4 w-4 shrink-0 text-[#e8453c]" />
        )}
        <p className="truncate font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.18em]">
          {correct ? "Correct pick" : "Case missed"}
        </p>
      </div>
      <p className="hidden text-xs text-[#d4d4df] sm:block">
        {correct ? "You cracked the hidden film." : `Answer: ${answer}`}
      </p>
    </motion.div>
  );
}

type SuspectOptionProps = {
  index: number;
  option: RollFilm;
  answerId: string;
  phase: Phase;
  selected: boolean;
  onSelect: (filmId: string) => void;
};

function SuspectOption({ index, option, answerId, phase, selected, onSelect }: SuspectOptionProps) {
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
        {String.fromCharCode(65 + index)}
      </span>
      <span className="min-w-0">
        <span className="line-clamp-2 font-[family-name:var(--font-display)] text-base font-bold leading-tight text-[#F5F5F0]">
          {option.title}
        </span>
        <span className={["mt-1 inline-flex rounded-full font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.1em]", state.labelClass].join(" ")}>
          {state.label}
        </span>
      </span>
    </button>
  );
}

type OptionStateInput = {
  phase: Phase;
  selected: boolean;
  isAnswer: boolean;
};

function getOptionState({ phase, selected, isAnswer }: OptionStateInput) {
  const revealedCorrect = phase === "revealed" && isAnswer;
  const revealedWrong = phase === "revealed" && selected && !isAnswer;

  if (revealedCorrect) {
    return {
      label: "Correct",
      labelClass: "text-[#D4AF37]",
      markerClass: "border-[#4ade80] bg-[#4ade80] text-[#07110b]",
      optionClass: "border-[#4ade80] bg-[#4ade80]/12 shadow-[0_0_34px_rgba(74,222,128,0.18)]",
    };
  }

  if (revealedWrong) {
    return {
      label: "Your pick",
      labelClass: "text-[#D4AF37]",
      markerClass: "border-[#e8453c] bg-[#e8453c] text-[#F5F5F0]",
      optionClass: "border-[#e8453c] bg-[#e8453c]/10 shadow-[0_0_34px_rgba(232,69,60,0.12)]",
    };
  }

  if (selected) {
    return {
      label: "Selected suspect",
      labelClass: "border border-[#D4AF37]/40 bg-[#D4AF37]/12 px-2 py-0.5 text-[#f3d76a]",
      markerClass: "border-[#D4AF37] bg-[#D4AF37] text-[#09090f]",
      optionClass:
        "border-[#D4AF37] bg-[linear-gradient(135deg,rgba(212,175,55,0.18),rgba(232,69,60,0.08))] shadow-[0_0_42px_rgba(212,175,55,0.22)]",
    };
  }

  return {
    label: "Candidate",
    labelClass: "text-[#a0a0b5]",
    markerClass: "border-[#3a3a53] bg-[#10101b] text-[#D4AF37] group-hover:border-[#D4AF37]/60",
    optionClass: "border-[#2a2a3e] bg-[#09090f] hover:border-[#e8453c]/60 hover:bg-[#141421]",
  };
}
