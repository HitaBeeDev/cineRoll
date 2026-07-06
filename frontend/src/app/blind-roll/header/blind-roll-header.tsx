import { DIFFICULTY_DESCRIPTIONS } from "../constants";
import { DifficultyPicker } from "./difficulty-picker";
import { ScoreBadge } from "./score-badge";
import type { Difficulty, SessionScore } from "../types";

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
