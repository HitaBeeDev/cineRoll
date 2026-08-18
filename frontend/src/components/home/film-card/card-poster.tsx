import Image from "next/image";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { FilmLink } from "@/components/film-link";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils/cn";
import { tmdbImageUrl } from "@/lib/images/tmdb-image-url";
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
  compact = false,
}: {
  film: RollFilm;
  posterBlur: string;
  onEngage?: (() => void) | undefined;
  /** Dialog sizing — see the width note below. */
  compact?: boolean;
}) {
  const shouldReduceMotion = useReducedMotion();
  const { posterUrl, backdropUrl } = film;
  // The sheen tracks the pointer exactly (no smoothing on x — a highlight that
  // lags the cursor reads as a bug), while its opacity is sprung so the light
  // arrives and leaves rather than switching.
  const sheenX = useMotionValue(0);
  const sheenOpacity = useSpring(0, { stiffness: 320, damping: 32 });

  return (
    <FilmLink
      slug={film.slug}
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
      // Sized down with the identity column beside it: once recognition became
      // one line instead of a panel, a 180px poster was the only thing holding
      // the header at full height, with dead column beside it.
      className={cn(
        "group relative z-20 w-[38%] shrink-0 self-stretch rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900",
        // At 2/3 the width IS the height, so this number sets how much of the
        // panel the poster takes: 150px of poster is 225px of header, which was
        // over half the old dialog's content budget before a word of the film
        // had been read. 120px is 180px tall — the artwork is the highest-value
        // thing in a discovery interface and 100px was underselling it, while
        // the identity column beside it is still what sets the band's height.
        // Hovering blows it up to 1.5x, so detail stays a hover away.
        compact ? "max-w-[120px]" : "max-w-[150px]",
      )}
      style={{ aspectRatio: "2/3" }}
    >
      <motion.div
        className="relative h-full w-full origin-top-left overflow-hidden rounded-lg shadow-[0_16px_44px_rgba(0,0,0,0.6)] ring-1 ring-white/5 group-hover:shadow-[0_30px_70px_rgba(0,0,0,0.75)]"
        onPointerMove={(event) => {
          if (shouldReduceMotion || event.pointerType !== "mouse") return;
          const bounds = event.currentTarget.getBoundingClientRect();
          if (bounds.width === 0) return;
          const across = (event.clientX - bounds.left) / bounds.width;
          // Runs the highlight from just off one edge to just off the other.
          sheenX.set(across * bounds.width * 1.8 - bounds.width * 0.4);
          sheenOpacity.set(1);
        }}
        onPointerLeave={() => sheenOpacity.set(0)}
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
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-ink-750 to-ink-950">
            <span className="font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-widest text-fg-muted">
              No image
            </span>
          </div>
        )}

        {/* The light passing over the artwork. Sits above the image and below
            nothing else, and never takes a pointer event — the whole poster is
            one link. */}
        {!shouldReduceMotion && (
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-y-[-25%] left-0 w-[38%] -skew-x-12 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.38),transparent)]"
            style={{ x: sheenX, opacity: sheenOpacity }}
          />
        )}
      </motion.div>
    </FilmLink>
  );
}
