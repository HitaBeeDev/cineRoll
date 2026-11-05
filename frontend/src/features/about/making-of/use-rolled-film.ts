"use client";

import { useContext } from "react";
import { RolledFilmContext } from "./rolled-film-context";

export function useRolledFilm() {
  return useContext(RolledFilmContext);
}
