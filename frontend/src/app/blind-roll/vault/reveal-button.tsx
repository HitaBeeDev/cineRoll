import { Trophy } from "lucide-react";

type RevealButtonProps = {
  selected: boolean;
  onReveal: () => void;
};

export function RevealButton({ selected, onReveal }: RevealButtonProps) {
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
