import { Reveal } from "@/components/cinematic/reveal";
import { AboutFeedbackButton } from "./about-feedback-button";

// What CineRoll is actually built with (frontend and backend package.json).
const STACK = [
  "Next.js",
  "React",
  "TypeScript",
  "Tailwind CSS",
  "Framer Motion",
  "Express",
  "PostgreSQL",
  "Prisma",
  "Gemini",
  "TMDB",
  "OMDb",
];

/** A studio-style credit: the maker first, the toolkit tucked into "Built with", and a direct way to correct the data. */
export function WhoMakesIt() {
  return (
    <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
      <Reveal>
        <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.2em] text-fg-faint">
          Designed and built by
        </p>
        <p className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold italic leading-tight tracking-tight text-fg-hi sm:text-4xl">
          Anahita Amiri
        </p>
        <p className="mt-4 max-w-xl text-base leading-7 text-fg-dim sm:text-[17px] sm:leading-8">
          CineRoll is built and maintained by an independent developer — the award data pipeline,
          the matching, the site.
        </p>
        <details className="group mt-6">
          <summary className="inline-flex cursor-pointer list-none items-center gap-2 rounded-full border border-white/15 px-4 py-2 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.16em] text-fg-muted transition-colors hover:border-accent/50 hover:text-fg-hi focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 [&::-webkit-details-marker]:hidden">
            Built with
            <span aria-hidden className="transition-transform duration-200 group-open:rotate-45">+</span>
          </summary>
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {STACK.map((tool) => (
              <li
                key={tool}
                className="rounded-full border border-white/10 px-3 py-1 font-[family-name:var(--font-geist-mono)] text-[11px] text-fg-muted"
              >
                {tool}
              </li>
            ))}
          </ul>
        </details>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="rounded-2xl border border-white/10 bg-[#0b0b12] p-6">
          <p className="font-[family-name:var(--font-display)] text-2xl font-bold text-fg-hi">Spotted a mistake?</p>
          <p className="mt-3 text-sm leading-6 text-fg-dim">
            A wrong award, or a film matched to the wrong title? Report it. Every report is
            reviewed, and confirmed fixes go into the data.
          </p>
          <div className="mt-5">
            <AboutFeedbackButton />
          </div>
        </div>
      </Reveal>
    </div>
  );
}
