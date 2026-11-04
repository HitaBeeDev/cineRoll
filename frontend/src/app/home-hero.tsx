import Link from "next/link";

// Static hero for the home page. A Server Component: it ships no client JS and
// is rendered into the initial HTML (good for first paint and SEO). It is passed
// into the client home shell as a prop so the interactive layout around it stays
// client-side.
//
// The h1 says what CineRoll is — the line search engines and screen readers
// take as the page's subject. The big "One spin…" lines are the brand voice,
// kept as a styled paragraph. Its font size is intentionally NOT set here: it
// inherits from the wrapper in HomeHeroFilters so it can shrink when filters
// are active; `transition-all` animates that.
export function HomeHero() {
  return (
    <>
      <div className="mb-4 max-w-[34rem] font-[family-name:var(--font-geist-mono)] text-[11px] uppercase leading-relaxed tracking-[0.22em] text-fg-muted">
        <h1 className="inline font-normal">
          Award-winning films from the Oscars, Golden Globes, Cannes &amp; Berlinale
        </h1>
        <span className="mx-2 text-[#2e2e44]" aria-hidden>·</span>
        <Link
          href="/about"
          className="rounded-sm text-fg-dim underline decoration-white/20 underline-offset-4 transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
        >
          What is CineRoll?
        </Link>
        <span className="mx-2 text-[#2e2e44]" aria-hidden>·</span>
        <Link
          href="/collections"
          className="rounded-sm text-fg-dim underline decoration-white/20 underline-offset-4 transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
        >
          Collections
        </Link>
      </div>
      <p className="font-[family-name:var(--font-display)] font-bold leading-[1.05] tracking-tight text-fg-hi transition-all duration-300">
        One spin.
        <br />
        <span className="text-accent">One film.</span>
        <br />
        Tonight.
      </p>
    </>
  );
}
