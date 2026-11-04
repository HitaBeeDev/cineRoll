"use client";

import { useEffect, useRef } from "react";

/** Space rolls, unless `enabled` is false (e.g. while the onboarding layer is open). */
export function useSpaceRollShortcut(onRoll: () => void, enabled = true): void {
  const rollRef = useRef(onRoll);
  useEffect(() => { rollRef.current = onRoll; }, [onRoll]);

  useEffect(() => {
    if (!enabled) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      const tag = document.activeElement?.tagName;
      if (event.code !== "Space" || event.repeat || ["INPUT", "TEXTAREA", "BUTTON"].includes(tag ?? "")) return;
      event.preventDefault();
      rollRef.current();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enabled]);
}
