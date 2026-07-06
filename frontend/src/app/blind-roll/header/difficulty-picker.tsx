import { DIFFICULTIES, DIFFICULTY_DESCRIPTIONS } from "../constants";
import type { Difficulty } from "../types";

type DifficultyPickerProps = {
  difficulty: Difficulty;
  onChange: (difficulty: Difficulty) => void;
};

export function DifficultyPicker({ difficulty, onChange }: DifficultyPickerProps) {
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
