"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, Dices, Film, X } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import type { RollFilm } from "@/lib/api";
import {
  ROLL_HISTORY_STORAGE_KEY,
  MAX_ROLL_HISTORY_ITEMS,
} from "@/lib/home-storage";

export function RollHistoryDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [history, setHistory] = useState<RollFilm[]>([]);
  const visibleHistory = history.slice(0, MAX_ROLL_HISTORY_ITEMS);

  useEffect(() => {
    if (!open) return;

    const id = window.setTimeout(() => {
      try {
        const parsed = JSON.parse(
          window.sessionStorage.getItem(ROLL_HISTORY_STORAGE_KEY) ?? "[]",
        ) as RollFilm[];
        setHistory(parsed.slice(0, MAX_ROLL_HISTORY_ITEMS));
      } catch {
        setHistory([]);
      }
    }, 0);

    return () => window.clearTimeout(id);
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.button
            type="button"
            aria-label="Close history"
            className="fixed inset-0 z-[80] bg-black/75 backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
          />

          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="roll-history-title"
            className="fixed right-0 top-0 z-[90] flex h-screen w-full max-w-[440px] flex-col overflow-hidden bg-[#05050a] text-[#F5F5F0]"
            style={{
              boxShadow:
                "-1px 0 0 rgba(232,69,60,0.12), -40px 0 120px rgba(0,0,0,0.98)",
            }}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 340, damping: 36 }}
          >
            {/* Atmospheric glows */}
            <div
              className="pointer-events-none absolute -left-24 -top-24 z-0 h-72 w-72 rounded-full bg-[#e8453c] opacity-[0.09] blur-[80px]"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute bottom-0 right-0 z-0 h-56 w-56 rounded-full bg-[#D4AF37] opacity-[0.04] blur-[90px]"
              aria-hidden
            />

            {/* Film strip — top */}
            <div
              className="relative z-20 flex shrink-0 items-center gap-[3px] bg-[#020206] px-3 py-[6px]"
              aria-hidden
            >
              {Array.from({ length: 34 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[7px] w-[6px] shrink-0 rounded-[1.5px] bg-[#0e0e18]"
                />
              ))}
            </div>

            {/* Header — compact so the list (the point of the drawer) leads */}
            <header className="relative z-10 shrink-0 px-6 pt-6 pb-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="block h-px w-6 bg-[#e8453c]" aria-hidden />
                  <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.34em] text-[#e8453c]">
                    Session Reel
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close history"
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                    "border border-[#1a1a28] text-[#888899]",
                    "transition-all duration-150",
                    "hover:border-[#e8453c]/50 hover:bg-[#e8453c]/8 hover:text-[#e8453c]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]",
                  )}
                >
                  <X className="h-3.5 w-3.5" aria-hidden />
                </button>
              </div>

              <div className="mt-3 flex items-baseline justify-between gap-3">
                <h2
                  id="roll-history-title"
                  className="font-[family-name:var(--font-display)] text-[2rem] font-bold leading-none tracking-tight"
                >
                  Roll <span className="text-[#e8453c]">History</span>
                </h2>
                {visibleHistory.length > 0 && (
                  <span className="shrink-0 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.18em] text-[#888899]">
                    <span className="font-bold text-[#F5F5F0]">{visibleHistory.length}</span>
                    {" / "}
                    {MAX_ROLL_HISTORY_ITEMS}
                  </span>
                )}
              </div>
              <p className="mt-1.5 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.2em] text-[#5c5c70]">
                This tab only
              </p>
            </header>

            {/* Scroll area */}
            <div className="relative z-10 flex-1 overflow-y-auto pt-2 pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {visibleHistory.length === 0 ? (
                /* Empty state */
                <div className="flex flex-col items-center justify-center min-h-[300px] px-8 text-center">
                  <div className="relative mb-6">
                    <div className="h-[72px] w-[72px] rounded-full border border-[#e8453c]/15 bg-[#e8453c]/5 flex items-center justify-center shadow-[0_0_50px_rgba(232,69,60,0.1)]">
                      <Dices
                        className="h-7 w-7 text-[#e8453c]/40"
                        aria-hidden
                      />
                    </div>
                    <div className="absolute inset-0 rounded-full border border-[#e8453c]/6 scale-[1.35]" />
                  </div>
                  <p className="font-[family-name:var(--font-display)] text-[1.9rem] font-bold leading-[0.93] tracking-tight text-[#F5F5F0]">
                    Your reel
                    <br />
                    is empty.
                  </p>
                  <p className="mt-3 text-xs leading-6 text-[#888899] max-w-[22ch]">
                    Roll a film — it shows up here as a fast, clickable trail.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-1.5 px-4">
                  {visibleHistory.map((film, index) => {
                    const meta = [
                      film.year,
                      film.genres?.[0],
                      film.imdbRating != null ? `★ ${film.imdbRating.toFixed(1)}` : null,
                    ]
                      .filter(Boolean)
                      .join("  ·  ");
                    return (
                      <Link
                        key={film.id}
                        href={`/film/${film.slug}`}
                        onClick={() => {
                          trackEvent({
                            type: "film_click",
                            filmId: film.id,
                            context: {
                              source: "roll_history",
                              slug: film.slug,
                            },
                          });
                          onClose();
                        }}
                        className={cn(
                          "group relative flex items-center gap-3 rounded-lg px-3 py-2.5",
                          "border border-[#17171f] bg-[#0a0a14]",
                          "transition-all duration-200",
                          "hover:border-[#e8453c]/35 hover:bg-[#0e0e1a]",
                          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#e8453c] focus-visible:ring-inset",
                        )}
                      >
                        {/* Roll index — chronological, so the number carries real order */}
                        <span className="w-5 shrink-0 text-center font-[family-name:var(--font-geist-mono)] text-[11px] font-bold tabular-nums text-[#3c3c54] transition-colors group-hover:text-[#e8453c]/75">
                          {String(index + 1).padStart(2, "0")}
                        </span>

                        {/* Poster */}
                        <div className="relative h-[56px] w-[38px] shrink-0 overflow-hidden rounded">
                          {film.posterUrl ? (
                            <Image
                              src={film.posterUrl}
                              alt=""
                              fill
                              sizes="38px"
                              className="object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-[#0f0f1c]">
                              <Film className="h-3.5 w-3.5 text-[#2a2a3e]" aria-hidden />
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-1 font-[family-name:var(--font-display)] text-[1.02rem] font-bold leading-tight text-[#F5F5F0] transition-colors group-hover:text-white">
                            {film.title}
                          </p>
                          <p className="mt-1 truncate font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.14em] text-[#7a7a90]">
                            {meta}
                          </p>
                        </div>

                        {/* Click affordance */}
                        <ArrowUpRight
                          className="h-4 w-4 shrink-0 text-[#2a2a3e] transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#e8453c]"
                          aria-hidden
                        />
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Film strip — bottom */}
            <div
              className="relative z-20 flex shrink-0 items-center gap-[3px] bg-[#020206] px-3 py-[6px]"
              aria-hidden
            >
              {Array.from({ length: 34 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[7px] w-[6px] shrink-0 rounded-[1.5px] bg-[#0e0e18]"
                />
              ))}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
