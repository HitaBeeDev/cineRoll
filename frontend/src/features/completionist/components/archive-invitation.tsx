import Link from "next/link";
import { COMPLETIONIST_BROWSE_FILTERS } from "../completionist-browse-filters";
import type { ArchiveInvitationProps } from "../completionist-component-types";

export function ArchiveInvitation({ categories }: ArchiveInvitationProps) {
  return (
    <div className="mt-7">
      <p className="font-[family-name:var(--font-geist-mono)] text-[13px] leading-relaxed text-[#b4b4c4]">
        Your reel is blank. Pick a collection and mark your first watch — the
        strip starts filling from frame one.
      </p>
      <div className="mt-4 flex flex-wrap gap-2.5">
        {categories.map((category) => (
          <Link
            key={category.key}
            href={`/browse?${COMPLETIONIST_BROWSE_FILTERS[category.key]}`}
            className="group inline-flex items-baseline gap-2 rounded-full border border-[#1e1e2a] bg-[#0d0d1a] px-4 py-2 font-[family-name:var(--font-geist-mono)] text-[13px] text-[#c8c8d2] transition-colors hover:border-[#e8453c]/60 hover:text-[#F5F5F0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]"
          >
            {category.label}
            <span className="text-[12px] tabular-nums text-[#9a9aac] transition-colors group-hover:text-[#e8453c]">
              {category.total.toLocaleString()}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
