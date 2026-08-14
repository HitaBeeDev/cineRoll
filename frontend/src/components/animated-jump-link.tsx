"use client";

import type { MouseEvent, ReactNode } from "react";
import { animate, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils/cn";

type AnimatedJumpLinkProps = {
  children: ReactNode;
  href: `#${string}`;
};

export function AnimatedJumpLink({ children, href }: AnimatedJumpLinkProps) {
  const reduceMotion = useReducedMotion();

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    const target = document.querySelector<HTMLElement>(href);
    if (!target) return;

    event.preventDefault();

    const scrollMarginTop = Number.parseFloat(
      window.getComputedStyle(target).scrollMarginTop,
    );
    const targetY =
      target.getBoundingClientRect().top +
      window.scrollY -
      (Number.isFinite(scrollMarginTop) ? scrollMarginTop : 0);

    window.history.pushState(null, "", href);

    if (reduceMotion) {
      window.scrollTo({ top: targetY });
      return;
    }

    animate(window.scrollY, targetY, {
      duration: 0.9,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => window.scrollTo(0, latest),
    });
  }

  return (
    <motion.a
      href={href}
      onClick={handleClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 420, damping: 32 }}
      className={cn(
        "flex h-11 items-center justify-center rounded-xl px-3",
        "border border-accent/25 bg-accent/8 text-accent",
        "font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-widest",
        "transition-colors hover:border-accent/55 hover:bg-accent/12 hover:text-fg-hi",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
      )}
    >
      {children}
    </motion.a>
  );
}
