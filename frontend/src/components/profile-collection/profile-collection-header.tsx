import Link from "next/link";
import type { ProfileCollectionHeaderProps } from "./profile-collection-props";

export function ProfileCollectionHeader({
  title,
}: ProfileCollectionHeaderProps) {
  return (
    <>
      <Link
        href="/profile"
        className="inline-flex items-center gap-1.5 rounded font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.18em] text-[#9a9aac] underline-offset-4 transition-colors hover:text-[#e8453c] hover:underline focus-visible:text-[#e8453c] focus-visible:underline focus-visible:outline-none"
      >
        <span aria-hidden>←</span> Back to profile
      </Link>
      <h1 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold text-[#F5F5F0]">
        {title}
      </h1>
    </>
  );
}
