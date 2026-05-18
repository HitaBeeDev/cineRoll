import Link from "next/link";
import { SiteNavigation } from "@/components/site-navigation";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 flex h-14 shrink-0 items-center justify-between border-b border-white/10 bg-[#08080d]/95 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="font-[family-name:var(--font-geist-mono)] text-[1rem] font-bold uppercase tracking-[0.16em] text-[#ff554c]"
        >
          Cine·Roll
        </Link>
        <span className="hidden items-center rounded-full border border-[#e8453c]/20 bg-[#e8453c]/5 px-2 py-0.5 font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-[0.18em] text-[#e8453c]/65 sm:inline-flex">
          Now Showing
        </span>
      </div>
      <SiteNavigation />
    </header>
  );
}
