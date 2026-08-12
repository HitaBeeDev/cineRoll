"use client";

import { useEffect, useState } from "react";
import type { FacetCounts, FilterState } from "@cineroll/types";
import { MultiSelect } from "@/components/ui/multi-select";
import { formatGenre } from "@/lib/format/format-genre";
import { PanelBand } from "@/components/browse/panel-band";
import { CONTROL_WIDTH } from "@/components/browse/panel-section/control-width";
import { PanelSection } from "@/components/browse/panel-section/panel-section";
import { ChipGroup } from "@/components/browse/chip-group";
import { FilterChip } from "@/components/browse/filter-chip";
import { FilterSelect } from "@/components/browse/filter-select";
import { SegmentedControl } from "@/components/browse/segmented-control";
import { ThresholdChips } from "@/components/browse/threshold-chips";
import { CONTENT_TYPE_OPTIONS } from "@/lib/browse/options/content-type-options";
import { toggleValue } from "@/lib/browse/filter-updates/toggle-value";
import { setRuntimeMax } from "@/lib/browse/bounds/set-runtime-max";
import { setRuntimeMin } from "@/lib/browse/bounds/set-runtime-min";
import type { RuntimeBounds } from "@/lib/browse/bounds/runtime-bounds";
import { countOf } from "@/lib/browse/facet-options/count-of";
import { reachableOptions } from "@/lib/browse/facet-options/reachable-options";
import { reachableYears } from "@/lib/browse/facet-options/reachable-years";
import { ANY_YEAR } from "@/lib/browse/year-range/any-year";
import { decadeToYearRange } from "@/lib/browse/year-range/decade-to-year-range";
import { decadesFromYears } from "@/lib/browse/year-range/decades-from-years";
import { parseYear } from "@/lib/browse/year-range/parse-year";
import { setYearMax } from "@/lib/browse/year-range/set-year-max";
import { setYearMin } from "@/lib/browse/year-range/set-year-min";
import { yearRangeToDecade } from "@/lib/browse/year-range/year-range-to-decade";
import type { SetFilters } from "@/lib/browse/filter-descriptors/set-filters";

const IMDB_OPTIONS = [6, 6.5, 7, 7.5, 8, 8.5, 9].map((r) => ({ value: r, label: `${r}+` }));

const RT_OPTIONS = [50, 60, 70, 80, 90, 95].map((s) => ({ value: s, label: `${s}%+` }));

/** The content-type value the TV Type control hangs off (see CONTENT_TYPE_OPTIONS). */
const TV_SERIES_TYPE = "tv-series";

/** Select-option value standing in for "no constraint" — a select can't hold "". */
const ANY_TV_TYPE = "_any";

const GENRE_MATCH_OPTIONS: { value: "any" | "all"; label: string }[] = [
  { value: "any", label: "Any of these" },
  { value: "all", label: "All of these" },
];

const RUNTIME_MAX_OPTIONS = [
  { value: 90, label: "≤ 90m" },
  { value: 120, label: "≤ 2h" },
  { value: 150, label: "≤ 2h30" },
  { value: 180, label: "≤ 3h" },
];

/**
 * The floor the cap never had. It starts at 40m because that is where the
 * catalogue's shorts end and its features begin — "≥ 40m" is how you ask for a
 * film rather than a nominated short, which no other control here says. Above
 * that it mirrors the caps, so a min and a max chosen from the two rows read as
 * one range.
 */
const RUNTIME_MIN_OPTIONS = [
  { value: 40, label: "≥ 40m" },
  { value: 90, label: "≥ 90m" },
  { value: 120, label: "≥ 2h" },
  { value: 150, label: "≥ 2h30" },
];

/** How long the runtime note stays up. Long enough to read a short sentence
 *  after the eye has gone back to the chip it just clicked. */
const RUNTIME_NOTE_MS = 5000;

function chipLabel(options: { value: number; label: string }[], value: number): string {
  return options.find((option) => option.value === value)?.label ?? `${value}m`;
}

/** What the film IS: format, subject, era, and how well it scored. */
export function FilmBand({
  filters,
  setFilters,
  activeCount,
  counts,
  collapsible = false,
}: {
  filters: FilterState;
  setFilters: SetFilters;
  activeCount: number;
  counts: FacetCounts;
  collapsible?: boolean;
}) {
  // Keyed rather than a bare string: picking the same contradicting chip twice
  // must re-arm the timer, and two identical strings are the same state.
  const [runtimeNote, setRuntimeNote] = useState<{ text: string; key: number } | null>(null);

  useEffect(() => {
    if (!runtimeNote) return;
    const timer = window.setTimeout(() => setRuntimeNote(null), RUNTIME_NOTE_MS);
    return () => window.clearTimeout(timer);
  }, [runtimeNote]);

  /** Applies one end of the runtime range, and says so when setting it dropped
   *  the other end (see bounds.ts). Only the bound the user did not touch can be
   *  dropped this way, so clearing a chip on purpose never triggers the note. */
  const applyRuntime = (next: RuntimeBounds, dropped: string | null) => {
    setRuntimeNote(dropped ? { text: `Cleared ${dropped} — no film is both.`, key: Date.now() } : null);
    setFilters({ ...next, page: 1 });
  };

  const onRuntimeMin = (value: number | null) => {
    const next = setRuntimeMin(filters, value);
    const dropped =
      filters.runtimeMax != null && next.runtimeMax == null
        ? chipLabel(RUNTIME_MAX_OPTIONS, filters.runtimeMax)
        : null;

    applyRuntime(next, dropped);
  };

  const onRuntimeMax = (value: number | null) => {
    const next = setRuntimeMax(filters, value);
    const dropped =
      filters.runtimeMin != null && next.runtimeMin == null
        ? chipLabel(RUNTIME_MIN_OPTIONS, filters.runtimeMin)
        : null;

    applyRuntime(next, dropped);
  };

  const genreOptions = reachableOptions(counts.genres, filters.genres, formatGenre);
  const tvTypeOptions = reachableOptions(
    counts.tvTypes,
    filters.tvType ? [filters.tvType] : [],
    (value) => value,
  );

  // The kind-of-television control only exists while television is in the result
  // set. Shown next to a movies-only selection it would be a dropdown that can
  // only empty the grid, and hiding it is also what makes the content-type chip
  // the thing that reveals it.
  const showTvType = filters.contentTypes.includes(TV_SERIES_TYPE);

  /** Leaving TV behind takes the TV-only filter with it, rather than leaving a
   *  constraint running under a control nobody can see any more. */
  const toggleContentType = (value: string) => {
    const contentTypes = toggleValue(filters.contentTypes, value);
    const droppedTv = value === TV_SERIES_TYPE && !contentTypes.includes(TV_SERIES_TYPE);

    setFilters({ contentTypes, ...(droppedTv ? { tvType: "" } : {}), page: 1 });
  };

  // Both bounds read from one list, so both are protected: narrowing one must
  // never strand the other on a year that has left the list holding it.
  const releaseYears = reachableYears(counts.releaseYears, filters.yearMin, filters.yearMax);
  const decades = decadesFromYears(releaseYears.map(({ year }) => year));
  const selectedDecade = yearRangeToDecade(filters);
  // No per-year counts on the bounds: these pick the ends of a range, and a count
  // for the single year 1994 says nothing about what "1994 – 2003" would return.
  const yearOptions = releaseYears.map(({ year }) => ({
    value: String(year),
    label: String(year),
  }));

  return (
    /* Two full rows of three, front-loaded. What a film IS — its format, its
       subject, its era — is what nearly every visit narrows by, so those three
       take the top row and the brighter caption; how long it runs and how it
       scored are refinements and take the second.

       Full rows are the point as much as the order. The band used to run three
       rows of pairs, which left a third of every row empty and made a panel with
       nothing much in it feel long to scroll — sparse and tall at once. Folding
       the runtime bounds into one control (they are one number) closed the gap
       that produced. The controls still sit in the panel's shared column track
       (see PanelSection's `startsRow`), so they stay aligned with the bands above
       and below rather than running on a grid of their own. */
    <PanelBand label="Film" activeCount={activeCount} collapsible={collapsible}>
      {/* Nature — what the film is. The kind-of-television select is stacked
          inside this cell rather than given a caption of its own: it refines the
          chip directly above it and exists only while that chip is on, which is
          the same shape as the genre match-mode control below. As its own
          section it was a fourth thing appearing and disappearing from the row,
          shunting everything after it a column sideways. */}
      <PanelSection label="Content Type" emphasis="primary" startsRow>
        <div className={`flex flex-col gap-2 ${CONTROL_WIDTH}`}>
          {/* Multi-select: nothing highlighted already means every type, so there
              is no "All" chip to keep in sync with the selection. */}
          <ChipGroup columns>
            {CONTENT_TYPE_OPTIONS.map(({ value, label }) => (
              <FilterChip
                key={value}
                active={filters.contentTypes.includes(value)}
                count={countOf(counts.contentTypes, value)}
                onClick={() => toggleContentType(value)}
              >
                {label}
              </FilterChip>
            ))}
          </ChipGroup>

          {showTvType && (
            <FilterSelect
              value={filters.tvType || ANY_TV_TYPE}
              onValueChange={(value) =>
                setFilters({ tvType: value === ANY_TV_TYPE ? "" : value, page: 1 })
              }
              ariaLabel="Kind of series"
              className="w-full text-fg-muted"
              options={[{ value: ANY_TV_TYPE, label: "Any kind of series" }, ...tvTypeOptions]}
            />
          )}
        </div>
      </PanelSection>

      {/* Two genres can be asked for two ways and the difference is the whole
          question: Romance OR Musical is a wide net, Romance AND Musical is a
          romantic musical. The switch appears only once a second genre makes the
          distinction real — before that both readings return the same films, and
          a control with no effect is one more thing to work out. */}
      <PanelSection label="Genre" emphasis="primary">
        <div className={`flex flex-col gap-2 ${CONTROL_WIDTH}`}>
          <MultiSelect
            selected={filters.genres}
            onChange={(vals) => setFilters({ genres: vals, page: 1 })}
            placeholder="Any genre"
            searchable
            triggerClassName="w-full"
            options={genreOptions}
          />

          {filters.genres.length > 1 && (
            <SegmentedControl
              options={GENRE_MATCH_OPTIONS}
              value={filters.genresMatchAll ? "all" : "any"}
              onChange={(mode) => setFilters({ genresMatchAll: mode === "all", page: 1 })}
              ariaLabel="How the selected genres combine"
              neutralValue="any"
            />
          )}
        </div>
      </PanelSection>

      {/* Time — when it is from. One heading for the era, because there is one
          filter: yearMin/yearMax. The decade select is a shortcut that writes ten
          years into the range below it and falls back to "Any decade" the moment
          those bounds are edited by hand — shown together, so the shortcut and
          what it did can't read as two competing era filters. The heading and the
          dash carry the range, so the bounds need no From/To captions (kept as
          aria-labels). */}
      <PanelSection label="Release Year" emphasis="primary">
        <div className={`flex flex-col gap-2 ${CONTROL_WIDTH}`}>
          <FilterSelect
            value={selectedDecade != null ? String(selectedDecade) : ANY_YEAR}
            onValueChange={(val) => {
              const decade = parseYear(val);
              setFilters({
                ...(decade == null ? { yearMin: null, yearMax: null } : decadeToYearRange(decade)),
                page: 1,
              });
            }}
            placeholder="Any decade"
            ariaLabel="Decade"
            className="w-full text-fg-muted"
            options={[
              { value: ANY_YEAR, label: "Any decade" },
              ...decades.map((d) => ({ value: String(d), label: `${d}s` })),
            ]}
          />

          <div className="flex items-center gap-2">
            <FilterSelect
              value={filters.yearMin != null ? String(filters.yearMin) : ANY_YEAR}
              onValueChange={(val) => setFilters({ ...setYearMin(filters, parseYear(val)), page: 1 })}
              ariaLabel="Year from"
              className="w-full flex-1 text-fg-muted"
              options={[{ value: ANY_YEAR, label: "Any" }, ...yearOptions]}
            />
            <span
              className="font-[family-name:var(--font-geist-mono)] text-[12px] text-edge-hover"
              aria-hidden
            >
              –
            </span>
            <FilterSelect
              value={filters.yearMax != null ? String(filters.yearMax) : ANY_YEAR}
              onValueChange={(val) => setFilters({ ...setYearMax(filters, parseYear(val)), page: 1 })}
              ariaLabel="Year to"
              className="w-full flex-1 text-fg-muted"
              options={[{ value: ANY_YEAR, label: "Any" }, ...yearOptions]}
            />
          </div>
        </div>
      </PanelSection>

      {/* Two bounds, one length — so one caption, the way Release Year and
          Ceremony Year already carry their two ends under one. As "Min Runtime"
          and "Max Runtime" they were two captions of equal weight for one
          number, which cost a grid cell that then had to be paid for with an
          empty one further down the band. The chips say which end they are: a row
          of ≥ over a row of ≤.

          The cap alone could only ask for something short, and "a proper long
          one, but not a four-hour one" is the other half of the same question.
          Two ends that contradict each other cannot both stand, so setting one
          drops the other (see bounds.ts) — and the line under the chips is what
          keeps that from looking like a chip deselecting itself. It holds its
          height empty so a note appearing does not shunt the rest of the row. */}
      <PanelSection label="Runtime" hint="at least / at most" startsRow>
        <div className="flex flex-col gap-1.5">
          <ThresholdChips
            ariaLabel="Minimum runtime"
            options={RUNTIME_MIN_OPTIONS}
            value={filters.runtimeMin}
            onSelect={onRuntimeMin}
          />
          <ThresholdChips
            ariaLabel="Maximum runtime"
            options={RUNTIME_MAX_OPTIONS}
            value={filters.runtimeMax}
            onSelect={onRuntimeMax}
          />
          <p
            aria-live="polite"
            className="min-h-4 font-[family-name:var(--font-geist-mono)] text-[11px] leading-4 text-caution"
          >
            {runtimeNote?.text ?? ""}
          </p>
        </div>
      </PanelSection>

      {/* Scores — one question asked of two sources, so they sit side by side in
          the same control at the same width, not one here and one a band away. */}
      <PanelSection label="IMDb Rating">
        <ThresholdChips
          ariaLabel="Minimum IMDb rating"
          options={IMDB_OPTIONS}
          // 0 is this filter's "unset" in FilterState, not a rating anyone picks.
          value={filters.imdbRatingMin || null}
          onSelect={(next) => setFilters({ imdbRatingMin: next ?? 0, page: 1 })}
        />
      </PanelSection>

      <PanelSection label="Rotten Tomatoes">
        <ThresholdChips
          ariaLabel="Minimum Rotten Tomatoes score"
          options={RT_OPTIONS}
          // 0 is this filter's "unset" in FilterState, not a score anyone picks.
          value={filters.rtScoreMin || null}
          onSelect={(next) => setFilters({ rtScoreMin: next ?? 0, page: 1 })}
        />
      </PanelSection>
    </PanelBand>
  );
}
