"use client";

import * as React from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFieldLabelling } from "@/components/ui/field-label-context";

export type MultiSelectOption = {
  value: string;
  label: string;
  /** Section this option is listed under. Sections appear in the order the
   *  options arrive in; one value may appear under several (see the categories
   *  facet, where a name is awarded by two ceremonies) and ticks in all of them,
   *  because selecting it filters on the name across every ceremony. */
  group?: string;
};

/** How many labels the trigger spells out before collapsing the rest into "+N". */
const SUMMARY_LABEL_LIMIT = 2;

/**
 * A lightweight multi-select dropdown (Radix's Select is single-value only). A
 * trigger opens an absolutely-positioned checkbox panel; clicking an option
 * toggles it in/out of `selected`. For long lists (genres, countries) the
 * optional `searchable` flag adds a type-to-filter input. Already-selected
 * options open pinned above the rest, so unticking one never means scrolling an
 * alphabetical list to hunt for it. Closes on outside click or Escape. Styles
 * are inline/Tailwind only — nothing leaks to global CSS.
 *
 * The trigger is a summary, never a control: one fixed-height line reading
 * "War, Thriller +3" plus a count, so the filter grid's rows can't reflow as
 * picks accumulate. Removing a pick belongs to the panel (untick, or Clear) and
 * to the active-filter chip bar above the grid — deliberately not to a third
 * set of chips inside the field, which left two competing remove affordances
 * for one filter and no authoritative one.
 */
export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Any",
  searchable = false,
  triggerClassName,
  ariaLabel,
  variant = "default",
}: {
  options: MultiSelectOption[];
  selected: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  searchable?: boolean;
  triggerClassName?: string;
  ariaLabel?: string;
  /** "pill" matches the FilterBar's PillToggle styling so the trigger sits
   *  inline with the other facet pills instead of as a boxed select. */
  variant?: "default" | "pill";
}) {
  const labelling = useFieldLabelling(ariaLabel);
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  // What was already selected when the panel opened — those options are pinned
  // to the top so a chosen genre isn't buried alphabetically. Captured on open
  // and NOT recomputed as the user clicks: repartitioning live would slide the
  // list under the cursor mid-scan and the next click would land on a different
  // option than the one aimed at.
  const [pinnedValues, setPinnedValues] = React.useState<string[]>([]);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const listboxId = React.useId();

  // The trigger is the only way in, so opening is where both per-session bits of
  // panel state get set: a cleared filter box and a fresh pin order.
  function togglePanel() {
    if (!open) {
      setQuery("");
      setPinnedValues(selected);
    }
    setOpen(v => !v);
  }

  React.useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const selectedSet = React.useMemo(() => new Set(selected), [selected]);

  function toggle(value: string) {
    onChange(
      selectedSet.has(value)
        ? selected.filter(v => v !== value)
        : [...selected, value],
    );
  }

  // Labels follow selection order, not the option list's — the summary reads as
  // a record of what the user picked. A value with no matching option still gets
  // a label (the raw value) so a stray filter is never invisible.
  const selectedLabels = selected.map(
    value => options.find(o => o.value === value)?.label ?? value,
  );

  // "War", then "War, Thriller", then "War, Thriller +3" — the head stays
  // readable at any selection size and the line height never changes.
  const summaryLabel = (() => {
    if (selected.length === 0) return placeholder;
    const head = selectedLabels.slice(0, SUMMARY_LABEL_LIMIT).join(", ");
    const overflow = selected.length - SUMMARY_LABEL_LIMIT;
    return overflow > 0 ? `${head} +${overflow}` : head;
  })();

  // Pill triggers sit in a tight row of facet pills, so they collapse harder:
  // one label plus a count, never two.
  const pillLabel = (() => {
    if (selected.length === 0) return placeholder;
    const firstLabel = selectedLabels[0];
    return selected.length === 1 ? firstLabel : `${firstLabel} +${selected.length - 1}`;
  })();

  const filtered = searchable && query.trim()
    ? options.filter(o => o.label.toLowerCase().includes(query.trim().toLowerCase()))
    : options;

  // Two groups, each keeping the source list's order. A pinned option that has
  // since been unchecked stays put until the panel is reopened, so unticking
  // something never makes it jump away from under the pointer.
  //
  // Pinned entries are deduped by value: an option listed under several sections
  // is still one selection, and pinning it once per section would show the same
  // tick two or three times at the top of the list.
  const { pinned, rest } = React.useMemo(() => {
    const pinnedSet = new Set(pinnedValues);
    const seen = new Set<string>();
    return {
      pinned: filtered.filter(o => {
        if (!pinnedSet.has(o.value) || seen.has(o.value)) return false;
        seen.add(o.value);
        return true;
      }),
      rest: filtered.filter(o => !pinnedSet.has(o.value)),
    };
  }, [filtered, pinnedValues]);

  // Sections for the unpinned remainder, in first-appearance order. A single
  // section means the grouping tells the user nothing they can't see, so the
  // headers are dropped rather than captioning the whole list with one label.
  const sections = React.useMemo(() => {
    const byGroup = new Map<string, MultiSelectOption[]>();
    for (const option of rest) {
      const key = option.group ?? "";
      const existing = byGroup.get(key);
      if (existing) existing.push(option);
      else byGroup.set(key, [option]);
    }

    return [...byGroup.entries()].map(([label, options]) => ({ label, options }));
  }, [rest]);
  const showGroupHeadings = sections.length > 1;

  const isPill = variant === "pill";

  const renderOption = (opt: MultiSelectOption) => {
    const isSelected = selectedSet.has(opt.value);
    return (
      <button
        key={opt.group ? `${opt.group}:${opt.value}` : opt.value}
        type="button"
        role="option"
        aria-selected={isSelected}
        onClick={() => toggle(opt.value)}
        className={cn(
          "flex w-full items-center gap-2.5 px-3 py-1.5 text-left text-[12px] transition-colors",
          isSelected ? "text-[#f1eff8]" : "text-[#a9a5bc] hover:bg-white/[0.05] hover:text-[#f1eff8]",
        )}
      >
        <span
          className={cn(
            "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
            isSelected ? "border-[#d8d8e2] bg-[#d8d8e2]" : "border-white/20",
          )}
          aria-hidden
        >
          {isSelected && <Check className="h-3 w-3 text-[#0c0c14]" />}
        </span>
        <span className="min-w-0 flex-1 truncate">{opt.label}</span>
      </button>
    );
  };

  return (
    <div ref={containerRef} className={cn("relative", isPill && "inline-flex")}>
      <button
        type="button"
        {...labelling}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        // Hover reveals the picks the "+N" swallowed, without opening the panel.
        title={selected.length > SUMMARY_LABEL_LIMIT ? selectedLabels.join(", ") : undefined}
        onClick={togglePanel}
        className={cn(
          isPill
            ? "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-widest transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c] focus-visible:ring-offset-1 focus-visible:ring-offset-[#09090f]"
            // Fixed height, single line: the field is a summary, so adding a
            // fifth genre must not push the rest of the filter grid down.
            : "flex h-10 w-full items-center justify-between gap-2 rounded-md border px-3 text-left text-[12px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]/40",
          selected.length === 0
            ? isPill
              ? "border-[#34344d] bg-[#0e0e1a] text-[#aaaac6] hover:border-[#6a6a85] hover:text-[#F5F5F0]"
              : "border-white/10 bg-white/[0.045] text-[#b8b5c8] hover:border-white/20"
            : isPill
              ? "border-[#d8d8e2] bg-[#d8d8e2] text-[#0c0c14]"
              : "border-[#5a5a72] bg-white/[0.08] text-[#F5F5F0]",
          triggerClassName,
        )}
      >
        <span className="min-w-0 truncate">{isPill ? pillLabel : summaryLabel}</span>
        <span className="flex shrink-0 items-center gap-1.5">
          {!isPill && selected.length > 1 && (
            <span className="rounded-full bg-white/10 px-1.5 py-px font-[family-name:var(--font-geist-mono)] text-[10px] leading-4 text-[#cfcbdd]">
              {selected.length}
            </span>
          )}
          <ChevronDown
            className={cn(
              "shrink-0 opacity-70 transition-transform",
              isPill ? "h-3.5 w-3.5" : "h-4 w-4",
              open && "rotate-180",
            )}
            aria-hidden
          />
        </span>
      </button>

      {open && (
        <div
          id={listboxId}
          role="listbox"
          aria-multiselectable
          className="absolute left-0 top-full z-50 mt-1 max-h-72 w-full min-w-[200px] overflow-hidden rounded-lg border border-white/12 bg-[#0e0d18] shadow-[0_16px_48px_rgba(0,0,0,0.6)]"
        >
          {searchable && (
            <div className="relative border-b border-white/[0.07] p-2">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#6f6b80]" aria-hidden />
              <input
                type="text"
                autoFocus
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Filter…"
                className="h-8 w-full rounded-md border border-white/10 bg-white/[0.04] pl-8 pr-2 text-[12px] text-[#f1eff8] outline-none placeholder:text-[#857f95] focus:border-white/35"
              />
            </div>
          )}
          {/* The count lives in the panel because the open panel covers the
              trigger that would otherwise carry it. */}
          {selected.length > 0 && (
            <div className="flex items-center justify-between gap-2 border-b border-white/[0.07] px-3 py-1.5">
              <span className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-widest text-[#857f95]">
                {selected.length} selected
              </span>
              <button
                type="button"
                onClick={() => onChange([])}
                className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-widest text-[#a9a5bc] transition-colors hover:text-[#ff766d] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#e8453c]"
              >
                Clear
              </button>
            </div>
          )}
          <div className="max-h-60 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <p className="px-3 py-2 font-[family-name:var(--font-geist-mono)] text-[11px] text-[#6f6b80]">No matches</p>
            ) : (
              <>
                {pinned.map(renderOption)}
                {pinned.length > 0 && rest.length > 0 && (
                  <div className="my-1 border-t border-white/[0.07]" aria-hidden />
                )}
                {sections.map((section) => (
                  <div key={section.label || "_ungrouped"} role="group" aria-label={section.label || undefined}>
                    {showGroupHeadings && section.label && (
                      <div className="sticky top-0 bg-[#0e0d18] px-3 pb-1 pt-2 font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-widest text-[#6f6b80]">
                        {section.label}
                      </div>
                    )}
                    {section.options.map(renderOption)}
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
