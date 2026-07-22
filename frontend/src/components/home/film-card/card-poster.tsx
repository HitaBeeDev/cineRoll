import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { trackEvent } from "@/lib/analytics";
import { tmdbImageUrl } from "@/lib/images";
import type { RollFilm } from "@/lib/api";

/**
 * The poster anchor on the left of the verdict header. Links to the film's
 * detail page, zoom-settles into focus a beat after the card lands, then scales
 * up on hover/focus. Falls back to the backdrop, then a placeholder.
 */
export function CardPoster({
  film,
  posterBlur,
  onEngage,
}: {
  film: RollFilm;
  posterBlur: string;
  onEngage?: (() => void) | undefined;
}) {
  const shouldReduceMotion = useReducedMotion();
  const { posterUrl, backdropUrl } = film;

  return (
    <Link
      href={`/film/${film.slug}`}
      onClick={() => {
        onEngage?.();
        trackEvent({
          type: "film_click",
          filmId: film.id,
          context: { source: "roll_card_poster", slug: film.slug },
        });
      }}
      aria-label={`View details for ${film.title}`}
      // self-stretch lets the poster grow to match a tall identity column (long
      // titles) instead of leaving dead space below it; the 2/3 aspect ratio
      // acts as the minimum height when the column is short.
      className="group relative z-20 w-[42%] max-w-[180px] shrink-0 self-stretch rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c] focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090f]"
      style={{ aspectRatio: "2/3" }}
    >
      <motion.div
        className="relative h-full w-full origin-top-left overflow-hidden rounded-lg shadow-[0_16px_44px_rgba(0,0,0,0.6)] ring-1 ring-white/5 group-hover:shadow-[0_30px_70px_rgba(0,0,0,0.75)]"
        initial={shouldReduceMotion ? false : { scale: 1.04, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        {...(shouldReduceMotion
          ? {}
          : {
              whileHover: {
                scale: 1.5,
                transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
              },
            })}
        // One smooth eased tween governs entrance + hover-out so the poster
        // grows and shrinks identically — no springy snap-back.
        transition={
          shouldReduceMotion
            ? { duration: 0 }
            : { duration: 0.55, ease: [0.16, 1, 0.3, 1] }
        }
      >
        {posterUrl ? (
          <Image
            src={tmdbImageUrl(posterUrl, "w500") ?? posterUrl}
            alt={film.title}
            fill
            sizes="(max-width: 1024px) 45vw, 200px"
            placeholder="blur"
            blurDataURL={posterBlur}
            className="object-cover"
            priority
          />
        ) : backdropUrl ? (
          <Image
            src={tmdbImageUrl(backdropUrl, "w780") ?? backdropUrl}
            alt={film.title}
            fill
            sizes="(max-width: 1024px) 45vw, 200px"
            placeholder="blur"
            blurDataURL={posterBlur}
            className="object-cover"
            priority
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#1a1a2e] to-[#0a0a18]">
            <span className="font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-widest text-[#888899]">
              No image
            </span>
          </div>
        )}
      </motion.div>
    </Link>
  );
}
