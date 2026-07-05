import type { Metadata } from "next";
import { Suspense } from "react";
import { BlindRollContent } from "./blind-roll-content";
import { BlindRollFallback } from "./blind-roll-fallback";

export const metadata: Metadata = {
  title: "Blind Roll — Guess the Award-Winning Film",
  description:
    "Play Blind Roll: identify a hidden award-winning film from its cast, director, and Oscar, Golden Globe, Cannes, and Berlinale clues. A daily film-guessing challenge from CineRoll.",
};

export default function BlindRollPage() {
  return (
    <Suspense fallback={<BlindRollFallback />}>
      <BlindRollContent />
    </Suspense>
  );
}
