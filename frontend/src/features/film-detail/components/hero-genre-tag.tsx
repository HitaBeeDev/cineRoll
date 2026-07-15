import Link from "next/link";
import { Tag } from "lucide-react";
import type { HeroGenreTagProps } from "../component-props";

export function HeroGenreTag({ genre }: HeroGenreTagProps) {
  return (
    <Link
      href={`/browse?genre=${encodeURIComponent(genre)}`}
      className="group inline-flex items-center gap-1.5 rounded-[3px] border border-white/12 bg-white/[0.04] px-2.5 py-1.5 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.18em] text-white/55 backdrop-blur-sm transition-colors hover:border-[#e8453c]/45 hover:bg-[#e8453c]/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]"
    >
      <Tag
        className="h-3 w-3 opacity-45 transition-opacity group-hover:opacity-90"
        aria-hidden
      />
      {genre}
    </Link>
  );
}
