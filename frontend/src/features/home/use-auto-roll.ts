"use client";

import { useEffect, useState } from "react";

export function useAutoRoll(onRoll: () => void) {
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!pending) return;
    const timer = window.setTimeout(() => {
      setPending(false);
      onRoll();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [pending, onRoll]);

  return { requestAutoRoll: () => setPending(true) };
}
