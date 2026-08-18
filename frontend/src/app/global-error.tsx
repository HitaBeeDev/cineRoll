"use client";

import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import { ErrorPrimaryAction } from "@/components/error-surface/error-primary-action";
import { ErrorSurface } from "@/components/error-surface/error-surface";
import "./globals.css";

// global-error replaces the root layout when it fires, so the fonts, the
// stylesheet and the <html>/<body> shell all have to be declared again here —
// nothing above this file is still rendering.
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const playfairDisplay = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "700"],
});

/**
 * The last boundary: a failure in the root layout itself.
 *
 * Rare, and worth having anyway — this is the case where the header, the footer
 * and the providers are all gone, so there is no navigation to offer and a full
 * reload genuinely is the way out. No `metadata` export is possible in a client
 * component, hence the `<title>` element.
 */
export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <html
      lang="en"
      dir="ltr"
      data-theme="dark"
      className={`${geistSans.variable} ${geistMono.variable} ${playfairDisplay.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-ink-900 text-fg-hi">
        <title>Something went wrong | CineRoll</title>
        <ErrorSurface
          label="// Projector down"
          heading={
            <>
              CineRoll
              <br />
              <span className="text-accent">went dark.</span>
            </>
          }
          body="The whole page failed to start, not just the part you were on. Reloading should bring it back."
          actions={<ErrorPrimaryAction onClick={() => unstable_retry()}>Reload CineRoll</ErrorPrimaryAction>}
          detail={
            error.digest ? (
              <p className="mt-10 font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.28em] text-fg-faint">
                Ref {error.digest}
              </p>
            ) : null
          }
        />
      </body>
    </html>
  );
}
