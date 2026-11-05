import Link from "next/link";
import { WAYS_IN } from "../constants/ways-in";

export function AboutWaysIn() {
  return (
    <ul className="mt-2 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2">
      {WAYS_IN.map((way) => (
        <li key={way.href} className="bg-[#0b0b12]">
          <Link
            href={way.href}
            className="group flex h-full items-start justify-between gap-4 p-5 transition-colors hover:bg-white/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent/60"
          >
            <span>
              <span className="block font-medium text-fg-hi transition-colors group-hover:text-accent-soft">
                {way.label}
              </span>
              <span className="mt-1 block text-sm leading-6 text-fg-muted">{way.note}</span>
            </span>
            <span
              aria-hidden
              className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/15 text-fg-muted transition-all group-hover:translate-x-0.5 group-hover:border-accent/60 group-hover:text-accent"
            >
              →
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
