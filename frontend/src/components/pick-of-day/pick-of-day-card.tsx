import Image from "next/image";
import type { PickOfDayFilm } from "@/lib/api";
import { blurDataUrl, tmdbImageUrl } from "@/lib/images";
import { cn } from "@/lib/utils";
import { PickPoster } from "@/components/pick-of-day/pick-poster";
import { PickOfDayInfo } from "@/components/pick-of-day/pick-of-day-info";

/** The pick-of-day card: an optional backdrop banner over a poster + info row. */
export function PickOfDayCard({ film }: { film: PickOfDayFilm }) {
  const hasBackdrop = Boolean(film.backdropUrl);
  const imageBlur = blurDataUrl(film.posterColor);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-amber-400/20 bg-zinc-900",
        "shadow-lg shadow-amber-900/10",
      )}
    >
      {hasBackdrop && (
        <div className="relative h-28 sm:h-36 w-full overflow-hidden" aria-hidden>
          <Image
            src={tmdbImageUrl(film.backdropUrl, "w780") ?? film.backdropUrl!}
            alt=""
            fill
            sizes="100vw"
            placeholder="blur"
            blurDataURL={imageBlur}
            className="object-cover object-center brightness-50"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-zinc-900" />
        </div>
      )}

      <div
        className={cn(
          "flex flex-col sm:flex-row gap-5 p-5 sm:p-6",
          hasBackdrop && "relative -mt-12 sm:-mt-16",
        )}
      >
        <PickPoster film={film} imageBlur={imageBlur} hasBackdrop={hasBackdrop} />
        <PickOfDayInfo film={film} />
      </div>
    </div>
  );
}
