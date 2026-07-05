import type { Metadata } from "next";
import { Suspense } from "react";
import { BlindRollContent } from "./blind-roll-content";
import { BlindRollFallback } from "./blind-roll-fallback";

const BLIND_ROLL_TITLE = "Blind Roll — Guess the Award-Winning Film";
const BLIND_ROLL_DESC =
  "Play Blind Roll: identify a hidden award-winning film from its cast, director, and Oscar, Golden Globe, Cannes, and Berlinale clues. A daily film-guessing challenge from CineRoll.";
const BLIND_ROLL_OG = `/api/og?title=${encodeURIComponent("Blind Roll")}&subtitle=${encodeURIComponent("Guess the hidden award-winning film from its clues.")}`;

export const metadata: Metadata = {
  title: BLIND_ROLL_TITLE,
  description: BLIND_ROLL_DESC,
  // Temporarily hidden from nav — don't index while the feature is off.
  robots: { index: false, follow: false },
  openGraph: {
    title: BLIND_ROLL_TITLE,
    description: BLIND_ROLL_DESC,
    type: "website",
    images: [{ url: BLIND_ROLL_OG, width: 1200, height: 630, alt: BLIND_ROLL_TITLE }],
  },
  twitter: {
    card: "summary_large_image",
    title: BLIND_ROLL_TITLE,
    description: BLIND_ROLL_DESC,
    images: [{ url: BLIND_ROLL_OG, width: 1200, height: 630, alt: BLIND_ROLL_TITLE }],
  },
};

export default function BlindRollPage() {
  return (
    <Suspense fallback={<BlindRollFallback />}>
      <BlindRollContent />
    </Suspense>
  );
}
