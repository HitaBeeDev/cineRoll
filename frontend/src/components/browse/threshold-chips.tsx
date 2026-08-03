import { ChipGroup } from "@/components/browse/chip-group";
import { FilterChip } from "@/components/browse/filter-chip";

/**
 * A single-choice row of threshold chips (IMDb 7+, ≤ 2h, 5+ noms …).
 *
 * There is deliberately no "Any" chip: no highlighted chip already means no
 * constraint, and clicking the active chip clears it. That keeps the accent
 * colour meaning exactly one thing — "this filter is cutting your results" —
 * instead of six red "Any" pills glowing over an unfiltered catalogue. Users who
 * miss the click-to-clear still have the ✕ on the active-filter chip bar above.
 */
export function ThresholdChips<T extends number>({
  ariaLabel,
  options,
  value,
  onSelect,
}: {
  ariaLabel: string;
  options: { value: T; label: string }[];
  /** null = no constraint (no chip highlighted). */
  value: T | null;
  onSelect: (next: T | null) => void;
}) {
  return (
    <ChipGroup label={ariaLabel}>
      {options.map((option) => {
        const active = value === option.value;
        return (
          <FilterChip
            key={option.value}
            active={active}
            onClick={() => onSelect(active ? null : option.value)}
          >
            {option.label}
          </FilterChip>
        );
      })}
    </ChipGroup>
  );
}
