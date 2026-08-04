"use client";

import { useCallback, useState } from "react";
import { readPersonalizedRollPreference } from "@/features/home/personalized-roll-storage/read-personalized-roll-preference";
import { writePersonalizedRollPreference } from "@/features/home/personalized-roll-storage/write-personalized-roll-preference";

export function usePersonalizedRoll() {
  const [enabled, setEnabled] = useState(readPersonalizedRollPreference);

  const toggle = useCallback(() => {
    setEnabled((current) => {
      const next = !current;
      writePersonalizedRollPreference(next);
      return next;
    });
  }, []);

  return { personalizedRoll: enabled, togglePersonalizedRoll: toggle };
}
