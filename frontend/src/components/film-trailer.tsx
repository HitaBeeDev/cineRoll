"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, Play, PlayCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

type FilmTrailerProps = {
  title: string;
  trailerUrl: string;
  youtubeId: string | null;
  thumbnailUrl: string | null;
};

export function FilmTrailer({
  title,
  trailerUrl,
  youtubeId,
  thumbnailUrl,
}: FilmTrailerProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  return (
    <section>
      <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-zinc-500">
        <PlayCircle className="h-3.5 w-3.5 text-[var(--film-accent)]" aria-hidden />
        Trailer
      </h2>

      {youtubeId ? (
        <>
          <button
            type="button"
            className={cn(
              "group relative block aspect-video w-full overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--film-accent)]"
            )}
            aria-label={`Play ${title} trailer`}
            onClick={() => setIsOpen(true)}
          >
            {thumbnailUrl ? (
              <Image
                src={thumbnailUrl}
                alt=""
                fill
                sizes="(max-width: 1024px) 100vw, 640px"
                className="object-cover brightness-[0.58] saturate-125 transition-transform duration-300 group-hover:scale-[1.03]"
              />
            ) : (
              <div className="absolute inset-0 bg-zinc-900" />
            )}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.1)_0%,rgba(0,0,0,0.62)_72%)]" />
            <span className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-[var(--film-accent)] bg-black/48 text-[var(--film-accent)] shadow-[0_0_38px_color-mix(in_srgb,var(--film-accent)_38%,transparent)] backdrop-blur-sm transition-transform duration-200 group-hover:scale-105">
              <Play className="ml-1 h-9 w-9 fill-current" aria-hidden />
            </span>
          </button>

          <a
            href={trailerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "mt-2 inline-flex items-center gap-1.5",
              "rounded text-xs text-zinc-500 transition-colors hover:text-[var(--film-accent)]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            )}
          >
            <ExternalLink className="h-3 w-3" aria-hidden />
            Watch on YouTube
          </a>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/78 p-4 backdrop-blur-md"
                role="dialog"
                aria-modal="true"
                aria-label={`${title} trailer`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
              >
                <motion.div
                  className="relative w-full max-w-5xl rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl shadow-black/80"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.94 }}
                  transition={{ type: "spring", duration: 0.3, bounce: 0.18 }}
                  onClick={(event) => event.stopPropagation()}
                >
                  <button
                    type="button"
                    className="absolute -right-2 -top-12 inline-flex h-10 w-10 items-center justify-center rounded text-zinc-400 transition-colors hover:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--film-accent)] sm:-right-12 sm:top-0"
                    aria-label="Close trailer"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-6 w-6" aria-hidden />
                  </button>
                  <div className="aspect-video overflow-hidden rounded-2xl">
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1`}
                      title={`${title} trailer`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="h-full w-full"
                    />
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      ) : (
        <a
          href={trailerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "inline-flex items-center gap-2 rounded-xl border bg-zinc-800",
            "px-4 py-2 text-sm font-medium text-zinc-100 transition-colors hover:bg-zinc-700",
            "border-[color:color-mix(in_srgb,var(--film-accent)_45%,rgb(63_63_70))] hover:text-[var(--film-accent)]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          )}
        >
          <ExternalLink className="h-4 w-4" aria-hidden />
          Watch Trailer
        </a>
      )}
    </section>
  );
}
