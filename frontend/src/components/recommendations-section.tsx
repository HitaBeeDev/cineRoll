"use client";

import { Bookmark, EyeOff } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AuthDialog } from "@/components/auth/auth-dialog";
import { AUTH_GATE_TITLE, useFilmActions } from "@/hooks/useFilmActions";
import { blurDataUrl, tmdbImageUrl } from "@/lib/images";
import { cn } from "@/lib/utils";

export type Recommendation = {
  id: string;
  slug: string;
  title: string;
  year: number;
  posterUrl: string | null;
  genres: string[];
  director: string | null;
  imdbRating: number | null;
  rtScore: number | null;
  score: number;
  reason: string;
};

/**
 * Personalized, taste-based recommendations with their explanations. Distinct
 * from the global Pick of the Day (one editorial pick for everyone) — this is
 * a per-user set scored from the viewer's own signals, each card carrying the
 * reason it was chosen. Cards are functional, not decorative: hovering a poster
 * reveals save / not-interested actions, and hiding one drops it from the grid.
 */
export function RecommendationsSection({
  recommendations,
  coldStart,
}: {
  recommendations: Recommendation[];
  coldStart: boolean;
}) {
  // Hiding a rec removes it from view immediately; the backend also stops
  // suggesting it, so there's no reason to keep it on screen.
  const [hiddenIds, setHiddenIds] = useState<ReadonlySet<string>>(new Set());
  const visible = recommendations.filter((rec) => !hiddenIds.has(rec.id));

  function hide(id: string) {
    setHiddenIds((prev) => new Set(prev).add(id));
  }

  return (
    <section className="mt-16">
      <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[#F5F5F0]">
        Recommended for you
      </h2>
      <p className="mt-2 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.2em] text-[#9a9aac]">
        {coldStart
          ? "Early recommendations — rate more films to improve your picks"
          : "Picked from your taste · not the global Pick of the Day"}
      </p>

      {visible.length > 0 ? (
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
          {visible.map((rec) => (
            <RecommendationCard key={rec.id} rec={rec} onHidden={() => hide(rec.id)} />
          ))}
        </div>
      ) : (
        <p className="mt-6 font-[family-name:var(--font-geist-mono)] text-[12px] leading-relaxed text-[#888899]">
          That’s everything for now — roll and rate a few films to refresh your picks.
        </p>
      )}
    </section>
  );
}

function RecommendationCard({
  rec,
  onHidden,
}: {
  rec: Recommendation;
  onHidden: () => void;
}) {
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";
  const pathname = usePathname();
  // Fade the poster in on decode so external TMDB images don't pop in against
  // the placeholder on slow connections.
  const [posterLoaded, setPosterLoaded] = useState(false);

  const {
    inWatchlist,
    watchlistPending,
    toggleWatchlist,
    pending,
    saveDecision,
    authPrompt,
    closeAuthPrompt,
  } = useFilmActions({
    filmId: rec.id,
    filmTitle: rec.title,
    isAuthenticated,
    source: "recommendations",
    onNotInterested: onHidden,
  });

  return (
    <div className="flex flex-col">
      <div className="group relative aspect-[2/3] w-full overflow-hidden rounded-lg border border-[#1e1e2a] bg-[#111120] transition-colors hover:border-[#e8453c]/60">
        {rec.posterUrl ? (
          <Image
            src={tmdbImageUrl(rec.posterUrl, "w342") ?? rec.posterUrl}
            alt={rec.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            placeholder="blur"
            blurDataURL={blurDataUrl(null)}
            onLoad={() => setPosterLoaded(true)}
            // A cache-hit can finish before React attaches onLoad; catch that
            // here so the poster never gets stuck invisible.
            ref={(node) => {
              if (node?.complete) setPosterLoaded(true);
            }}
            className={cn(
              "object-cover transition-all duration-500 group-hover:scale-[1.03]",
              posterLoaded ? "opacity-100" : "opacity-0",
            )}
          />
        ) : (
          <div className="flex h-full items-center justify-center px-3 text-center font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-widest text-[#888899]">
            {rec.title}
          </div>
        )}

        {/* Stretched link: the whole poster navigates to the film, sitting
            beneath the action bar so button clicks win. */}
        <Link
          href={`/film/${rec.slug}`}
          aria-label={rec.title}
          className="absolute inset-0 z-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#e8453c]"
        />

        {/* Hover/focus action bar. The container ignores pointer events so it
            never blocks the stretched link; only the buttons capture clicks. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-center justify-end gap-2 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-2.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
          <ActionButton
            label={inWatchlist ? "Saved to watchlist" : "Save to watchlist"}
            active={inWatchlist}
            disabled={watchlistPending}
            onClick={() => void toggleWatchlist()}
            icon={
              <Bookmark
                className="h-4 w-4"
                fill={inWatchlist ? "currentColor" : "none"}
                aria-hidden
              />
            }
          />
          <ActionButton
            label="Not interested"
            disabled={pending}
            onClick={() => void saveDecision("not-interested", true)}
            icon={<EyeOff className="h-4 w-4" aria-hidden />}
          />
        </div>
      </div>

      <h3 className="mt-3 line-clamp-1 font-[family-name:var(--font-display)] text-sm font-bold text-[#F5F5F0]">
        {rec.title}
      </h3>
      <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.15em] text-[#7a7a8c]">
        {rec.year}
      </p>
      {/* Reserve two lines so uneven reason lengths don't stagger the grid. */}
      <p className="mt-1.5 line-clamp-2 min-h-[2.5rem] font-[family-name:var(--font-geist-mono)] text-[11px] leading-relaxed text-[#888899]">
        {rec.reason}
      </p>

      <AuthDialog
        open={authPrompt !== null}
        onOpenChange={(open) => {
          if (!open) closeAuthPrompt();
        }}
        callbackUrl={pathname}
        title={authPrompt ? AUTH_GATE_TITLE[authPrompt] : undefined}
      />
    </div>
  );
}

function ActionButton({
  label,
  icon,
  onClick,
  disabled,
  active,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "pointer-events-auto flex h-8 w-8 items-center justify-center rounded-md border backdrop-blur-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c] disabled:cursor-not-allowed disabled:opacity-50",
        active
          ? "border-[#e8453c]/60 bg-[#e8453c]/25 text-white"
          : "border-white/25 bg-black/45 text-white/80 hover:border-white/45 hover:text-white",
      )}
    >
      {icon}
    </button>
  );
}
