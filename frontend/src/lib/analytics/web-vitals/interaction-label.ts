type EventEntry = PerformanceEntry & { target?: Node | null };

/**
 * Which control an INP came from: the nearest `data-vital` tag around the
 * slowest interaction's target ("home-roll", "browse-filters"). "untagged"
 * when it has no tag, "detached" when React removed the element before the
 * metric was read — common for a button that re-renders as it is clicked.
 */
export function interactionLabel(entries: PerformanceEntry[]): string {
  const slowest = [...entries as EventEntry[]].sort((a, b) => b.duration - a.duration)[0];
  const target = slowest?.target;
  if (!target) return "detached";
  const element = target instanceof Element ? target : target.parentElement;
  return element?.closest("[data-vital]")?.getAttribute("data-vital") ?? "untagged";
}
