"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { fetchAutocomplete, type AutocompleteResult } from "@/lib/api";
import { trackEvent } from "@/lib/analytics";
import type { SetFilters } from "@/lib/browse/filter-descriptors";

export type BrowseAutocomplete = {
  results: AutocompleteResult | null;
  open: boolean;
  activeIndex: number;
  listboxId: string;
  containerRef: React.RefObject<HTMLDivElement | null>;
  select: (index: number) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onFocus: () => void;
  setActiveIndex: (index: number) => void;
};

/**
 * Search autocomplete: debounced fetch (200ms) of film/person suggestions,
 * arrow-key navigation, outside-click dismissal, and one `search` analytics
 * event per settled query. Selecting a suggestion commits it via `setFilters`.
 */
export function useBrowseAutocomplete(search: string, setFilters: SetFilters): BrowseAutocomplete {
  const [results, setResults] = useState<AutocompleteResult | null>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = search.trim();
    if (q.length < 2) {
      const timer = window.setTimeout(() => {
        setResults(null);
        setOpen(false);
      }, 0);
      return () => window.clearTimeout(timer);
    }
    const timer = window.setTimeout(() => {
      void fetchAutocomplete(q).then((data) => {
        setResults(data);
        setOpen(data.films.length + data.people.length > 0);
        setActiveIndex(-1);
      });
    }, 200);
    return () => window.clearTimeout(timer);
  }, [search]);

  // One `search` event per settled query rather than one per keystroke. Seeded
  // from the initial URL search so landing on a shared link isn't counted.
  const lastTrackedSearch = useRef(search);
  useEffect(() => {
    const q = search.trim();
    if (q.length < 2) {
      lastTrackedSearch.current = search;
      return;
    }
    const timer = window.setTimeout(() => {
      if (search === lastTrackedSearch.current) return;
      lastTrackedSearch.current = search;
      trackEvent({ type: "search", context: { source: "browse", query: search } });
    }, 500);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const select = useCallback((index: number) => {
    if (!results) return;
    if (index < results.films.length) {
      const film = results.films[index];
      if (film) setFilters({ search: film.title, person: "", page: 1 });
    } else {
      const person = results.people[index - results.films.length];
      if (person) setFilters({ person: person.name, search: "", page: 1 });
    }
    setOpen(false);
    setActiveIndex(-1);
  }, [results, setFilters]);

  const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || !results) return;
    const total = results.films.length + results.people.length;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % total);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev <= 0 ? total - 1 : prev - 1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      select(activeIndex);
    } else if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  }, [open, results, activeIndex, select]);

  const onFocus = useCallback(() => {
    if (results && results.films.length + results.people.length > 0) setOpen(true);
  }, [results]);

  return { results, open, activeIndex, listboxId, containerRef, select, onKeyDown, onFocus, setActiveIndex };
}
