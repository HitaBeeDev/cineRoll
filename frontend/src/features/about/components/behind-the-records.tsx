import Link from "next/link";
import { Reveal } from "@/components/cinematic/reveal";
import type { MatchExample } from "../making-of/making-of-types";
import { MatchMerge } from "./match-merge";

const LINK_CLASS =
  "text-fg-hi underline decoration-white/25 underline-offset-4 transition-colors hover:text-accent hover:decoration-accent/60";
const MONO_LABEL =
  "font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.16em] text-fg-faint";

/**
 * Reel 03, on a narrow centered column: the matching demonstration, then the
 * rule for uncertain matches as one compact line (a schematic, not a fake
 * record), then the sources.
 */
export function BehindTheRecords({ match }: { match: MatchExample | null }) {
  return (
    <>
      {match && <MatchMerge match={match} />}

      <Reveal>
        <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-dashed border-white/15 p-5 sm:flex-row sm:items-center sm:gap-5">
          <span className="inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-gold/40 bg-gold/10 px-3 py-1 font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.16em] text-gold sm:self-center">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden />
            Needs review
          </span>
          <p className="text-sm leading-6 text-fg-dim">
            When a listing could be more than one film — a shared title, or a year that doesn&apos;t
            line up — it goes to a manual review queue instead of being guessed.
          </p>
        </div>
      </Reveal>

      <div className="mt-10 grid gap-6 sm:grid-cols-3">
        <div>
          <p className={MONO_LABEL}>Awards</p>
          <p className="mt-2 text-sm leading-6 text-fg-dim">
            Nomination and winner lists of each award body, collected year by year.
          </p>
        </div>
        <div>
          <p className={MONO_LABEL}>Film details</p>
          <p className="mt-2 text-sm leading-6 text-fg-dim">
            Posters, cast, genres and plot summaries from{" "}
            <a href="https://www.themoviedb.org" target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>
              TMDB
            </a>
            .
          </p>
        </div>
        <div>
          <p className={MONO_LABEL}>Ratings</p>
          <p className="mt-2 text-sm leading-6 text-fg-dim">IMDb ratings and Rotten Tomatoes scores via the OMDb API.</p>
        </div>
      </div>
      <p className="mt-6 text-sm text-fg-muted">
        The full method and the known gaps are on the{" "}
        <Link href="/methodology" className={LINK_CLASS}>
          methodology page
        </Link>
        . <span className="text-xs text-fg-faint">This product uses the TMDB API but is not endorsed or certified by TMDB.</span>
      </p>
    </>
  );
}
