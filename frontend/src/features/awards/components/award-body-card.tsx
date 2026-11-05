import Link from "next/link";
import { Reveal } from "@/components/cinematic/reveal";
import type { BodyCoverage } from "@/features/methodology/coverage-types";
import type { AWARD_BODIES } from "../award-bodies";

type AwardBody = (typeof AWARD_BODIES)[number];

/**
 * One award body as a title card: reel number, name, its live year range and
 * counts, the intro line, and a glyph link that fills on hover. Counts are
 * omitted, not guessed, when the coverage fetch failed.
 */
export function AwardBodyCard({
  body,
  index,
  coverage,
}: {
  body: AwardBody;
  index: number;
  coverage: BodyCoverage | undefined;
}) {
  return (
    <Reveal delay={(index % 2) * 0.1} className="h-full">
      <Link
        href={`/awards/${body.slug}`}
        className="group relative isolate flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b12] p-7 transition-colors duration-300 hover:border-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 sm:p-8"
      >
        <span
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 -z-10 h-56 w-56 rounded-full bg-accent opacity-0 blur-[80px] transition-opacity duration-500 group-hover:opacity-20"
        />

        <div className="flex items-baseline justify-between gap-4 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.2em]">
          <span className="text-accent">Reel {String(index + 1).padStart(2, "0")}</span>
          {coverage && (
            <span className="tabular-nums text-fg-faint">
              {coverage.firstYear}–{coverage.lastYear}
            </span>
          )}
        </div>

        <h2 className="mt-5 font-[family-name:var(--font-display)] text-3xl font-bold leading-tight tracking-tight text-fg-hi">
          {body.name}
        </h2>
        {coverage && (
          <p className="mt-2 text-sm tabular-nums text-fg-faint">
            {coverage.ceremonies.toLocaleString("en-US")} ceremonies ·{" "}
            {coverage.categories.toLocaleString("en-US")} categories
          </p>
        )}
        <p className="mt-4 text-[15px] leading-7 text-fg-muted">{body.intro[0]}</p>

        <span className="mt-auto flex items-center justify-between gap-4 pt-7 text-sm font-medium text-fg-hi">
          <span className="transition-colors group-hover:text-accent-soft">
            {body.headline} winners and more
          </span>
          <span
            aria-hidden
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/15 text-fg-muted transition-all duration-300 group-hover:translate-x-1 group-hover:border-accent group-hover:bg-accent group-hover:text-white"
          >
            →
          </span>
        </span>
      </Link>
    </Reveal>
  );
}
