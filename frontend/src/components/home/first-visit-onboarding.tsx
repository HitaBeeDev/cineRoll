"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TasteCardFilm } from "@/lib/api";
import {
  createTasteSeed,
  savePendingWatchedFilms,
  saveTasteSeed,
  type TasteSeed,
} from "@/lib/home-storage";

export function FirstVisitOnboarding({
  tasteCards,
  tasteCardsStatus,
  onRetryTasteCards,
  onContinue,
}: {
  tasteCards: TasteCardFilm[];
  tasteCardsStatus: "idle" | "loading" | "ready" | "error";
  onRetryTasteCards: () => void;
  onContinue: (seed: TasteSeed | null) => void;
}) {
  const [selectedSeenIds, setSelectedSeenIds] = useState<Set<string>>(
    new Set(),
  );
  const selectedSeenCount = selectedSeenIds.size;

  function toggleSeen(filmId: string) {
    setSelectedSeenIds((current) => {
      const next = new Set(current);
      if (next.has(filmId)) {
        next.delete(filmId);
      } else {
        next.add(filmId);
      }
      return next;
    });
  }

  function completeOnboarding() {
    const selectedFilmIds = [...selectedSeenIds];
    const seed = createTasteSeed(tasteCards, selectedFilmIds);
    savePendingWatchedFilms(selectedFilmIds);
    saveTasteSeed(seed);
    onContinue(seed);
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#09090f] text-[#F5F5F0]">
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_72%_28%,rgba(232,69,60,0.16),transparent_32%),linear-gradient(135deg,#09090f_0%,#11111b_48%,#07070c_100%)]" />
      <div className="pointer-events-none absolute inset-0 z-0 opacity-[0.045] [background-image:linear-gradient(rgba(245,245,240,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(245,245,240,0.5)_1px,transparent_1px)] [background-size:56px_56px]" />

      <header className="relative z-20 flex h-16 shrink-0 items-center justify-between px-5 sm:px-8 lg:px-10">
        <Link
          href="/"
          className="font-[family-name:var(--font-geist-mono)] text-[1.1rem] font-bold uppercase tracking-[0.15em] text-[#e8453c]"
        >
          Cine·Roll
        </Link>
        <button
          type="button"
          onClick={completeOnboarding}
          className="font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.28em] text-[#888899] transition hover:text-[#F5F5F0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c] focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090f]"
        >
          Skip
        </button>
      </header>

      <main className="relative z-20 grid flex-1 grid-cols-1 gap-8 px-5 pb-8 pt-4 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-10 lg:px-10 lg:pb-10 lg:pt-0">
        <section className="flex max-w-xl flex-col items-start">
          <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.35em] text-[#D4AF37]">
            {"// Taste check"}
          </p>

          <h1 className="mt-5 font-[family-name:var(--font-display)] text-[clamp(3.15rem,7vw,6rem)] font-bold leading-[0.9] tracking-tight">
            Which of these have you seen?
          </h1>

          <p className="mt-5 max-w-md text-base leading-7 text-[#a6a6b5]">
            Pick the films you already know. CineRoll uses this first signal to
            shape better rolls after you enter.
          </p>

          <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <button
              type="button"
              onClick={completeOnboarding}
              className={cn(
                "min-w-[180px] bg-[#F5F5F0] px-7 py-4 text-[#09090f]",
                "font-[family-name:var(--font-geist-mono)] text-sm font-bold uppercase tracking-[0.2em]",
                "transition hover:bg-white hover:shadow-[0_18px_50px_rgba(245,245,240,0.16)]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c] focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090f]",
              )}
            >
              Done{selectedSeenCount > 0 ? ` (${selectedSeenCount})` : ""}
            </button>
            <button
              type="button"
              onClick={completeOnboarding}
              className={cn(
                "min-w-[180px] border border-[#2a2a3e] bg-[#11111b]/70 px-7 py-4 text-[#888899]",
                "font-[family-name:var(--font-geist-mono)] text-sm font-bold uppercase tracking-[0.2em]",
                "transition hover:border-[#4b4b60] hover:text-[#F5F5F0]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c] focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090f]",
              )}
            >
              Skip
            </button>
          </div>

          <div className="mt-6 flex items-center gap-3 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.22em] text-[#888899]">
            <span className="h-px w-9 bg-[#e8453c]/55" />
            {selectedSeenCount === 0
              ? "Tap any poster"
              : `${selectedSeenCount} selected`}
          </div>
        </section>

        <section className="min-h-0">
          <div className="mx-auto grid w-full max-w-5xl grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {tasteCardsStatus === "error" ? (
              <div className="col-span-2 flex min-h-[420px] items-center justify-center border border-dashed border-[#2a2a3e] bg-[#080810]/80 sm:col-span-4">
                <div className="text-center">
                  <p className="text-sm text-[#F5F5F0]">
                    Could not load taste cards.
                  </p>
                  <button
                    type="button"
                    onClick={onRetryTasteCards}
                    className="mt-2 font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-widest text-[#e8453c] transition hover:text-[#F5F5F0]"
                  >
                    Try again
                  </button>
                </div>
              </div>
            ) : tasteCardsStatus === "ready" && tasteCards.length > 0 ? (
              tasteCards.slice(0, 8).map((film) => {
                const selected = selectedSeenIds.has(film.id);
                return (
                  <button
                    key={film.id}
                    type="button"
                    onClick={() => toggleSeen(film.id)}
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
                        src={film.posterUrl}
                        alt={`${film.title} poster`}
                        fill
                        sizes="(max-width: 640px) 45vw, 18vw"
                        className={cn(
                          "object-cover transition duration-300",
                          selected
                            ? "scale-[1.03] saturate-[0.85]"
                            : "group-hover:scale-[1.035]",
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
                    <span
                      className={cn(
                        "absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border backdrop-blur transition",
                        selected
                          ? "border-[#e8453c] bg-[#e8453c] text-white"
                          : "border-white/25 bg-black/35 text-white/0 group-hover:text-white/80",
                      )}
                    >
                      <Check className="h-4 w-4" aria-hidden />
                    </span>
                  </button>
                );
              })
            ) : (
              Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse border border-white/10 bg-[#11111b]/80"
                  style={{ aspectRatio: "2/3" }}
                />
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
