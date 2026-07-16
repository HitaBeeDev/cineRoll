"use client";

import { useCallback, useState } from "react";
import {
  readPersonalizedRollPreference,
  writePersonalizedRollPreference,
} from "./personalized-roll-storage";

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
