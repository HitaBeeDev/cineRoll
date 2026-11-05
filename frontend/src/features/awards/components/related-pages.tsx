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
  { href: "/streaming", label: "Streaming now" },
  { href: "/tools", label: "Random film tools" },
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
        className="font-[family-name:var(--font-geist-mono)] text-[11px] font-semibold uppercase tracking-[0.4em] text-accent"
      >
        Related pages
      </h2>
      <ul className="mt-4 flex flex-wrap gap-2">
        {all.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="block rounded-md border border-edge px-3 py-1.5 text-sm text-fg-dim transition-colors hover:border-edge-hover hover:text-fg-hi"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
