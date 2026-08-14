import { cn } from "@/lib/utils/cn";
import type { FilmSentiment } from "@/lib/api/sentiment";
import type { ReRateButtonProps } from "../component-props";

export function ReRateButton(props: ReRateButtonProps) {
  const toneClasses = TONE_CLASSES[props.tone](props.active);

  return (
    <button
      type="button"
      onClick={props.onClick}
      disabled={props.disabled}
      aria-pressed={props.active}
      aria-label={props.label}
      title={props.label}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-lg border transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        "disabled:cursor-not-allowed disabled:opacity-60",
        toneClasses,
      )}
    >
      {props.icon}
    </button>
  );
}

// Coral for love, matching the film hero's rating ladder — the accent stands for
// the top of the viewer's own scale wherever they set it.
const TONE_CLASSES: Record<FilmSentiment, (active: boolean) => string> = {
  love: active =>
    active
      ? "border-accent/70 bg-accent/20 text-accent"
      : "border-edge text-[#888899] hover:border-accent/50 hover:text-accent",
  like: active =>
    active
      ? "border-affirm/50 bg-affirm/15 text-affirm-hi"
      : "border-edge text-[#888899] hover:border-affirm/45 hover:text-affirm-hi",
  dislike: active =>
    active
      ? "border-accent/50 bg-accent/12 text-accent"
      : "border-edge text-[#888899] hover:border-accent/45 hover:text-accent",
};
