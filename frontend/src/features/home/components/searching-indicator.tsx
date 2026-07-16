"use client";

import { AnimatePresence, motion } from "framer-motion";

export function SearchingIndicator({ count, visible }: { count: number | null; visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && <motion.p key="searching" initial={{ opacity: 0, y: -3 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -3 }} transition={{ duration: 0.08 }} className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.25em] text-[#888899]">Searching{count !== null ? ` ${count}` : ""} films…</motion.p>}
    </AnimatePresence>
  );
}
