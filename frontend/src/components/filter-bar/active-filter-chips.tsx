import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ActiveFilterChip } from "@/components/filter-bar/active-chips";

/** The animated row of removable filter chips with a "Clear all" affordance. */
export function ActiveFilterChips({
  chips,
  onClearFilters,
}: {
  chips: ActiveFilterChip[];
  onClearFilters: () => void;
}) {
  return (
    <AnimatePresence>
      {chips.length > 0 && (
        <motion.div
          key="chips-row"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="-mt-1 mb-1 flex min-w-0 items-start gap-2"
        >
          <div className="relative flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
            <AnimatePresence mode="popLayout">
              {chips.map((chip) => (
                <motion.div
                  key={chip.key}
                  layout
                  initial={{ opacity: 0, scale: 0.85, y: 5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className={cn(
                    "inline-flex h-6 items-center gap-0 rounded-full",
                    "border border-[#25253a] bg-[#0d0d1a]",
                    "font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-wide text-[#9898b8]",
                  )}
                >
                  {chip.href && (
                    <Link
                      href={chip.href}
                      className="flex h-full items-center pl-2.5 pr-1 transition-colors hover:text-[#e8453c]"
                      title="View profile"
                    >
                      <ArrowUpRight className="h-3 w-3" aria-hidden />
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={chip.onRemove}
                    className={cn(
                      "flex h-full items-center gap-1 transition-colors hover:text-[#F5F5F0]",
                      "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#e8453c] focus-visible:rounded-full",
                      chip.href ? "pr-2.5" : "px-2.5",
                    )}
                    aria-label={`Remove ${chip.label} filter`}
                  >
                    {chip.label}
                    <X className="h-2.5 w-2.5 shrink-0 text-[#9090a8]" aria-hidden />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
            <button
              type="button"
              onClick={onClearFilters}
              className="ml-1 shrink-0 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-widest text-[#9090a8] transition-colors hover:text-[#e8453c] focus-visible:outline-none"
            >
              Clear all
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
