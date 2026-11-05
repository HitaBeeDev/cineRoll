import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/cinematic/reveal";
import type { MatchExample } from "../making-of/making-of-types";

const LINK_CLASS =
  "text-fg-hi underline decoration-white/25 underline-offset-4 transition-colors hover:text-accent hover:decoration-accent/60";
const MONO_LABEL =
  "font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.16em] text-fg-faint";

/**
 * The matching step, shown on a real film: two names it is known by resolve to
 * one TMDB record carrying its combined award history. Beside it, the rule for
 * uncertain matches — drawn as a schematic, not a fake record.
 */
export function BehindTheRecords({ match }: { match: MatchExample | null }) {
  return (
    <>
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        {match && (
          <Reveal className="h-full">
            <div className="h-full rounded-2xl border border-white/10 bg-[#0b0b12] p-6">
              <p className={MONO_LABEL}>A real match</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-white/10 px-4 py-3">
                  <p className={MONO_LABEL}>Original title</p>
                  <p className="mt-1 font-medium text-fg-hi">{match.originalTitle}</p>
                </div>
                <div className="rounded-lg border border-white/10 px-4 py-3">
                  <p className={MONO_LABEL}>English title</p>
                  <p className="mt-1 font-medium text-fg-hi">{match.title}</p>
                </div>
              </div>

              {/* Two lines converging into the one record below. */}
              <svg aria-hidden viewBox="0 0 200 28" preserveAspectRatio="none" className="h-7 w-full text-accent/70">
                <path d="M50 0 C50 16 100 12 100 28 M150 0 C150 16 100 12 100 28" fill="none" stroke="currentColor" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
              </svg>

              <Link
                href={`/film/${match.slug}`}
                className="group flex items-center gap-4 rounded-xl border border-accent/40 bg-accent/[0.06] p-3 transition-colors hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
              >
                {match.posterUrl && (
                  <span className="relative block aspect-[2/3] w-12 shrink-0 overflow-hidden rounded">
                    <Image src={match.posterUrl} alt="" fill sizes="48px" className="object-cover" />
                  </span>
                )}
                <span className="min-w-0">
                  <span className="block font-medium text-fg-hi group-hover:text-accent-soft">
                    One record: {match.title}
                  </span>
                  {match.tmdbId && (
                    <span className="mt-0.5 block font-[family-name:var(--font-geist-mono)] text-[11px] tabular-nums text-fg-muted">
                      TMDB #{match.tmdbId}
                    </span>
                  )}
                </span>
              </Link>

              <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {match.bodies.map((body) => (
                  <li key={body.name} className="rounded-lg bg-white/[0.03] px-3 py-2">
                    <p className={MONO_LABEL}>{body.name}</p>
                    <p className="mt-1 text-sm tabular-nums text-fg-dim">
                      {body.nominations > 0 ? (
                        <>
                          <span className={body.wins > 0 ? "text-gold" : ""}>{body.wins} won</span> /{" "}
                          {body.nominations} nom.
                        </>
                      ) : (
                        <span className="text-fg-faint">—</span>
                      )}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        )}

        <Reveal delay={0.1} className="h-full">
          <div className="h-full rounded-2xl border border-dashed border-white/15 p-6">
            <p className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.16em] text-gold">
              <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden />
              Needs review
            </p>
            <div aria-hidden className="mt-5 space-y-2">
              <div className="rounded-lg border border-white/10 px-3 py-2 text-sm text-fg-dim">
                One award listing
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-dashed border-white/15 px-3 py-2 text-sm text-fg-muted">
                  Possible film 1
                </div>
                <div className="rounded-lg border border-dashed border-white/15 px-3 py-2 text-sm text-fg-muted">
                  Possible film 2
                </div>
              </div>
            </div>
            <p className="mt-5 text-sm leading-6 text-fg-dim">
              When a listing could be more than one film — a shared title, or a year that doesn&apos;t
              line up — it goes to a manual review queue instead of being guessed.
            </p>
          </div>
        </Reveal>
      </div>

      <div className="mt-8 grid gap-6 border-t border-white/10 pt-8 sm:grid-cols-3">
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
