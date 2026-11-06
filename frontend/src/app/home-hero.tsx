import Link from "next/link";
import { ArrowRight } from "lucide-react";

// Static hero for the home page. A Server Component: it ships no client JS and
// is rendered into the initial HTML (good for first paint and SEO). It is passed
// into the client home shell as a prop so the interactive layout around it stays
// client-side.
//
// The big "One spin…" lines are the brand voice, kept as a styled paragraph.
// The h1 under them says what CineRoll is — the line search engines and screen
// readers take as the page's subject. Its font size is intentionally NOT set here: it
// inherits from the wrapper in HomeHeroFilters so it can shrink when filters
// are active; `transition-all` animates that.
export function HomeHero() {
  return (
    <>
      <p className="font-[family-name:var(--font-display)] font-bold leading-[1.05] tracking-tight text-fg-hi transition-all duration-300">
        One spin.
        <br />
        <span className="text-accent">One film.</span>
        <br />
        Tonight.
      </p>
      {/* The plain-language subtitle: what CineRoll is, at reading size, with
          the /about link finishing the same thought. Own text size, so it never
          inherits the headline's clamp() from the HomeHeroFilters wrapper.

          SEO: this is the home page's only link to /about (the footer is hidden
          on "/") — a checklist item in docs/SEO-RANKING-PLAN.md, keep it. Once
          filters are set the line is hidden with CSS, not unmounted, so the
          link stays in the HTML while the filter rows get the room. */}
      {/* Set in the house voice — mono caps, the same treatment as the
          "One random pick…" line in the standby panel — so it reads as part of
          the broadcast, not a paragraph pasted under it. */}
      <div className="mt-4 max-w-[34rem] font-[family-name:var(--font-geist-mono)] text-[12px] uppercase leading-[1.9] tracking-[0.16em] text-fg-muted group-data-[filtered]/hero:hidden">
        <h1 className="inline font-normal">
          Random movie picker for what to watch tonight.
        </h1>{" "}
        Roll an award-winning film from the Oscars, Golden Globes, Cannes &amp; Berlinale.{" "}
        <Link
          href="/about"
          className="group/about inline-flex items-center gap-1.5 whitespace-nowrap rounded-sm font-bold text-fg-hi transition-colors hover:text-accent-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
        >
          What is CineRoll?
          <ArrowRight aria-hidden className="h-3 w-3 text-accent transition-transform duration-200 group-hover/about:translate-x-0.5" />
        </Link>
      </div>
      {/* SEO: the home page's direct links to the key collections — Best
          Picture and the cross-award lists (checklist item in
          docs/SEO-RANKING-PLAN.md, keep them). Same voice as the line above,
          one step quieter; hidden with CSS when filters are set, so the links
          stay in the HTML. */}
      <nav
        aria-label="Movie picks and collections"
        className="mt-3 max-w-[34rem] font-[family-name:var(--font-geist-mono)] text-[11px] uppercase leading-[2] tracking-[0.16em] text-[#888899] group-data-[filtered]/hero:hidden"
      >
        {HOME_COLLECTIONS.map((collection, index) => (
          <span key={collection.href}>
            {index > 0 && <span aria-hidden className="mx-1 text-white/20"> · </span>}
            <Link
              href={collection.href}
              className="whitespace-nowrap rounded-sm underline decoration-white/15 underline-offset-4 transition-colors hover:text-fg-hi focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
            >
              {collection.label}
            </Link>
          </span>
        ))}
      </nav>
    </>
  );
}

const HOME_COLLECTIONS = [
  { href: "/tonight", label: "What to watch tonight" },
  { href: "/tools/random-award-winning-movie", label: "Random movie generator" },
  { href: "/ask-ai", label: "AI movie recommendations" },
  { href: "/tools", label: "All movie pickers" },
  { href: "/collections/best-picture-winners", label: "Best Picture winners" },
  { href: "/collections/cannes-and-oscar-winners", label: "Won at Cannes & the Oscars" },
  { href: "/collections/won-at-three-awards", label: "Won at three awards" },
  { href: "/collections/most-awarded-films", label: "Most awarded films" },
];
