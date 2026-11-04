import { motion } from "framer-motion";
import type { MotionPreferenceProps } from "../component-props";
import { PicksPageContext } from "./picks-page-context";

// The page heading is drawn here too, not only on the first loaded card: this is
// what the server renders, so without it the page had no <h1> for search engines.
export function PicksLoading({
  shouldReduceMotion,
  dateLabel,
}: MotionPreferenceProps & { dateLabel: string }) {
  return (
    <motion.div
      key="loading"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{
        opacity: 0,
        transition: {
          duration: shouldReduceMotion ? 0 : 0.15,
          ease: "easeIn",
        },
      }}
      transition={{
        duration: shouldReduceMotion ? 0 : 0.2,
        ease: "easeOut",
      }}
      className="relative flex min-h-[100svh] items-center justify-center"
    >
      <PicksPageContext dateLabel={dateLabel} />
      <div className="flex flex-col items-center gap-4">
        <div className="flex gap-2">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="h-[3px] w-8 rounded-full bg-white/30"
              animate={
                shouldReduceMotion ? {} : { opacity: [0.15, 0.7, 0.15] }
              }
              transition={{
                duration: 1.4,
                repeat: Infinity,
                delay: index * 0.18,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
        <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.3em] text-[#7a7a90]">
          Curating today&apos;s selection
        </p>
      </div>
    </motion.div>
  );
}
