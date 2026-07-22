import { cn } from "@/lib/utils";

/** A single 👍/👎 toggle inside the post-watch sentiment prompt. */
export function SentimentButton({
  tone,
  active,
  disabled,
  onClick,
  icon,
  label,
}: {
  tone: "like" | "dislike";
  active: boolean;
  disabled?: boolean | undefined;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  const toneClasses =
    tone === "like"
      ? active
        ? "border-[#3fb950]/45 bg-[#3fb950]/12 text-[#7ee787]"
        : "border-[#1e1e2a] text-[#888899] hover:border-[#3fb950]/45 hover:text-[#7ee787]"
      : active
        ? "border-[#46465e] bg-white/[0.06] text-[#F5F5F0]"
        : "border-[#1e1e2a] text-[#888899] hover:border-[#6a6a85] hover:text-[#F5F5F0]";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      aria-label={label}
      title={label}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-lg border transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]",
        "disabled:cursor-not-allowed disabled:opacity-60",
        toneClasses,
      )}
    >
      {icon}
    </button>
  );
}
