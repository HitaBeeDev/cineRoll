import { cn } from "@/lib/utils/cn";

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
        ? "border-affirm/45 bg-affirm/12 text-affirm-hi"
        : "border-edge text-fg-muted hover:border-affirm/45 hover:text-affirm-hi"
      : active
        ? "border-edge-hover bg-white/[0.06] text-fg-hi"
        : "border-edge text-fg-muted hover:border-edge-hover hover:text-fg-hi";

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
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        "disabled:cursor-not-allowed disabled:opacity-60",
        toneClasses,
      )}
    >
      {icon}
    </button>
  );
}
