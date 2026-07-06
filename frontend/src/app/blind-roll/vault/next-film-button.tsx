import { RefreshCw } from "lucide-react";

type NextFilmButtonProps = {
  onClick: () => void;
};

export function NextFilmButton({ onClick }: NextFilmButtonProps) {
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
