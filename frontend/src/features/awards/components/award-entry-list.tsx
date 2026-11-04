import Image from "next/image";
import Link from "next/link";
import type { AwardEntry } from "../award-types";

/** Nominations as a list: poster, film, the nominee named, and a winner mark. */
export function AwardEntryList({ entries }: { entries: AwardEntry[] }) {
  return (
    <ul className="divide-y divide-white/5">
      {entries.map((entry, index) => (
        <li key={`${entry.film.slug}-${entry.nominee ?? ""}-${index}`} className="flex items-center gap-4 py-3">
          {entry.film.posterUrl ? (
            <Image
              src={entry.film.posterUrl}
              alt={`${entry.film.title} poster`}
              width={40}
              height={60}
              className="h-[60px] w-[40px] shrink-0 rounded object-cover"
            />
          ) : (
            <div className="h-[60px] w-[40px] shrink-0 rounded bg-ink-750" aria-hidden />
          )}
          <div className="min-w-0 flex-1">
            <Link
              href={`/film/${entry.film.slug}`}
              className="font-medium text-fg-hi underline-offset-4 hover:text-accent hover:underline"
            >
              {entry.film.title}
            </Link>
            {entry.film.year && <span className="ml-2 text-sm text-fg-muted">({entry.film.year})</span>}
            {entry.nominee && entry.nominee !== entry.film.title && (
              <p className="truncate text-sm text-fg-muted">{entry.nominee}</p>
            )}
          </div>
          {entry.won && (
            <span className="shrink-0 rounded-full border border-gold/40 px-2.5 py-0.5 font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.2em] text-gold">
              Winner
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
