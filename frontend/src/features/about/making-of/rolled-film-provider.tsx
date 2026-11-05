"use client";

import { useMemo, useState, type ReactNode } from "react";
import type { DemoFilm } from "./making-of-types";
import { RolledFilmContext } from "./rolled-film-context";

export function RolledFilmProvider({ children }: { children: ReactNode }) {
  const [film, setFilmState] = useState<DemoFilm | null>(null);
  const [rolled, setRolled] = useState(false);
  const value = useMemo(
    () => ({
      film,
      rolled,
      setFilm: (next: DemoFilm) => {
        setFilmState(next);
        setRolled(true);
      },
    }),
    [film, rolled],
  );
  return <RolledFilmContext.Provider value={value}>{children}</RolledFilmContext.Provider>;
}
