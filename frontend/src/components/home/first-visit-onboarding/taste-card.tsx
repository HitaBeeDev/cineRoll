import Image from "next/image";
import { Check } from "lucide-react";
import { blurDataUrl, tmdbImageUrl } from "@/lib/images";
import { cn } from "@/lib/utils";
import type { TasteCardFilm } from "@/lib/api";

/** A single poster the visitor can toggle as "seen". */
export function TasteCard({
  film,
  selected,
  onToggle,
}: {
  film: TasteCardFilm;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      aria-label={`${selected ? "Unmark" : "Mark"} ${film.title} as seen`}
      className={cn(
        "group relative overflow-hidden border bg-[#09090f] text-left shadow-[0_22px_70px_rgba(0,0,0,0.34)] transition duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c] focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090f]",
        selected
          ? "border-[#e8453c] shadow-[0_0_0_1px_rgba(232,69,60,0.28),0_24px_80px_rgba(232,69,60,0.2)]"
          : "border-white/10 hover:-translate-y-1 hover:border-white/30",
      )}
      style={{ aspectRatio: "2/3" }}
    >
      {film.posterUrl ? (
        <Image
          src={tmdbImageUrl(film.posterUrl, "w342") ?? film.posterUrl}
          alt={`${film.title} poster`}
          fill
          sizes="(max-width: 640px) 45vw, 18vw"
          placeholder="blur"
          blurDataURL={blurDataUrl(film.posterColor)}
          className={cn(
            "object-cover transition duration-300",
            selected ? "scale-[1.03] saturate-[0.85]" : "group-hover:scale-[1.035]",
          )}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-[#11111b] p-4 text-center">
          <span className="font-[family-name:var(--font-display)] text-lg font-semibold leading-tight text-[#F5F5F0]">
            {film.title}
          </span>
        </div>
      )}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 transition",
          selected ? "bg-[#09090f]/30" : "bg-transparent",
        )}
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/55 to-transparent px-3 pb-3 pt-14">
        <p className="line-clamp-2 font-[family-name:var(--font-display)] text-sm font-semibold leading-tight text-white">
          {film.title}
        </p>
      </div>
      {/* Always-visible toggle. Unselected reads as an empty checkbox (solid
          ring, no reliance on hover — critical on touch); selected fills red
          with a check. The drop shadow keeps it legible over bright posters. */}
      <span
        className={cn(
          "absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full border-2 shadow-[0_2px_10px_rgba(0,0,0,0.6)] backdrop-blur transition",
          selected
            ? "border-[#e8453c] bg-[#e8453c] text-white scale-110"
            : "border-white/85 bg-black/30 text-transparent",
        )}
      >
        <Check className="h-4 w-4" aria-hidden />
      </span>
    </button>
  );
}
