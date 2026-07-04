import type { RollFilm } from "@/lib/api";
import { LockedVault } from "./locked-vault";
import { RevealedVault } from "./revealed-vault";
import type { Phase, ShareStatus } from "./types";

type VaultPanelProps = {
  film: RollFilm;
  phase: Phase;
  correct: boolean | null;
  selectedFilm: RollFilm | null;
  selectedFilmId: string | null;
  examinedCount: number;
  awardCount: number;
  shareStatus: ShareStatus;
  reduced: boolean;
  onReveal: () => void;
  onChallengeFriend: () => void;
  onNextFilm: () => void;
};

export function VaultPanel(props: VaultPanelProps) {
  return (
    <aside
      className={[
        "relative flex min-h-[360px] flex-col overflow-hidden rounded-2xl border border-[#34344c] bg-[linear-gradient(160deg,#12121f,#09090f_60%)] p-3 shadow-[0_24px_80px_rgba(0,0,0,0.38)]",
        "lg:h-full lg:min-h-0 lg:self-stretch",
      ].join(" ")}
    >
      <div
        className={[
          "pointer-events-none absolute inset-x-0 top-0 h-1",
          props.phase === "revealed" && props.correct ? "bg-[#4ade80]" : "bg-[#D4AF37]",
        ].join(" ")}
      />
      {props.phase === "revealed" ? (
        <RevealedVault
          film={props.film}
          correct={props.correct}
          shareStatus={props.shareStatus}
          reduced={props.reduced}
          onChallengeFriend={props.onChallengeFriend}
          onNextFilm={props.onNextFilm}
        />
      ) : (
        <LockedVault
          selectedFilm={props.selectedFilm}
          selectedFilmId={props.selectedFilmId}
          examinedCount={props.examinedCount}
          awardCount={props.awardCount}
          onReveal={props.onReveal}
        />
      )}
    </aside>
  );
}
