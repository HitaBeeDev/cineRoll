import { Eye, Trophy } from "lucide-react";
import type { RollFilm } from "@/lib/api";

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

function VaultIcon() {
  return (
    <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#e8453c]/35 bg-[#e8453c]/10">
      <Eye className="h-8 w-8 text-[#e8453c]" />
    </div>
  );
}

function ExaminedAwardCount({
  examinedCount,
  awardCount,
}: {
  examinedCount: number;
  awardCount: number;
}) {
  if (awardCount === 0) return null;

  return (
    <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.12em] text-[#77778b]">
      {examinedCount} of {awardCount} {awardCount === 1 ? "record" : "records"} examined
    </p>
  );
}

function SelectedFilmCard({ film }: { film: RollFilm }) {
  return (
    <div className="mt-2 w-full rounded-xl border border-[#D4AF37]/35 bg-[#D4AF37]/10 px-4 py-3">
      <p className="font-[family-name:var(--font-display)] text-2xl font-bold leading-tight text-[#F5F5F0]">
        {film.title}
      </p>
      <p className="mt-2 text-sm leading-5 text-[#c4c4d2]">
        Open the vault to check this pick against the hidden film.
      </p>
    </div>
  );
}

function SelectPrompt() {
  return <p className="mt-2 text-sm leading-5 text-[#c4c4d2]">Select one suspect title to unlock the reveal.</p>;
}

function VaultStatus({ selected }: { selected: boolean }) {
  return (
    <div className="mt-3 min-h-5 text-center">
      <p className="text-xs text-[#c4c4d2]">
        {selected ? "Ready to reveal the hidden film." : "Select a suspect to reveal the answer."}
      </p>
    </div>
  );
}

function RevealButton({ selected, onReveal }: { selected: boolean; onReveal: () => void }) {
  return (
    <div className="mt-3 grid gap-2">
      <button
        type="button"
        onClick={onReveal}
        disabled={!selected}
        className={[
          "flex h-12 w-full items-center justify-center gap-2 rounded-xl font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.12em] transition",
          selected
            ? "bg-[#e8453c] text-[#F5F5F0] shadow-[0_0_44px_rgba(232,69,60,0.24)] hover:bg-[#d7372f]"
            : "border border-[#34344c] bg-[#171722] text-[#8b8ba0] shadow-none",
        ].join(" ")}
      >
        <Trophy className="h-3.5 w-3.5" />
        {selected ? "Open the Vault" : "Vault Locked"}
      </button>
    </div>
  );
}
