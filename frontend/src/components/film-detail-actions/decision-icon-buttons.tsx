import { Check, ThumbsDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { HoverTooltip } from "@/components/hover-tooltip";
import type { FilmActionState } from "@/hooks/film-actions/types";
import { ICON_BUTTON, ICON_IDLE } from "@/components/film-detail-actions/styles";

/** Tertiary icon row: the quiet "Watched" / "Not interested" decisions, each
 *  carrying a hover/focus label so the icons aren't a guessing game. */
export function DecisionIconButtons({
  action,
  pending,
  onMarkWatched,
  onNotInterested,
}: {
  action: FilmActionState;
  pending: boolean;
  onMarkWatched: () => void;
  onNotInterested: () => void;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <HoverTooltip label={action === "watched" ? "Watched" : "Mark watched"}>
        <button
          type="button"
          aria-pressed={action === "watched"}
          aria-label={action === "watched" ? "Marked watched" : "Mark watched"}
          disabled={pending}
          onClick={onMarkWatched}
          className={cn(
            ICON_BUTTON,
            action === "watched"
              ? "border-[#3fb950]/50 bg-[#3fb950]/15 text-[#7ee787]"
              : ICON_IDLE,
          )}
        >
          <Check className="h-4 w-4" aria-hidden />
        </button>
      </HoverTooltip>

      <HoverTooltip label={action === "not-interested" ? "Hidden" : "Not interested"}>
        <button
          type="button"
          aria-pressed={action === "not-interested"}
          aria-label={action === "not-interested" ? "Hidden" : "Not interested"}
          disabled={pending}
          onClick={onNotInterested}
          className={cn(
            ICON_BUTTON,
            action === "not-interested"
              ? "border-[#e8453c]/50 bg-[#e8453c]/12 text-[#e8453c]"
              : ICON_IDLE,
          )}
        >
          <ThumbsDown className="h-4 w-4" aria-hidden />
        </button>
      </HoverTooltip>
    </div>
  );
}
