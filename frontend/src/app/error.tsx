"use client";

import { useEffect } from "react";
import { AppHeader } from "@/components/app-header";
import { ErrorPrimaryAction } from "@/components/error-surface/error-primary-action";
import { ErrorSecondaryAction } from "@/components/error-surface/error-secondary-action";
import { ErrorSurface } from "@/components/error-surface/error-surface";

/**
 * The route error boundary — everything below the root layout.
 *
 * Without this file an uncaught render error falls through to Next's own
 * fallback: a white page with a warning triangle, in light mode, on a product
 * that is dark-only and has no light palette to fall back to. That page also
 * offers a full reload as its only route out, which throws away the client state
 * a retry would have kept.
 *
 * It renders the header itself. `error.tsx` replaces the page it wraps, not the
 * layout above it, and the header is drawn per-page here — without it the crash
 * would also cost the user their way out by navigation.
 */
export default function RouteError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    // Sentry's Next integration reports uncaught render errors on its own; this
    // is for whoever has the console open when it happens.
    console.error("[cineroll] route error", error);
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col bg-ink-900 text-fg-hi">
      <AppHeader />
      <ErrorSurface
        label="// Signal lost"
        heading={
          <>
            This reel
            <br />
            <span className="text-accent">jammed.</span>
          </>
        }
        body="Something broke while loading this page. Trying again re-runs it — most of the time that is all it takes."
        actions={
          <>
            {/* Retry, not reload: it re-runs this segment's data and render and
                leaves the rest of the app — and the session — standing. */}
            <ErrorPrimaryAction onClick={() => unstable_retry()}>Try again</ErrorPrimaryAction>
            <ErrorSecondaryAction href="/">Back to the roll</ErrorSecondaryAction>
          </>
        }
        detail={
          error.digest ? (
            <p className="mt-10 font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.28em] text-fg-faint">
              Ref {error.digest}
            </p>
          ) : null
        }
      />
    </div>
  );
}
