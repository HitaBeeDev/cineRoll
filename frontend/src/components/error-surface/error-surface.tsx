import type { ReactNode } from "react";

/**
 * The shared look for every page that has nothing to show: a crash, a 404, a
 * route that failed to load.
 *
 * It speaks the projector's language rather than the browser's. A dead frame
 * with its sprocket holes and a "no signal" caption is the same object the roll
 * stutters to a halt on, so a failure reads as part of the product instead of a
 * hole in it — and, more practically, it is unmistakably still CineRoll rather
 * than a white page with a triangle on it.
 */
export function ErrorSurface({
  label,
  heading,
  body,
  actions,
  detail,
}: {
  /** The mono strip above the heading — the channel-style status line. */
  label: string;
  heading: ReactNode;
  body: string;
  actions: ReactNode;
  /** Diagnostics, when there are any worth showing. */
  detail?: ReactNode;
}) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-5 py-16">
      <DeadFrame />

      <p className="mt-9 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.4em] text-accent/80">
        {label}
      </p>

      <h1 className="mt-4 text-center font-[family-name:var(--font-display)] text-[2.4rem] font-bold leading-tight text-fg-hi sm:text-[3rem]">
        {heading}
      </h1>

      <p className="mt-4 max-w-[34rem] text-center text-[15px] leading-relaxed text-fg-muted">
        {body}
      </p>

      <div className="mt-9 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
        {actions}
      </div>

      {detail}
    </main>
  );
}

/** A frame of film with nothing exposed on it. */
function DeadFrame() {
  return (
    <div
      aria-hidden
      className="relative flex h-[132px] w-[210px] items-center justify-between overflow-hidden rounded-lg border border-edge-subtle bg-[#07070d]"
    >
      <Sprockets />
      <div className="flex flex-1 items-center justify-center">
        <span className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.34em] text-[#6a6a80]">
          No signal
        </span>
      </div>
      <Sprockets />
      {/* The same grain the reel wears while it runs, held still. */}
      <span
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitchTiles'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundSize: "180px 180px",
        }}
      />
    </div>
  );
}

function Sprockets() {
  return (
    <span className="flex h-full w-[26px] shrink-0 flex-col items-center justify-around bg-[#050509] py-3.5">
      <span className="h-[13px] w-[9px] rounded-[2px] bg-[#1c1c29]" />
      <span className="h-[13px] w-[9px] rounded-[2px] bg-[#1c1c29]" />
      <span className="h-[13px] w-[9px] rounded-[2px] bg-[#1c1c29]" />
    </span>
  );
}
