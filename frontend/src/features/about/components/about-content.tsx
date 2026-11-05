import Link from "next/link";
import { PolicySection } from "@/features/legal/components/policy-section";

const LINK_CLASS =
  "text-fg-hi underline decoration-white/25 underline-offset-4 transition-colors hover:text-accent";

export function AboutContent({ archiveSize }: { archiveSize: number | null }) {
  const size = archiveSize ? archiveSize.toLocaleString("en-US") : "thousands of";

  return (
    <div className="mx-auto max-w-4xl space-y-10 px-6 py-14 text-[#c8c8d8] lg:px-10">
      <PolicySection title="What it is">
        <p>
          CineRoll holds {size} films and series nominated at the Academy Awards, the Golden
          Globes, the Cannes Film Festival and the Berlin International Film Festival. Every title
          carries its full award history: each nomination and each win, at every one of the four.
        </p>
        <p>
          You can <Link href="/" className={LINK_CLASS}>roll a random film</Link>,{" "}
          <Link href="/browse" className={LINK_CLASS}>browse and filter</Link> by award, year,
          genre, country or language, see{" "}
          <Link href="/picks" className={LINK_CLASS}>today&apos;s picks</Link>, describe what you
          are in the mood for with <Link href="/ask-ai" className={LINK_CLASS}>Ask AI</Link>, or
          look at the <Link href="/stats" className={LINK_CLASS}>records and statistics</Link>.
          There are also <Link href="/tools" className={LINK_CLASS}>random film tools</Link> for a
          random Oscar winner, Palme d&apos;Or winner, or a film by decade, genre or length.
        </p>
      </PolicySection>

      <PolicySection title="How it differs from IMDb and Letterboxd">
        <p>
          IMDb lists every film ever made, and the awards sit on each title&apos;s own page.
          Letterboxd is built for logging what you watch and following other people&apos;s taste.
          CineRoll starts from the other end: the award records themselves. It only holds films
          that one of the four juries or academies singled out, and it puts a film&apos;s record at
          all four side by side.
        </p>
        <p>
          It is also built for the moment you cannot decide. One roll gives you one film — no
          endless list to scroll.
        </p>
      </PolicySection>

      <PolicySection title="Where the data comes from">
        <ul>
          <li>
            <strong>Awards</strong> — the nomination and winner lists of each award body,
            collected year by year.
          </li>
          <li>
            <strong>Film details</strong> — posters, cast, genres and plot summaries from{" "}
            <a href="https://www.themoviedb.org" target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>
              TMDB
            </a>
            .
          </li>
          <li>
            <strong>Ratings</strong> — IMDb ratings and Rotten Tomatoes scores via the OMDb API.
          </li>
        </ul>
        <p>
          The same film is often listed under different titles by different awards. Each
          nomination is matched to a single TMDB record, so its wins and nominations land on one
          page. When a match is uncertain it goes to a manual review queue instead of being
          guessed. The full method and the known gaps are on the{" "}
          <Link href="/methodology" className={LINK_CLASS}>methodology page</Link>.
        </p>
        <p className="text-xs text-fg-muted">
          This product uses the TMDB API but is not endorsed or certified by TMDB.
        </p>
      </PolicySection>

      <PolicySection title="Who makes it">
        <p>
          CineRoll is built and maintained by Anahita Amiri, an independent developer. The code is
          on{" "}
          <a href="https://github.com/HitaBeeDev" target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>
            GitHub
          </a>
          .
        </p>
        <p>
          Found a wrong award or a film matched to the wrong title? Use the feedback button at the
          bottom of any page — corrections go straight back into the data.
        </p>
      </PolicySection>
    </div>
  );
}
