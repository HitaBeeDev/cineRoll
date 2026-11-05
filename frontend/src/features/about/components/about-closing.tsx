"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/cinematic/reveal";
import { useRolledFilm } from "../making-of/use-rolled-film";

/**
 * The end card: one clear next step. Once the visitor has rolled in the hero
 * demo, that film's poster emerges softly behind it — the tour ends on their
 * pick. Before any roll it stays a plain dark card.
 */
export function AboutClosing() {
  const reduceMotion = useReducedMotion();
  const { film, rolled } = useRolledFilm();
  const picked = rolled ? film : null;

  return (
    <section className="relative isolate overflow-hidden border-t border-white/10 bg-[#07070b]">
      <AnimatePresence>
        {picked && (
          <motion.div
            key={picked.slug}
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10"
            initial={{ opacity: 0, scale: reduceMotion ? 1 : 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 1.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <Image
              src={picked.posterUrl}
              alt=""
              fill
              sizes="100vw"
              className="scale-110 object-cover opacity-55 blur-xl saturate-[1.15]"
            />
            <span className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(7,7,11,0.25),#07070b_80%)]" />
          </motion.div>
        )}
      </AnimatePresence>
      <span
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-accent opacity-[0.08] blur-[90px]"
      />
      <Reveal className="relative mx-auto max-w-3xl px-6 py-20 text-center lg:py-24">
        <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.3em] text-fg-faint">
          The end · roll credits
        </p>
        <h2 className="mt-5 font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight text-fg-hi sm:text-5xl">
          Can&apos;t decide what to watch?
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-fg-muted">
          {picked ? (
            <>
              You rolled <span className="text-fg-hi">{picked.title}</span>. The full roll picks from
              the whole catalogue.
            </>
          ) : (
            "One roll, one film from the catalogue, chosen at random."
          )}
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white shadow-[0_0_30px_rgba(232,69,60,0.35)] transition-colors hover:bg-accent-hi focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
          >
            Roll a film
          </Link>
          {picked && (
            <Link
              href={`/film/${picked.slug}`}
              className="rounded-full border border-white/20 px-5 py-2.5 text-sm text-fg-hi transition-colors hover:border-accent/60 hover:text-accent-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
            >
              Open {picked.title} →
            </Link>
          )}
        </div>
      </Reveal>
    </section>
  );
}
