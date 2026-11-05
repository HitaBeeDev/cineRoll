"use client";

import { createContext } from "react";
import type { DemoFilm } from "./making-of-types";

/**
 * The film the hero demo last landed on, and whether the visitor rolled at all
 * (the closing backdrop only appears after a real interaction).
 */
export const RolledFilmContext = createContext<{
  film: DemoFilm | null;
  rolled: boolean;
  setFilm: (film: DemoFilm) => void;
}>({ film: null, rolled: false, setFilm: () => {} });
