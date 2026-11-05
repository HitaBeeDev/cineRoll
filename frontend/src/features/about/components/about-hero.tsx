import Link from "next/link";
import { AwardNameReel } from "@/components/cinematic/award-name-reel";
import { CinematicBackdrop } from "@/components/cinematic/cinematic-backdrop";

export function AboutHero() {
  return (
    <section className="relative isolate overflow-hidden border-b border-white/10 bg-[#07070b]">
      <CinematicBackdrop />

      <div className="relative z-10 mx-auto w-full max-w-5xl px-6 pb-14 pt-24 lg:px-10 lg:pt-28">
        <p className="flex items-center gap-3 font-[family-name:var(--font-geist-mono)] text-[11px] font-semibold uppercase tracking-[0.3em] text-accent">
          <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_14px_rgba(232,69,60,0.8)]" />
          Making Of
        </p>
        <h1 className="mt-6 max-w-3xl font-[family-name:var(--font-display)] text-5xl font-bold leading-[1.02] tracking-tight text-fg-hi sm:text-7xl">
          What is <span className="italic text-accent-soft">CineRoll</span>?
        </h1>
        <p className="mt-7 max-w-xl text-lg leading-8 text-fg-muted">
          A catalogue of the films and series recognised by four major film awards and festivals —
          the Oscars, the Golden Globes, Cannes and the Berlinale — and a way to pick one to watch
          tonight.
        </p>
        <Link
          href="/"
          className="mt-9 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white shadow-[0_0_30px_rgba(232,69,60,0.35)] transition-colors hover:bg-accent-hi focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
        >
          Roll a film
        </Link>
      </div>
      <AwardNameReel />
    </section>
  );
}
