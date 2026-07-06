import type { RollFilm } from "@/lib/api";
import { SuspectOption } from "./suspect-option";
import type { Phase } from "../types";

type SuspectOptionsProps = {
  answerId: string;
  options: RollFilm[];
  phase: Phase;
  selectedFilmId: string | null;
  onSelect: (filmId: string) => void;
};

export function SuspectOptions({ answerId, options, phase, selectedFilmId, onSelect }: SuspectOptionsProps) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {options.map((option, index) => (
        <SuspectOption
          answerId={answerId}
          index={index}
          key={option.id}
          option={option}
          phase={phase}
          selected={selectedFilmId === option.id}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
