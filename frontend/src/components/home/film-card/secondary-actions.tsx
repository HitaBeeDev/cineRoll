import { Share2 } from "lucide-react";
import { SharePopover } from "@/components/share-popover";
import { SaveToListButton } from "@/components/save-to-list-dialog";
import { cn } from "@/lib/utils/cn";
import type { RollFilm } from "@/lib/api";
import { ViewDetailsLink } from "@/components/home/film-card/view-details-link";

/** The utilities that act on the film: View details, Add to list, and Share. */
export function SecondaryActions({
  film,
  isAuthenticated,
  onEngage,
  className,
  variant = "row",
}: {
  film: RollFilm;
  isAuthenticated: boolean;
  onEngage?: (() => void) | undefined;
  className?: string | undefined;
  /**
   * `row` is the home card's own footer: a ghost View details flanked by two
   * icons, in a line too narrow for three sets of words.
   *
   * `rail` is the roll panel's control column, where View details is already
   * carried above at full weight — printing it here too would put the same
   * destination on screen twice. What is left are the two utilities, spelled out
   * because a bookmark glyph alone does not say which of "save", "list" and
   * "watchlist" it is, and set as quiet ghosts: they are the smallest thing a
   * reader can do with a film they have just been handed, and they were sitting
   * at the same weight as the buttons that teach the roll.
   */
  variant?: "row" | "rail";
}) {
  const rail = variant === "rail";
  // Built by branch rather than by override: `cn` is a plain join, so a base
  // `h-9` followed by an `h-11` would leave both in the class list.
  const button = cn(
    "flex items-center justify-center gap-2 px-3",
    "font-[family-name:var(--font-geist-mono)]",
    "transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
    rail
      ? // No border at all: the tier above it is outlined and the tier below is
        // bare text, so an outline here would flatten all three into one wall of
        // identical boxes. The label carries the contrast (fg-faint on ink-850
        // is 5.7:1), which is what identifies the control.
        "h-8 flex-1 rounded-lg text-[11px] text-fg-faint hover:bg-white/[0.05] hover:text-fg-hi"
      : "h-11 rounded-xl border border-edge text-[12px] text-fg-muted hover:border-edge-strong hover:text-fg-hi",
  );

  return (
    <div className={cn("flex items-center gap-2", !rail && "mt-1", className)}>
      {!rail && (
        <ViewDetailsLink
          film={film}
          onEngage={onEngage}
          className={cn(
            "flex-1 rounded-xl py-3 text-[13px] text-fg-hi",
            "border border-edge-strong hover:border-edge-hover",
          )}
        />
      )}
      <SaveToListButton
        filmId={film.id}
        filmTitle={film.title}
        isAuthenticated={isAuthenticated}
        iconOnly={!rail}
        label="Add to list"
        className={button}
      />
      <SharePopover
        slug={film.slug}
        title={film.title}
        url={`${typeof window !== "undefined" ? window.location.origin : ""}/film/${film.slug}?from=roll`}
        caption={film.plot ?? undefined}
        triggerAriaLabel="Share this film"
        triggerClassName={button}
      >
        <Share2 className={rail ? "h-3.5 w-3.5" : "h-4 w-4"} aria-hidden />
        {rail && "Share"}
      </SharePopover>
    </div>
  );
}
