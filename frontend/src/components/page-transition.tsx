"use client";

import { motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useState } from "react";

/**
 * A scene cut between routes: a dark panel makes one pass across the viewport
 * on arrival.
 *
 * It is a wipe over the page rather than an exit animation on the page. The
 * alternative — keying the children by pathname inside AnimatePresence — holds
 * the previous route mounted while the next one renders, which fights
 * streaming, doubles the work of every navigation and loses scroll restoration.
 * This costs one element and changes nothing about how routes render.
 *
 * The pathname has already changed by the time the panel moves, so it makes a
 * single uninterrupted pass rather than covering the new page and uncovering
 * it. A curtain that closes on a page already on screen and then opens on the
 * same page is a delay; a wipe passing over it is a cut.
 *
 * The route is compared during render rather than in an effect, so the panel is
 * in its starting position in the same commit that shows the new route — an
 * effect would paint one frame of the new page before the wipe began.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();
  const [lastPath, setLastPath] = useState(pathname);
  const [cutKey, setCutKey] = useState<string | null>(null);

  if (lastPath !== pathname) {
    setLastPath(pathname);
    // The first paint is an arrival too, but nobody navigated to it — starting
    // from the current path means a cold load never wipes.
    if (!reducedMotion) setCutKey(pathname);
  }

  return (
    // flex-1 (not min-h-screen) so the content area fills the viewport *minus* the
    // footer — the canonical sticky-footer pattern. min-h-0 lets a child page run
    // its own internal scroll/overflow (e.g. the describe cockpit).
    <div className="flex min-h-0 flex-1 flex-col bg-ink-900">
      {children}
      {cutKey && (
        <motion.div
          key={cutKey}
          aria-hidden
          className="pointer-events-none fixed inset-0 z-[200] bg-[linear-gradient(90deg,#050509,#0d0d18_55%,#050509)]"
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{ duration: 0.62, ease: [0.76, 0, 0.24, 1] }}
          onAnimationComplete={() => setCutKey(null)}
        />
      )}
    </div>
  );
}
