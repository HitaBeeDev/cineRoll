import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Check, Film, Loader2, Plus } from "lucide-react";
import type { UserListSummary } from "@cineroll/types";
import { tmdbImageUrl } from "@/lib/images/tmdb-image-url";
import { cn } from "@/lib/utils/cn";

/**
 * One list row in the "Add to a list" dialog.
 *
 * The row has one job — put this film in this list — and it is the hit target
 * for it, edge to edge. Opening the list is a second, rarer intent, so it is
 * deliberately built to look like less: a small transparent chip, not the
 * full-height panel behind a divider it used to be. That old split read as two
 * halves of one control, with nothing saying which half saved the film.
 *
 * The trailing circle is state, not a third target. Empty circles read as radio
 * buttons — "pick one of these" — which is the wrong promise for a set you can
 * be in any number of. It carries a plus while the film is out of the list, so
 * the row says what it will do, and the accent tick once the film is in.
 */
export function ListRow({
  list,
  busy,
  onToggle,
}: {
  list: UserListSummary;
  busy: boolean;
  onToggle: () => void;
}) {
  const cover = list.previewPosters[0];

  return (
    <li
      className={cn(
        "group flex items-stretch overflow-hidden rounded-xl border transition-colors",
        list.containsFilm
          ? "border-accent/35 bg-[#15131a]"
          : "border-[#22222e] bg-[#14141c] hover:border-[#2f2f3d] hover:bg-edge-subtle",
      )}
    >
      <button
        type="button"
        disabled={busy}
        aria-pressed={list.containsFilm}
        onClick={onToggle}
        className="flex min-w-0 flex-1 items-center gap-3.5 p-3 pr-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent disabled:opacity-60"
      >
        <span className="relative flex h-[68px] w-[48px] shrink-0 items-center justify-center overflow-hidden rounded-md bg-ink-950 ring-1 ring-black/40">
          {cover ? (
            <Image
              src={tmdbImageUrl(cover, "w185") ?? cover}
              alt=""
              fill
              sizes="48px"
              className="object-cover"
            />
          ) : (
            <Film className="h-5 w-5 text-[#4a4a5c]" aria-hidden />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-[family-name:var(--font-geist-sans)] text-[15px] font-medium text-[#F7F7F2]">
            {list.name}
          </span>
          <span className="mt-1 block font-[family-name:var(--font-geist-sans)] text-[13px] text-[#9a9aac]">
            {list.filmCount} {list.filmCount === 1 ? "film" : "films"}
            {list.containsFilm && <span className="text-[#c2c2ce]"> · Saved</span>}
          </span>
        </span>
        <span
          className={cn(
            "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors",
            list.containsFilm
              ? "border-accent bg-accent text-white"
              : "border-[#3a3a4c] text-[#6a6a7c] group-hover:border-[#4a4a5c] group-hover:text-[#9a9aac]",
          )}
          aria-hidden
        >
          {busy ? (
            <Loader2 className="h-3 w-3 animate-spin text-[#9a9aac]" />
          ) : list.containsFilm ? (
            <Check className="h-3 w-3" />
          ) : (
            <Plus className="h-3 w-3" />
          )}
        </span>
      </button>
      {/* Secondary, and built to read that way: no divider, no full-height
          panel — a quiet chip that only earns colour on hover or focus. Sized
          to stay tappable even though it is styled to be ignored. */}
      <span className="flex shrink-0 items-center pr-2">
        <Link
          href={`/profile/lists/${list.id}`}
          aria-label={`Open ${list.name}`}
          title="Open list"
          className="flex h-10 w-10 items-center justify-center rounded-lg text-[#5a5a6c] transition-colors hover:bg-accent/10 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <ArrowUpRight className="h-4 w-4" aria-hidden />
        </Link>
      </span>
    </li>
  );
}
