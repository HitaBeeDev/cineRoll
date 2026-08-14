import type { CookieConsentChoice } from "@/lib/analytics";

/** Bottom-of-page consent bar shown until the visitor makes a choice. */
export function ConsentBanner({
  onManage,
  onSave,
}: {
  onManage: () => void;
  onSave: (choice: CookieConsentChoice) => void;
}) {
  return (
    <section
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-edge bg-[#08080f]/95 backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-screen-xl flex-col gap-3.5 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6">
        <div className="min-w-0">
          <p className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.28em] text-[#6a6a80]">
            {"// cookies"}
          </p>
          <p className="mt-1.5 max-w-2xl text-[13px] leading-6 text-[#b7b7c8]">
            A couple of essential cookies keep CineRoll running. Analytics stays
            off until you turn it on.{" "}
            <a
              href="/privacy"
              className="text-[#d7d7e4] underline decoration-[#3a3a4e] underline-offset-[3px] transition-colors hover:decoration-accent"
            >
              Privacy policy
            </a>
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onManage}
            className="inline-flex h-9 items-center rounded-full px-3 font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.18em] text-[#888899] transition-colors hover:text-fg-hi focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-[#08080f]"
          >
            Manage
          </button>
          <button
            type="button"
            onClick={() => onSave("declined")}
            className="inline-flex h-9 items-center rounded-full border border-edge-strong bg-ink-800 px-4 font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.18em] text-[#d7d7e4] transition-colors hover:border-edge-hover hover:text-fg-hi focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-[#08080f]"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={() => onSave("granted")}
            className="inline-flex h-9 items-center rounded-full bg-accent px-4 font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.18em] text-ink-900 transition-colors hover:bg-[#d5342b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-[#08080f]"
          >
            Allow analytics
          </button>
        </div>
      </div>
    </section>
  );
}
