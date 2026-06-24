"use client";

import * as React from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export type MultiSelectOption = { value: string; label: string };

/**
 * A lightweight multi-select dropdown (Radix's Select is single-value only). A
 * trigger button opens an absolutely-positioned checkbox panel; clicking an
 * option toggles it in/out of `selected`. For long lists (genres, countries) the
 * optional `searchable` flag adds a type-to-filter input. Closes on outside click
 * or Escape. Styles are inline/Tailwind only — nothing leaks to global CSS.
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
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);

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

  // Reset the filter each time the panel reopens so a stale query never hides options.
  React.useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const selectedSet = React.useMemo(() => new Set(selected), [selected]);

  function toggle(value: string) {
    onChange(
      selectedSet.has(value)
        ? selected.filter(v => v !== value)
        : [...selected, value],
    );
  }

  // Trigger label: placeholder when empty, the single label when one, else "First +N".
  const label = (() => {
    if (selected.length === 0) return placeholder;
    const firstLabel = options.find(o => o.value === selected[0])?.label ?? selected[0];
    return selected.length === 1 ? firstLabel : `${firstLabel} +${selected.length - 1}`;
  })();

  const filtered = searchable && query.trim()
    ? options.filter(o => o.label.toLowerCase().includes(query.trim().toLowerCase()))
    : options;

  const isPill = variant === "pill";

  return (
    <div ref={containerRef} className={cn("relative", isPill && "inline-flex")}>
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(v => !v)}
        className={cn(
          isPill
            ? "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-widest transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c] focus-visible:ring-offset-1 focus-visible:ring-offset-[#09090f]"
            : "flex h-10 w-full items-center justify-between gap-2 rounded-md border px-3 text-[12px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]/40",
          isPill
            ? selected.length > 0
              ? "border-[#d8d8e2] bg-[#d8d8e2] text-[#0c0c14]"
              : "border-[#34344d] bg-[#0e0e1a] text-[#aaaac6] hover:border-[#6a6a85] hover:text-[#F5F5F0]"
            : selected.length > 0
              ? "border-[#5a5a72] bg-white/[0.08] text-[#F5F5F0]"
              : "border-white/10 bg-white/[0.045] text-[#b8b5c8] hover:border-white/20",
          triggerClassName,
        )}
      >
        <span className="min-w-0 truncate text-left">{label}</span>
        <ChevronDown className={cn("h-3.5 w-3.5 shrink-0 opacity-70 transition-transform", open && "rotate-180")} aria-hidden />
      </button>

      {open && (
        <div
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
          <div className="max-h-60 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <p className="px-3 py-2 font-[family-name:var(--font-geist-mono)] text-[11px] text-[#6f6b80]">No matches</p>
            ) : (
              filtered.map(opt => {
                const isSelected = selectedSet.has(opt.value);
                return (
                  <button
                    key={opt.value}
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
                    <span className="min-w-0 truncate">{opt.label}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
