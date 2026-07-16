"use client";

import { useEffect, useRef } from "react";

export function useSpaceRollShortcut(onRoll: () => void): void {
  const rollRef = useRef(onRoll);
  useEffect(() => { rollRef.current = onRoll; }, [onRoll]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const tag = document.activeElement?.tagName;
      if (event.code !== "Space" || event.repeat || ["INPUT", "TEXTAREA", "BUTTON"].includes(tag ?? "")) return;
      event.preventDefault();
      rollRef.current();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
}
