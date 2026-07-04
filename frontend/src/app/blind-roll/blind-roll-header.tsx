import { DIFFICULTIES, DIFFICULTY_DESCRIPTIONS } from "./constants";
import type { Difficulty, SessionScore } from "./types";

type BlindRollHeaderProps = {
  difficulty: Difficulty;
  sessionScore: SessionScore;
  onDifficultyChange: (difficulty: Difficulty) => void;
};

export function BlindRollHeader({
  difficulty,
  sessionScore,
  onDifficultyChange,
}: BlindRollHeaderProps) {
  return (
    <div className="relative flex shrink-0 flex-col gap-1 text-left">
      <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.35em] text-[#e8453c]/70">
        Blind Roll
      </p>
      <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="max-w-full text-balance font-[family-name:var(--font-display)] text-3xl font-bold leading-tight sm:max-w-3xl lg:text-[2.6rem] lg:leading-none">
            Crack the festival case
          </h1>
          <p className="mt-1 max-w-full text-sm leading-5 text-[#c4c4d2] sm:max-w-2xl">
            Guess the hidden film using its release decade, award records, nominee status, and creators.
          </p>
        </div>
        <div className="flex flex-col items-start gap-2 lg:items-end">
          <div className="flex flex-wrap items-center gap-2">
            <DifficultyPicker difficulty={difficulty} onChange={onDifficultyChange} />
            <ScoreBadge score={sessionScore} />
          </div>
          <p className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.12em] text-[#a0a0b5]">
            {DIFFICULTY_DESCRIPTIONS[difficulty]}
          </p>
        </div>
      </div>
    </div>
  );
}

type DifficultyPickerProps = {
  difficulty: Difficulty;
  onChange: (difficulty: Difficulty) => void;
};

function DifficultyPicker({ difficulty, onChange }: DifficultyPickerProps) {
  return (
    <div className="flex rounded-full border border-[#2a2a3e] bg-[#0d0d1a] p-1" aria-label="Difficulty">
      {DIFFICULTIES.map((item) => {
        const active = difficulty === item.value;

        return (
          <button
            key={item.value}
            type="button"
            aria-pressed={active}
            title={DIFFICULTY_DESCRIPTIONS[item.value]}
            onClick={() => onChange(item.value)}
            className={[
              "rounded-full px-3 py-1.5 font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.12em] transition-colors",
              active ? "bg-[#D4AF37] text-[#09090f]" : "text-[#a0a0b5] hover:text-[#F5F5F0]",
            ].join(" ")}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

function ScoreBadge({ score }: { score: SessionScore }) {
  return (
    <div className="w-fit rounded-full border border-[#D4AF37]/35 bg-[#D4AF37]/10 px-4 py-2 font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.12em] text-[#D4AF37]">
      {score.correct} solved · {score.total} attempted
    </div>
  );
}
