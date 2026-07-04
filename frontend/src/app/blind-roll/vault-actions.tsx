import { Link2, RefreshCw } from "lucide-react";
import type { ShareStatus } from "./types";

type ChallengeButtonProps = {
  shareStatus: ShareStatus;
  onClick: () => void;
};

export function ChallengeButton({ shareStatus, onClick }: ChallengeButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-12 items-center justify-center gap-2 rounded-xl border border-[#D4AF37]/35 bg-[#D4AF37]/10 font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.18em] text-[#D4AF37] transition-colors hover:bg-[#D4AF37]/15 hover:text-[#f3d76a]"
    >
      <Link2 className="h-3.5 w-3.5" />
      {getShareLabel(shareStatus)}
    </button>
  );
}

export function NextFilmButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-14 items-center justify-center gap-2 rounded-xl border border-[#2a2a3e] bg-[#111118] font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.2em] text-[#888899] transition-colors hover:border-[#e8453c]/60 hover:text-[#F5F5F0]"
    >
      <RefreshCw className="h-3.5 w-3.5" />
      Next Film
    </button>
  );
}

function getShareLabel(shareStatus: ShareStatus): string {
  if (shareStatus === "copied") return "Link Copied";
  if (shareStatus === "failed") return "Could Not Share";
  return "Challenge A Friend";
}
