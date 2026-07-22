import Link from "next/link";
import { Share2 } from "lucide-react";
import { SharePopover } from "@/components/share-popover";
import { SaveToListButton } from "@/components/save-to-list-dialog";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import type { RollFilm } from "@/lib/api";

/** The bottom action row: View details, Add to list, and Share. */
export function SecondaryActions({
  film,
  isAuthenticated,
  onEngage,
}: {
  film: RollFilm;
  isAuthenticated: boolean;
  onEngage?: (() => void) | undefined;
}) {
  return (
    <div className="flex items-center gap-2 mt-1">
      <Link
        href={`/film/${film.slug}`}
        onClick={() => {
          onEngage?.();
          trackEvent({
            type: "film_click",
            filmId: film.id,
            context: { source: "roll_card", slug: film.slug },
          });
        }}
        className={cn(
          "flex flex-1 items-center justify-center rounded-xl py-3",
          "border border-[#2a2a3e] text-[#F5F5F0]",
          "font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.2em]",
          "transition-colors hover:border-[#6a6a85] hover:text-[#F5F5F0]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]",
        )}
      >
        View details
      </Link>
      <SaveToListButton
        filmId={film.id}
        filmTitle={film.title}
        isAuthenticated={isAuthenticated}
        iconOnly
        label="Add to list"
        className={cn(
          "flex h-11 items-center justify-center rounded-xl px-3",
          "border border-[#1e1e2a] text-[#888899]",
          "transition-colors hover:border-[#2a2a3e] hover:text-[#F5F5F0]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]",
        )}
      />
      <SharePopover
        slug={film.slug}
        title={film.title}
        url={`${typeof window !== "undefined" ? window.location.origin : ""}/film/${film.slug}?from=roll`}
        caption={film.plot ?? undefined}
        triggerAriaLabel="Share this film"
        triggerClassName={cn(
          "flex h-11 items-center justify-center rounded-xl px-3",
          "border border-[#1e1e2a] text-[#888899]",
          "transition-colors hover:border-[#2a2a3e] hover:text-[#F5F5F0]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]",
        )}
      >
        <Share2 className="h-4 w-4" aria-hidden />
      </SharePopover>
    </div>
  );
}
