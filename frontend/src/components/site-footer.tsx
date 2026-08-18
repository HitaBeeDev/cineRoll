import Link from "next/link";
import { CookiePreferencesLink } from "@/components/cookie-preferences-link";
import { DeferredSiteFeedbackDialog } from "@/components/deferred-site-feedback-dialog";

export function SiteFooter() {
  return (
    <footer className="max-w-full overflow-x-hidden border-t border-white/10 bg-[#07070b]">
      <div className="mx-auto flex max-w-screen-2xl flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-10 xl:px-12">
        <p className="max-w-full break-words font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.16em] text-fg-muted sm:tracking-[0.24em]">
          © {new Date().getFullYear()} CineRoll
          <span className="mx-2 text-[#2e2e44]">·</span>
          <a
            href="https://github.com/HitaBeeDev"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-sm transition-colors hover:text-accent focus-visible:outline-none focus-visible:text-accent focus-visible:ring-2 focus-visible:ring-accent/50"
          >
            Built by Anahita<span className="ml-1 tracking-normal">↗</span>
          </a>
        </p>
        <nav className="flex min-w-0 flex-wrap items-center gap-5">
          <a
            href="https://ko-fi.com/hitabeedev"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-sm font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.16em] text-fg-muted transition-colors hover:text-accent focus-visible:outline-none focus-visible:text-accent focus-visible:ring-2 focus-visible:ring-accent/50 sm:tracking-[0.24em]"
          >
            Support CineRoll
          </a>
          <Link
            href="/privacy"
            className="rounded-sm font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.16em] text-fg-muted transition-colors hover:text-accent focus-visible:outline-none focus-visible:text-accent focus-visible:ring-2 focus-visible:ring-accent/50 sm:tracking-[0.24em]"
          >
            Privacy
          </Link>
          <Link
            href="/terms"
            className="rounded-sm font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.16em] text-fg-muted transition-colors hover:text-accent focus-visible:outline-none focus-visible:text-accent focus-visible:ring-2 focus-visible:ring-accent/50 sm:tracking-[0.24em]"
          >
            Terms
          </Link>
          <CookiePreferencesLink />
          <DeferredSiteFeedbackDialog />
        </nav>
      </div>
    </footer>
  );
}
