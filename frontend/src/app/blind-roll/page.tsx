import { Suspense } from "react";
import { BlindRollContent } from "./blind-roll-content";
import { BlindRollFallback } from "./blind-roll-fallback";

export default function BlindRollPage() {
  return (
    <Suspense fallback={<BlindRollFallback />}>
      <BlindRollContent />
    </Suspense>
  );
}
