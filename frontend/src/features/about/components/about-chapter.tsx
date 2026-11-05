import type { ReactNode } from "react";
import { Reveal } from "@/components/cinematic/reveal";

/**
 * One numbered chapter of the Making Of tour: a reel label and serif heading
 * over full-width content. The lede stays at a readable measure (~70
 * characters); visual blocks use the full width.
 */
export function AboutChapter({
  number,
  title,
  lede,
  children,
}: {
  number: string;
  title: string;
  lede?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="border-t border-white/10 py-14 first:border-t-0 lg:py-20">
      <Reveal>
        <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.2em] text-accent">
          Reel {number}
        </p>
        <h2 className="mt-3 max-w-3xl font-[family-name:var(--font-display)] text-3xl font-bold leading-tight tracking-tight text-fg-hi sm:text-4xl">
          {title}
        </h2>
        {lede && (
          <div className="mt-5 max-w-2xl space-y-4 text-base leading-7 text-fg-dim sm:text-[17px] sm:leading-8">
            {lede}
          </div>
        )}
      </Reveal>
      <div className="mt-10">{children}</div>
    </section>
  );
}
