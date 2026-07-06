import type { RollFilm } from "@/lib/api";

import { ExaminedAwardCount } from "./examined-award-count";
import { RevealButton } from "./reveal-button";
import { SelectedFilmCard } from "./selected-film-card";
import { SelectPrompt } from "./select-prompt";
import { VaultIcon } from "./vault-icon";
import { VaultStatus } from "./vault-status";

type LockedVaultProps = {
  selectedFilm: RollFilm | null;
  selectedFilmId: string | null;
  examinedCount: number;
  awardCount: number;
  onReveal: () => void;
};

export function LockedVault({
  selectedFilm,
  selectedFilmId,
  examinedCount,
  awardCount,
  onReveal,
}: LockedVaultProps) {
  return (
    <>
      <div
        className="flex min-h-0 flex-1 items-center justify-center rounded-xl border border-dashed border-[#454560] bg-[#09090f]/75 p-4"
        aria-live="polite"
      >
        <div className="flex max-w-72 flex-col items-center gap-3 text-center">
          <VaultIcon />
          <p className="font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.16em] text-[#D4AF37]">
            {selectedFilm ? "Suspect selected" : "Vault locked"}
          </p>
          <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.12em] text-[#a0a0b5]">
            Title, poster, and plot hidden.
          </p>
          <ExaminedAwardCount examinedCount={examinedCount} awardCount={awardCount} />
          {selectedFilm ? <SelectedFilmCard film={selectedFilm} /> : <SelectPrompt />}
        </div>
      </div>
      <VaultStatus selected={Boolean(selectedFilm)} />
      <RevealButton selected={Boolean(selectedFilmId)} onReveal={onReveal} />
    </>
  );
}
