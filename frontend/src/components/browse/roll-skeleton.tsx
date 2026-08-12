"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * The wait between asking for a roll and getting one.
 *
 * It is the shape of the answer, greyed out — same poster block, same title
 * block, same two columns. That does two jobs a standalone animation could not:
 * the panel is the same height before and after the film lands, so nothing on
 * the page moves when it does, and the empty box reads as a card arriving
 * rather than as a small graphic adrift in a large frame.
 *
 * One animation, not four: a single sweep across the whole skeleton. And no
 * countdown — a 3·2·1 that has to stop at 1 while the request runs on is a
 * progress bar that lies.
 */
function Block({ className }: { className: string }) {
  return <div className={`rounded bg-white/[0.045] ${className}`} />;
}

export function RollSkeleton() {
  const reducedMotion = useReducedMotion() ?? false;

  return (
    <div className="relative overflow-hidden" aria-hidden>
      {!reducedMotion && (
        <motion.div
          className="pointer-events-none absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/[0.035] to-transparent"
          animate={{ x: ["-120%", "320%"] }}
          transition={{ duration: 1.6, ease: "easeInOut", repeat: Infinity }}
        />
      )}

      {/* Header band: poster, the identity lines beside it, the ratings closing
          the right edge — the full width, as the card uses it. */}
      <div className="flex gap-3 p-3">
        <div className="w-[38%] max-w-[100px] shrink-0" style={{ aspectRatio: "2/3" }}>
          <Block className="h-full w-full" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2 py-1">
          <Block className="h-3 w-40" />
          <Block className="h-7 w-3/5" />
          <Block className="h-3 w-44" />
        </div>
        <div className="ml-auto hidden w-[13rem] shrink-0 grid-cols-2 gap-2 self-start pl-4 lg:grid">
          <Block className="h-[62px]" />
          <Block className="h-[62px]" />
        </div>
      </div>

      {/* Body: evidence in the open column, controls in the rail. */}
      <div className="grid gap-x-8 gap-y-4 px-4 pb-4 pt-3 lg:grid-cols-[minmax(0,1fr)_22rem]">
        {/* The plot, which is all the evidence column carries here. */}
        <div className="flex min-w-0 flex-col gap-2">
          <Block className="h-3 w-full" />
          <Block className="h-3 w-full" />
          <Block className="h-3 w-4/5" />
        </div>

        <div className="flex min-w-0 flex-col gap-3">
          <Block className="h-[42px]" />
          <div className="grid grid-cols-2 gap-2">
            <Block className="h-8" />
            <Block className="h-8" />
          </div>
          <Block className="h-3 w-36" />
          <div className="grid grid-cols-2 gap-2">
            <Block className="h-9" />
            <Block className="h-9" />
            <Block className="h-9" />
            <Block className="h-9" />
          </div>
        </div>
      </div>
    </div>
  );
}
