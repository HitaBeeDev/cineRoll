import Link from "next/link";

export type RelatedLink = { href: string; label: string };

// The hubs every hub page points back to, so no page is a dead end.
const STANDARD: RelatedLink[] = [
  { href: "/awards", label: "All four awards" },
  { href: "/collections", label: "Collections" },
  { href: "/decades", label: "Films by decade" },
  { href: "/countries", label: "Films by country" },
  { href: "/languages", label: "Films by language" },
  { href: "/moods", label: "Films by mood" },
  { href: "/tonight", label: "What to watch tonight" },
  { href: "/ask-ai", label: "AI movie recommendations" },
  { href: "/streaming", label: "Streaming now" },
  { href: "/tools", label: "Movie pickers and random generators" },
];

/**
 * "Related pages": the links that fit this page first, then the standard hubs,
 * without duplicates and without a link to the page itself.
 */
export function RelatedPages({ current, links = [] }: { current: string; links?: RelatedLink[] }) {
  const seen = new Set<string>([current]);
  const all = [...links, ...STANDARD].filter((link) => {
    if (seen.has(link.href)) return false;
    seen.add(link.href);
    return true;
  });

  return (
    <nav aria-labelledby="related-pages" className="border-t border-white/10 pt-10">
      <h2
        id="related-pages"
        className="font-[family-name:var(--font-geist-mono)] text-[11px] font-semibold uppercase tracking-[0.22em] text-accent"
      >
        Related pages
      </h2>
      <ul className="mt-4 flex flex-wrap gap-2">
        {all.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="group flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.02] px-4 py-2 text-sm text-fg-dim transition-colors hover:border-accent/50 hover:text-fg-hi focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
            >
              {link.label}
              <span aria-hidden className="text-fg-faint transition-all group-hover:translate-x-0.5 group-hover:text-accent">
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
