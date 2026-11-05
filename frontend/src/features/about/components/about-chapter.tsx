import type { ReactNode } from "react";
import { AboutReveal } from "./about-reveal";

/**
 * One numbered chapter: a reel number and serif heading, then the body set to a
 * readable measure (~70 characters). On wide screens the number sits in its
 * own column, level with the heading.
 */
export function AboutChapter({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="grid gap-6 border-t border-white/10 py-12 first:border-t-0 lg:grid-cols-[9rem_1fr] lg:gap-10 lg:py-16">
      <div className="lg:pt-3">
        <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.2em] text-accent">
          Reel {number}
        </p>
      </div>
      <AboutReveal>
        <h2 className="max-w-2xl font-[family-name:var(--font-display)] text-3xl font-bold leading-tight tracking-tight text-fg-hi sm:text-4xl">
          {title}
        </h2>
        <div className="mt-6 max-w-2xl space-y-5 text-base leading-7 text-fg-dim sm:text-[17px] sm:leading-8">
          {children}
        </div>
      </AboutReveal>
    </section>
  );
}
