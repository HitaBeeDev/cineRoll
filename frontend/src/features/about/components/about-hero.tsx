import Link from "next/link";
import { CinematicBackdrop } from "@/components/cinematic/cinematic-backdrop";
import type { DemoFilm } from "../making-of/making-of-types";
import { RollDemo } from "./roll-demo";

/** Heading on the left, a working miniature of the roll on the right. */
export function AboutHero({ pool }: { pool: DemoFilm[] }) {
  return (
    <section className="relative isolate overflow-hidden border-b border-white/10 bg-[#07070b]">
      <CinematicBackdrop />

      <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-10 px-6 pb-12 pt-12 lg:grid-cols-[1.1fr_1fr] lg:px-10 lg:pt-14">
        <div>
          <p className="flex items-center gap-3 font-[family-name:var(--font-geist-mono)] text-[11px] font-semibold uppercase tracking-[0.3em] text-accent">
            <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_14px_rgba(232,69,60,0.8)]" />
            Making Of
          </p>
          <h1 className="mt-6 font-[family-name:var(--font-display)] text-5xl font-bold leading-[1.02] tracking-tight text-fg-hi sm:text-7xl">
            What is <span className="italic text-accent-soft">CineRoll</span>?
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-fg-muted">
            A catalogue of the films and series recognised by four major film awards and festivals —
            the Oscars, the Golden Globes, Cannes and the Berlinale — and a way to pick one to watch
            tonight. Try it: press <span className="text-fg-hi">Roll</span>.
          </p>
          <Link
            href="/"
            className="mt-9 inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-2.5 text-sm font-medium text-fg-hi transition-colors hover:border-accent/60 hover:text-accent-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
          >
            Open the full roll →
          </Link>
        </div>
        <RollDemo pool={pool} />
      </div>
    </section>
  );
}
