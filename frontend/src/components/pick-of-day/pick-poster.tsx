import Image from "next/image";
import type { PickOfDayFilm } from "@/lib/api";
import { tmdbImageUrl } from "@/lib/images";
import { cn } from "@/lib/utils";

/** The pick card's poster, with a placeholder when the film has no poster. */
export function PickPoster({
  film,
  imageBlur,
  hasBackdrop,
}: {
  film: PickOfDayFilm;
  imageBlur: string;
  hasBackdrop: boolean;
}) {
  return (
    <div
      className={cn(
        "relative mx-auto shrink-0 sm:mx-0 rounded-xl overflow-hidden border border-zinc-700 aspect-[2/3]",
        "w-32 sm:w-36",
        hasBackdrop && "shadow-xl shadow-black/60",
      )}
    >
      {film.posterUrl ? (
        <Image
          src={tmdbImageUrl(film.posterUrl, "w342") ?? film.posterUrl}
          alt={`${film.title} poster`}
          fill
          sizes="(max-width: 640px) 128px, 144px"
          placeholder="blur"
          blurDataURL={imageBlur}
          className="object-cover"
          priority
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-800">
          <span className="text-xs text-zinc-600">No poster</span>
        </div>
      )}
    </div>
  );
}
