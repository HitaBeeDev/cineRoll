import Link from "next/link";
import { SiteNavigation } from "@/components/site-navigation";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 shrink-0 border-b border-white/10 bg-[#08080d]/92 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-screen-2xl items-center justify-between gap-5 px-4 sm:px-6 lg:px-8 xl:px-12">
        <Link
          href="/"
          className="flex items-center gap-2 font-[family-name:var(--font-geist-mono)] text-[1rem] font-bold uppercase tracking-[0.16em] text-[#ff554c] transition-colors hover:text-[#ff7068]"
        >
          <span className="h-2 w-2 rounded-full bg-[#e8453c] shadow-[0_0_18px_rgba(232,69,60,0.7)]" aria-hidden />
          Cine·Roll
        </Link>
        <SiteNavigation />
      </div>
    </header>
  );
}
