import Link from "next/link";
import { AboutChapter } from "./about-chapter";
import { AboutFeedbackButton } from "./about-feedback-button";
import { AboutWaysIn } from "./about-ways-in";

const LINK_CLASS =
  "text-fg-hi underline decoration-white/25 underline-offset-4 transition-colors hover:text-accent hover:decoration-accent/60";

const SOURCES = [
  { name: "Awards", detail: "The nomination and winner lists of each award body, collected year by year." },
  { name: "Film details", detail: "Posters, cast, genres and plot summaries from TMDB." },
  { name: "Ratings", detail: "IMDb ratings and Rotten Tomatoes scores via the OMDb API." },
] as const;

export function AboutContent({ archiveSize }: { archiveSize: number | null }) {
  const size = archiveSize ? archiveSize.toLocaleString("en-US") : "thousands of";

  return (
    <div className="mx-auto max-w-5xl px-6 lg:px-10">
      <AboutChapter number="01" title="What it is">
        <p>
          CineRoll holds {size} films and series nominated at the Academy Awards, the Golden
          Globes, the Cannes Film Festival and the Berlin International Film Festival. Each title
          page puts its nominations and wins at all four in one place.
        </p>
        <AboutWaysIn />
      </AboutChapter>

      <AboutChapter number="02" title="Why CineRoll?">
        <p>
          On IMDb, awards are one detail on a title&apos;s page; Letterboxd is built for logging
          what you watch and following other people&apos;s taste. CineRoll starts from the award
          records themselves. It only holds films that one of the four juries or academies singled
          out, and it puts a film&apos;s record at all four side by side.
        </p>
        <blockquote className="border-l-2 border-accent pl-5 font-[family-name:var(--font-display)] text-2xl italic leading-snug text-fg-hi">
          Built for the moment you cannot decide. One roll gives you one film — no endless list
          to scroll.
        </blockquote>
      </AboutChapter>

      <AboutChapter number="03" title="Where the data comes from">
        <ul className="grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-3">
          {SOURCES.map((source) => (
            <li key={source.name} className="bg-[#0b0b12] p-5">
              <p className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.2em] text-accent">
                {source.name}
              </p>
              <p className="mt-2 text-sm leading-6 text-fg-dim">
                {source.name === "Film details" ? (
                  <>
                    Posters, cast, genres and plot summaries from{" "}
                    <a
                      href="https://www.themoviedb.org"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={LINK_CLASS}
                    >
                      TMDB
                    </a>
                    .
                  </>
                ) : (
                  source.detail
                )}
              </p>
            </li>
          ))}
        </ul>
        <p>
          The same film is often listed under different titles by different awards. Each
          nomination is matched to a single TMDB record, so its wins and nominations land on one
          page. When a match is uncertain it goes to a manual review queue instead of being
          guessed. The full method and the known gaps are on the{" "}
          <Link href="/methodology" className={LINK_CLASS}>
            methodology page
          </Link>
          .
        </p>
        <p className="text-xs text-fg-faint">
          This product uses the TMDB API but is not endorsed or certified by TMDB.
        </p>
      </AboutChapter>

      <AboutChapter number="04" title="Who makes it">
        <p>
          CineRoll is built and maintained by Anahita Amiri, an independent developer. The code is
          on{" "}
          <a
            href="https://github.com/HitaBeeDev"
            target="_blank"
            rel="noopener noreferrer"
            className={LINK_CLASS}
          >
            GitHub
          </a>
          .
        </p>
        <p>
          Found a wrong award or a film matched to the wrong title? Report it. Every report is
          reviewed, and confirmed fixes go into the data.
        </p>
        <div>
          <AboutFeedbackButton />
        </div>
      </AboutChapter>
    </div>
  );
}
