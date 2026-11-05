import Link from "next/link";
import { AboutReveal } from "./about-reveal";

/** The end card: one clear next step. */
export function AboutClosing() {
  return (
    <section className="relative overflow-hidden border-t border-white/10 bg-[#07070b]">
      <span
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-accent opacity-[0.08] blur-[90px]"
      />
      <AboutReveal className="relative mx-auto max-w-3xl px-6 py-20 text-center lg:py-24">
        <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.3em] text-fg-faint">
          The end · roll credits
        </p>
        <h2 className="mt-5 font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight text-fg-hi sm:text-5xl">
          Can&apos;t decide what to watch?
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-fg-muted">
          One roll, one film from the catalogue, chosen at random.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white shadow-[0_0_30px_rgba(232,69,60,0.35)] transition-colors hover:bg-accent-hi focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
          >
            Roll a film
          </Link>
        </div>
      </AboutReveal>
    </section>
  );
}
