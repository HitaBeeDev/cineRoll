"use client";

import { useEffect, useState } from "react";
import {
  fetchAwardYears,
  fetchCategories,
  fetchCountries,
  fetchGenres,
  fetchLanguages,
  fetchReleaseYears,
} from "@/lib/api";

export type BrowseFacetOptions = {
  genres: string[];
  countries: string[];
  languages: string[];
  categories: string[];
  awardYears: number[];
  /** Every release year present in the catalogue — the year-range selects are built from it. */
  releaseYears: number[];
};

/** Loads the static facet option lists that populate the advanced filter panel. */
export function useBrowseFacetOptions(): BrowseFacetOptions {
  const [genres,     setGenres]     = useState<string[]>([]);
  const [countries,  setCountries]  = useState<string[]>([]);
  const [languages,  setLanguages]  = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [awardYears, setAwardYears] = useState<number[]>([]);
  const [releaseYears, setReleaseYears] = useState<number[]>([]);

  useEffect(() => {
    void fetchGenres().then(setGenres);
    void fetchCountries().then(setCountries);
    void fetchLanguages().then(setLanguages);
    void fetchCategories().then(setCategories);
    void fetchAwardYears().then(setAwardYears);
    void fetchReleaseYears().then(setReleaseYears);
  }, []);

  return { genres, countries, languages, categories, awardYears, releaseYears };
}
