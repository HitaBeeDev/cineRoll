"use client";

import { ChevronRight, Cookie, Download } from "lucide-react";
import { COOKIE_PREFERENCES_EVENT } from "@/components/cookie-consent/preferences-event";
import { cn } from "@/lib/utils/cn";
import { SETTINGS_CARD } from "./settings-card-class";
import { SectionHeading } from "./section-heading";
import { useDownloadMyData } from "./use-download-my-data";

const ROW =
  "flex w-full items-center gap-3 rounded-xl border border-edge bg-ink-900 px-4 py-3 text-left " +
  "group transition-all hover:border-edge-hover hover:bg-ink-750 hover:shadow-sm " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 " +
  "disabled:cursor-not-allowed disabled:opacity-60";

/**
 * The two privacy controls that existed but had no home in Settings: the cookie
 * dialog (reachable only from the footer, which is not where anyone looks for a
 * setting) and an export of the account's own data.
 */
export function PrivacyDataCard() {
  const { pending, download } = useDownloadMyData();

  return (
    <section className={`bg-ink-850 px-6 py-6 ${SETTINGS_CARD}`}>
      <SectionHeading title="Privacy & data" />
      <p className="mt-2 text-sm text-fg-muted">
        Take a copy of your data, or change what this site is allowed to store.
      </p>

      <div className="mt-5 flex flex-col gap-2.5">
        <button type="button" onClick={() => void download()} disabled={pending} className={cn(ROW)}>
          <Download className="h-4 w-4 shrink-0 text-fg-muted transition-colors group-hover:text-fg-hi" aria-hidden />
          <span className="min-w-0">
            <span className="block text-sm font-medium text-fg-hi">
              {pending ? "Preparing…" : "Download my data"}
            </span>
            <span className="block text-xs text-fg-muted">
              Prepares and immediately downloads a JSON copy of your CineRoll data.
            </span>
          </span>
          <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-fg-muted transition-transform group-hover:translate-x-0.5 group-hover:text-fg-hi" aria-hidden />
        </button>

        <button
          type="button"
          onClick={() => window.dispatchEvent(new Event(COOKIE_PREFERENCES_EVENT))}
          className={cn(ROW)}
        >
          <Cookie className="h-4 w-4 shrink-0 text-fg-muted transition-colors group-hover:text-fg-hi" aria-hidden />
          <span className="min-w-0">
            <span className="block text-sm font-medium text-fg-hi">Cookie preferences</span>
            <span className="block text-xs text-fg-muted">
              Review and change your optional analytics consent.
            </span>
          </span>
          <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-fg-muted transition-transform group-hover:translate-x-0.5 group-hover:text-fg-hi" aria-hidden />
        </button>
      </div>
    </section>
  );
}
