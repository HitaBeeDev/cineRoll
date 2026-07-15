import { motion, useReducedMotion } from "framer-motion";
import type { PickCardProps } from "../component-props";
import { PickBackdrop } from "./pick-backdrop";
import { PickCardContent } from "./pick-card-content";
import { PicksPageContext } from "./picks-page-context";

export function PickCard({ pick, index, dateLabel }: PickCardProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.article
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={
        shouldReduceMotion
          ? { duration: 0 }
          : { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
      }
      className="group relative flex min-h-[100svh] items-end overflow-hidden"
    >
      <PickBackdrop film={pick.film} priority={index === 0} />
      {index === 0 && <PicksPageContext dateLabel={dateLabel} />}
      <PickCardContent pick={pick} />
    </motion.article>
  );
}
