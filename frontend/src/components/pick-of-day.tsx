"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  CalendarDays,
  Star,
  Trophy,
  Clock,
  ExternalLink,
  RefreshCw,
  Clapperboard,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchPickOfDay, type PickOfDayFilm } from "@/lib/api";
import { trackEvent } from "@/lib/analytics";
import { formatRuntime } from "@/lib/format";
import { cn } from "@/lib/utils";

type Status = "loading" | "success" | "empty" | "error";

export function PickOfDay() {
  const shouldReduceMotion = useReducedMotion();
  const [film, setFilm] = useState<PickOfDayFilm | null>(null);
  const [status, setStatus] = useState<Status>("loading");

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const result = await fetchPickOfDay();
      if (!result) {
        setFilm(null);
        setStatus("empty");
        return;
      }
      setFilm(result);
      setStatus("success");
    } catch {
      setFilm(null);
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(id);
  }, [load]);

  return (
    <section aria-labelledby="pod-heading" className="w-full flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <CalendarDays className="h-4 w-4 text-amber-400" aria-hidden />
        <h2
          id="pod-heading"
          className="text-xs font-semibold tracking-widest uppercase text-zinc-400"
        >
          Pick of the Day
        </h2>
      </div>

      {status === "loading" && <PickOfDaySkeleton />}

      {status === "error" && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-10 text-center">
          <p className="text-sm text-zinc-500">Couldn&apos;t load today&apos;s pick.</p>
          <Button variant="ghost" size="sm" onClick={() => void load()} className="gap-2">
            <RefreshCw className="h-3.5 w-3.5" aria-hidden />
            Try again
          </Button>
        </div>
      )}

      {status === "empty" && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-zinc-800 p-10 text-center">
          <Clapperboard className="h-8 w-8 text-zinc-700" aria-hidden />
          <p className="text-sm text-zinc-500">No pick today, roll to discover!</p>
        </div>
      )}

      {status === "success" && film && (
        <motion.div
          layout={!shouldReduceMotion}
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.4, ease: "easeOut" }}
        >
          <PickOfDayCard film={film} />
        </motion.div>
      )}
    </section>
  );
}

function PickOfDayCard({ film }: { film: PickOfDayFilm }) {
  const pickDate = film.pickOfDayDate
    ? new Date(film.pickOfDayDate).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
      })
    : null;

  const hasBackdrop = Boolean(film.backdropUrl);
  const whyPicked = getWhyPicked(film);
  const runtime = formatRuntime(film.runtime);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-amber-400/20 bg-zinc-900",
        "shadow-lg shadow-amber-900/10"
      )}
    >
      {/* Backdrop banner */}
      {hasBackdrop && (
        <div className="relative h-28 sm:h-36 w-full overflow-hidden" aria-hidden>
          <Image
            src={film.backdropUrl!}
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-center brightness-50"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-zinc-900" />
        </div>
      )}

      <div
        className={cn(
          "flex flex-col sm:flex-row gap-5 p-5 sm:p-6",
          hasBackdrop && "relative -mt-12 sm:-mt-16"
        )}
      >
        {/* Poster */}
        <div
          className={cn(
            "relative mx-auto shrink-0 sm:mx-0 rounded-xl overflow-hidden border border-zinc-700 aspect-[2/3]",
            "w-32 sm:w-36",
            hasBackdrop && "shadow-xl shadow-black/60"
          )}
        >
          {film.posterUrl ? (
            <Image
              src={film.posterUrl}
              alt={`${film.title} poster`}
              fill
              sizes="(max-width: 640px) 128px, 144px"
              className="object-cover"
              priority
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-800">
              <span className="text-xs text-zinc-600">No poster</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-3 min-w-0 flex-1">
          {pickDate && (
            <p className="text-xs font-medium tracking-wide uppercase text-amber-400/70">
              Staff pick · {pickDate}
            </p>
          )}

          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-zinc-50 leading-tight">
              {film.title}
            </h3>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm text-zinc-400">
              <span>{film.year}</span>
              {runtime && (
                <>
                  <span className="text-zinc-700" aria-hidden>·</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" aria-hidden />
                    {runtime}
                  </span>
                </>
              )}
              {film.director && (
                <>
                  <span className="text-zinc-700" aria-hidden>·</span>
                  <span>dir. {film.director}</span>
                </>
              )}
            </div>
          </div>

          {/* Ratings + genres */}
          <div className="flex flex-wrap items-center gap-2">
            {film.imdbRating != null ? (
              <span className="flex items-center gap-1 text-sm font-semibold text-amber-400">
                <Star className="h-4 w-4 fill-amber-400" aria-hidden />
                {film.imdbRating.toFixed(1)}
              </span>
            ) : (
              <span className="flex items-center gap-1 text-sm font-semibold text-amber-400/40">
                <Star className="h-4 w-4 fill-amber-400/40" aria-hidden />
                No IMDb
              </span>
            )}
            {film.rtScore != null ? (
              <span className="text-xs font-medium text-zinc-300 tabular-nums">
                🍅 {film.rtScore}%
              </span>
            ) : (
              <span className="text-xs font-medium text-zinc-500/60 tabular-nums">
                🍅 No RT Score
              </span>
            )}
            {film.genres.slice(0, 3).map((g) => (
              <span
                key={g}
                className="rounded-full border border-zinc-700 px-2.5 py-0.5 text-xs text-zinc-300"
              >
                {g}
              </span>
            ))}
          </div>

          {/* Plot */}
          {film.plot && (
            <p className="text-sm text-zinc-400 leading-relaxed line-clamp-3 sm:line-clamp-4">
              {film.plot}
            </p>
          )}

          <div className="flex items-start gap-2 rounded-lg border border-amber-400/10 bg-amber-400/5 px-3 py-2">
            <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" aria-hidden />
            <div className="flex flex-col gap-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-400/80">
                Why this pick
              </p>
              <p className="text-xs text-zinc-300 leading-snug">{whyPicked}</p>
            </div>
          </div>

          {(film.oscarWins > 0 || film.oscarNominations > 0) && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-400/10 bg-amber-400/5 px-3 py-2">
              <Trophy className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" aria-hidden />
              <p className="text-xs text-zinc-300 leading-snug">
                {film.oscarWins > 0 && (
                  <span className="font-semibold text-amber-400">
                    {film.oscarWins} Academy Award {film.oscarWins === 1 ? "win" : "wins"}
                  </span>
                )}
                {film.oscarWins > 0 &&
                  film.oscarNominations > film.oscarWins &&
                  ` across ${film.oscarNominations} nominations`}
                {film.oscarWins === 0 &&
                  film.oscarNominations > 0 &&
                  `Nominated for ${film.oscarNominations} Academy Award${film.oscarNominations > 1 ? "s" : ""}`}
              </p>
            </div>
          )}

          <Link
            href={`/film/${film.slug}`}
            onClick={() => {
              trackEvent({
                type: "pick_of_day_click",
                filmId: film.id,
                context: {
                  source: "pick_of_day_card",
                  slug: film.slug,
                },
              });
            }}
            className={cn(
              "inline-flex items-center gap-1.5 self-start mt-auto pt-1",
              "text-xs font-medium text-amber-400 hover:text-amber-300 transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded"
            )}
          >
            View full details
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>
      </div>
    </div>
  );
}

function getWhyPicked(film: PickOfDayFilm): string {
  if (film.oscarWins > 0) {
    return `${film.title} earned ${film.oscarWins} Academy Award ${film.oscarWins === 1 ? "win" : "wins"}, making it a strong spotlight from the awards shelf.`;
  }

  if (film.oscarNominations > 0) {
    return `${film.title} was recognized with ${film.oscarNominations} Academy Award ${film.oscarNominations === 1 ? "nomination" : "nominations"}, so today's roll starts with proven awards pedigree.`;
  }

  if (film.imdbRating != null && film.imdbRating >= 8) {
    return `${film.title} stands out with a ${film.imdbRating.toFixed(1)} IMDb rating and a place in CineRoll's curated film pool.`;
  }

  if (film.rtScore != null && film.rtScore >= 85) {
    return `${film.title} brings strong critical reception with an ${film.rtScore}% Rotten Tomatoes score.`;
  }

  const primaryGenre = film.genres[0];
  if (primaryGenre) {
    return `${film.title} is today's ${primaryGenre.toLowerCase()} spotlight from CineRoll's curated award-film collection.`;
  }

  return `${film.title} is today's spotlight from CineRoll's curated award-film collection.`;
}

function PickOfDaySkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
      {/* Backdrop strip skeleton */}
      <Skeleton className="h-28 sm:h-36 w-full rounded-none" />
      <div className="relative -mt-12 sm:-mt-16 flex flex-col sm:flex-row gap-5 p-5 sm:p-6">
        <Skeleton className="mx-auto w-32 shrink-0 sm:mx-0 sm:w-36 aspect-[2/3] rounded-xl" />
        <div className="flex flex-col gap-3 flex-1">
          <Skeleton className="h-3 w-28 rounded-full" />
          <Skeleton className="h-7 w-3/4 rounded-lg" />
          <Skeleton className="h-4 w-1/2 rounded-lg" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-10 rounded-full" />
            <Skeleton className="h-5 w-12 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>
          <Skeleton className="h-4 w-full rounded-lg mt-1" />
          <Skeleton className="h-4 w-5/6 rounded-lg" />
          <Skeleton className="h-4 w-4/5 rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg mt-1" />
        </div>
      </div>
    </div>
  );
}
