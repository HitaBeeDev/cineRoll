import type { ReactNode } from "react";
import { Reveal } from "@/components/cinematic/reveal";

/**
 * A chapter of the Making Of tour with its own container. Two compositions so
 * consecutive chapters don't repeat: "wide" (heading left, content full width)
 * and "centered" (heading, lede and content on a narrow centered column).
 * No divider lines — chapters are separated by space and background.
 */
export function AboutChapter({
  number,
  title,
  lede,
  layout = "wide",
  children,
}: {
  number: string;
  title: string;
  lede?: ReactNode;
  layout?: "wide" | "centered";
  children: ReactNode;
}) {
  const centered = layout === "centered";
  return (
    <section className={`mx-auto px-6 py-16 lg:px-10 lg:py-24 ${centered ? "max-w-3xl text-center" : "max-w-6xl"}`}>
      <Reveal>
        <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.2em] text-accent">
          Reel {number}
        </p>
        <h2
          className={`mt-3 font-[family-name:var(--font-display)] text-3xl font-bold leading-tight tracking-tight text-fg-hi sm:text-5xl ${centered ? "" : "max-w-3xl"}`}
        >
          {title}
        </h2>
        {lede && (
          <div
            className={`mt-5 space-y-4 text-base leading-7 text-fg-dim sm:text-[17px] sm:leading-8 ${centered ? "mx-auto max-w-xl" : "max-w-2xl"}`}
          >
            {lede}
          </div>
        )}
      </Reveal>
      <div className={`mt-10 ${centered ? "text-left" : ""}`}>{children}</div>
    </section>
  );
}
