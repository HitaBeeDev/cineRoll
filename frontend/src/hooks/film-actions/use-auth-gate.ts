"use client";

import { useState } from "react";
import { clearPendingFilmAction } from "@/lib/pending-intent/clear-pending-film-action";
import { setPendingFilmAction } from "@/lib/pending-intent/set-pending-film-action";
import type { AuthGate } from "./types";

export function useAuthGate(filmId: string) {
  const [authPrompt, setAuthPrompt] = useState<AuthGate | null>(null);

  function triggerAuthGate(gate: AuthGate): void {
    setPendingFilmAction(filmId, gate);
    setAuthPrompt(gate);
  }

  function closeAuthPrompt(): void {
    setAuthPrompt(null);
    clearPendingFilmAction(filmId);
  }

  return { authPrompt, triggerAuthGate, closeAuthPrompt };
}
