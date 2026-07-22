import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Check, Film, Loader2 } from "lucide-react";
import type { UserListSummary } from "@cineroll/types";
import { tmdbImageUrl } from "@/lib/images";
import { cn } from "@/lib/utils";

/** One list row: a toggle button (cover, name, count, membership tick) plus a
 *  link to open the list. */
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
          ? "border-[#e8453c]/35 bg-[#15131a]"
          : "border-[#22222e] bg-[#14141c] hover:border-[#2f2f3d] hover:bg-[#17171f]",
      )}
    >
      <button
        type="button"
        disabled={busy}
        aria-pressed={list.containsFilm}
        onClick={onToggle}
        className="flex min-w-0 flex-1 items-center gap-3.5 p-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#e8453c] disabled:opacity-60"
      >
        <span className="relative flex h-[68px] w-[48px] shrink-0 items-center justify-center overflow-hidden rounded-md bg-[#08080d] ring-1 ring-black/40">
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
              ? "border-[#e8453c] bg-[#e8453c] text-white"
              : "border-[#3a3a4c] text-transparent group-hover:border-[#4a4a5c]",
          )}
          aria-hidden
        >
          {busy ? (
            <Loader2 className="h-3 w-3 animate-spin text-[#9a9aac]" />
          ) : (
            <Check className="h-3 w-3" />
          )}
        </span>
      </button>
      <Link
        href={`/profile/lists/${list.id}`}
        aria-label={`Open ${list.name}`}
        title="Open list"
        className="flex w-12 shrink-0 items-center justify-center border-l border-[#22222e] text-[#8a8a9c] transition-colors hover:bg-[#e8453c]/10 hover:text-[#e8453c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#e8453c]"
      >
        <ArrowUpRight className="h-[18px] w-[18px]" aria-hidden />
      </Link>
    </li>
  );
}
