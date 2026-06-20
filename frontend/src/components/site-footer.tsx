import Link from "next/link";
import { SiteFeedbackDialog } from "@/components/site-feedback-dialog";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#07070b]">
      <div className="mx-auto flex max-w-screen-2xl flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between lg:px-10 xl:px-12">
        <p className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.28em] text-[#5f5f78]">
          © {new Date().getFullYear()} CineRoll
          <span className="mx-2 text-[#2e2e44]">·</span>
          <a
            href="https://github.com/HitaBeeDev"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-[#e8453c] focus-visible:outline-none focus-visible:text-[#e8453c]"
          >
            Built by Anahita<span className="ml-1 tracking-normal">↗</span>
          </a>
        </p>
        <nav className="flex items-center gap-5">
          <Link
            href="/privacy"
            className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.28em] text-[#5f5f78] transition-colors hover:text-[#e8453c] focus-visible:outline-none focus-visible:text-[#e8453c]"
          >
            Privacy
          </Link>
          <SiteFeedbackDialog />
        </nav>
      </div>
    </footer>
  );
}
