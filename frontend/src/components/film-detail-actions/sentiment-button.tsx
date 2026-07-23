import { cn } from "@/lib/utils";

/** A single 👍 / 👎 toggle in the post-watch sentiment prompt. */
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
        ? "border-[#3fb950]/50 bg-[#3fb950]/15 text-[#7ee787]"
        : "border-white/14 text-white/50 hover:border-[#3fb950]/45 hover:text-[#7ee787]"
      : active
        ? "border-[#e8453c]/50 bg-[#e8453c]/12 text-[#e8453c]"
        : "border-white/14 text-white/50 hover:border-[#e8453c]/45 hover:text-[#e8453c]";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      aria-label={label}
      title={label}
      className={cn(
        "flex h-9 w-9 items-center justify-center border transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]",
        "disabled:cursor-not-allowed disabled:opacity-60",
        toneClasses,
      )}
    >
      {icon}
    </button>
  );
}
