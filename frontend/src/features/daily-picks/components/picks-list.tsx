import { motion } from "framer-motion";
import type { PicksListProps } from "../component-props";
import { PickCard } from "./pick-card";

export function PicksList({
  picks,
  dateLabel,
  shouldReduceMotion,
}: PicksListProps) {
  return (
    <motion.div
      key="picks"
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
        duration: shouldReduceMotion ? 0 : 0.25,
        ease: "easeOut",
      }}
    >
      {picks.map((pick, index) => (
        <PickCard
          key={pick.film.id}
          pick={pick}
          index={index}
          dateLabel={dateLabel}
        />
      ))}
    </motion.div>
  );
}
