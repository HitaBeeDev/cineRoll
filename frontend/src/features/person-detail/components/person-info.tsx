import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getFirstName } from "../get-first-name";
import { getPersonBioPreview } from "../person-bio";
import type { PersonInfoProps } from "../component-props";
import { PersonStats } from "./person-stats";

export function PersonInfo({ person }: PersonInfoProps) {
  return (
    <div className="min-w-0 flex-1">
      <p className="mb-3 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.5em] text-[#e8453c]">
        ◆ Award Profile
      </p>
      <h1
        className="font-[family-name:var(--font-display)] font-bold leading-[0.9] tracking-tight text-[#f8f8f4]"
        style={{ fontSize: "clamp(2.4rem,6vw,5rem)" }}
      >
        {person.name}
      </h1>
      <PersonStats person={person} />
      {person.bio && (
        <p className="mt-7 max-w-[68ch] text-[0.9rem] leading-[1.9] text-[#8888a0]">
          {getPersonBioPreview(person.bio, 300)}
        </p>
      )}
      <div className="mt-8">
        <Link
          href={`/browse?person=${encodeURIComponent(person.name)}`}
          className="inline-flex items-center gap-2 border border-[#e8453c]/30 bg-[#e8453c]/8 px-5 py-2.5 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.3em] text-[#e8453c]/80 transition-all hover:border-[#e8453c]/60 hover:bg-[#e8453c]/14 hover:text-[#e8453c]"
        >
          Browse films with {getFirstName(person.name)}
          <ArrowUpRight className="h-3 w-3" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
