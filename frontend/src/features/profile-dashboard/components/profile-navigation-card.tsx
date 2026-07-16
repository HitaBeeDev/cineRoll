import Link from "next/link";
import type { ProfileNavigationCardProps } from "../profile-component-types";

export function ProfileNavigationCard({ item }: ProfileNavigationCardProps) {
  return (
    <Link
      href={item.href}
      className="group flex flex-col rounded-xl border border-[#1e1e2a] bg-[#0d0d1a] px-6 py-7 transition duration-200 hover:-translate-y-0.5 hover:border-[#e8453c]/60 hover:bg-[#111120] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]"
    >
      <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-[#F5F5F0]">
        {item.title}
      </h2>
      <p className="mt-2 flex-1 font-[family-name:var(--font-geist-mono)] text-[13px] leading-relaxed text-[#b4b4c4]">
        {item.blurb}
      </p>
      <div className="mt-5 flex items-center justify-between font-[family-name:var(--font-geist-mono)] text-[13px] font-bold uppercase tracking-[0.08em] text-[#c8c8d2] transition-colors group-hover:text-[#e8453c]">
        <span>{item.action}</span>
        <span
          aria-hidden
          className="transition-transform duration-200 group-hover:translate-x-0.5"
        >
          →
        </span>
      </div>
    </Link>
  );
}
