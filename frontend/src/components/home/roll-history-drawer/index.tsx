"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRollHistory } from "@/components/home/roll-history-drawer/useRollHistory";
import { FilmStripEdge } from "@/components/home/roll-history-drawer/film-strip-edge";
import { DrawerHeader } from "@/components/home/roll-history-drawer/drawer-header";
import { EmptyReel } from "@/components/home/roll-history-drawer/empty-reel";
import { RollHistoryList } from "@/components/home/roll-history-drawer/roll-history-list";

export function RollHistoryDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const visibleHistory = useRollHistory(open);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.button
            type="button"
            aria-label="Close history"
            className="fixed inset-0 z-[80] bg-black/75 backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
          />

          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="roll-history-title"
            className="fixed right-0 top-0 z-[90] flex h-screen w-full max-w-[440px] flex-col overflow-hidden bg-[#05050a] text-[#F5F5F0]"
            style={{
              boxShadow:
                "-1px 0 0 rgba(232,69,60,0.12), -40px 0 120px rgba(0,0,0,0.98)",
            }}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 340, damping: 36 }}
          >
            {/* Atmospheric glows */}
            <div
              className="pointer-events-none absolute -left-24 -top-24 z-0 h-72 w-72 rounded-full bg-[#e8453c] opacity-[0.09] blur-[80px]"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute bottom-0 right-0 z-0 h-56 w-56 rounded-full bg-[#D4AF37] opacity-[0.04] blur-[90px]"
              aria-hidden
            />

            <FilmStripEdge />

            <DrawerHeader count={visibleHistory.length} onClose={onClose} />

            {/* Scroll area */}
            <div className="relative z-10 flex-1 overflow-y-auto pt-2 pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {visibleHistory.length === 0 ? (
                <EmptyReel />
              ) : (
                <RollHistoryList films={visibleHistory} onNavigate={onClose} />
              )}
            </div>

            <FilmStripEdge />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
