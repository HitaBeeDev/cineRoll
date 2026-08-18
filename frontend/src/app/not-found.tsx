import type { Metadata } from "next";
import { AppHeader } from "@/components/app-header";
import { ErrorPrimaryAction } from "@/components/error-surface/error-primary-action";
import { ErrorSecondaryAction } from "@/components/error-surface/error-secondary-action";
import { ErrorSurface } from "@/components/error-surface/error-surface";

export const metadata: Metadata = {
  title: "Page not found",
  // A 404 has nothing worth indexing, and every unknown URL renders it.
  robots: { index: false, follow: true },
};

/**
 * The root 404 — reached by any unknown URL, not only a missing film, so the
 * copy stays about the page rather than about a film. It used to say "Film not
 * found" on every mistyped route, and it was set in a zinc palette the rest of
 * the product does not use.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col bg-ink-900 text-fg-hi">
      <AppHeader />
      <ErrorSurface
        label="// Off air"
        heading={
          <>
            Nothing
            <br />
            <span className="text-accent">on this channel.</span>
          </>
        }
        body="That page does not exist — the link may be wrong, or whatever was here has moved. The archive is still nine thousand films deep."
        actions={
          <>
            <ErrorPrimaryAction href="/">Roll a film</ErrorPrimaryAction>
            <ErrorSecondaryAction href="/browse">Browse the archive</ErrorSecondaryAction>
          </>
        }
      />
    </div>
  );
}
