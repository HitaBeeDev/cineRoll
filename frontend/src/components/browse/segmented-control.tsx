"use client";

import { Fragment, useRef } from "react";
import { cn } from "@/lib/utils";
import { useFieldLabelling } from "@/components/ui/field-label-context";

/**
 * A single-choice strip where one option is always chosen (award result: All /
 * Winner / Nominated).
 *
 * This one really is a radiogroup — unlike the filter chips, no option can be
 * clicked off, only exchanged for another — so it keeps the radio roles and pays
 * what they cost: roving tabindex. The group is a single tab stop landing on the
 * current choice, and the arrow keys move between options. Without that, three
 * radios sat in the tab order doing nothing on arrow press, which is the half of
 * the pattern keyboard users actually navigate by.
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  label,
  neutralValue,
  className,
}: {
  options: { value: T; label: string; groupStart?: boolean }[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel?: string;
  /** Visible caption above the control — without it users must infer what it switches. */
  label?: string;
  /**
   * The option that means "no constraint" (e.g. award result "All"). A radio group
   * always has something selected, so that option gets a muted active state — the
   * accent stays reserved for choices that actually cut the result set.
   */
  neutralValue?: T;
  className?: string;
}) {
  const buttonsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const labelling = useFieldLabelling(ariaLabel);

  const selectedIndex = options.findIndex((option) => option.value === value);
  // A group with no tab stop would be unreachable by keyboard, so if nothing
  // matches the current value the first option holds it.
  const tabbableIndex = selectedIndex >= 0 ? selectedIndex : 0;

  /** Arrows wrap around the strip, selecting as they go — the radiogroup pattern. */
  function handleKeyDown(event: React.KeyboardEvent, index: number) {
    const step =
      event.key === "ArrowRight" || event.key === "ArrowDown"
        ? 1
        : event.key === "ArrowLeft" || event.key === "ArrowUp"
          ? -1
          : 0;
    if (step === 0) return;

    event.preventDefault();
    const nextIndex = (index + step + options.length) % options.length;
    const next = options[nextIndex];
    if (!next) return;

    onChange(next.value);
    buttonsRef.current[nextIndex]?.focus();
  }

  return (
    <div className={cn("flex w-full flex-col gap-1 sm:w-auto", className)}>
      {label && (
        <span className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.2em] text-[#8e899e]">
          {label}
        </span>
      )}
      <div
        role="radiogroup"
        {...labelling}
        className="flex w-full max-w-full flex-wrap items-center gap-1 rounded-md border border-white/10 bg-white/[0.025] p-1 sm:w-auto xl:flex-nowrap"
      >
      {options.map((opt, i) => {
        const active = opt.value === value;
        const restricting = active && opt.value !== neutralValue;
        return (
          <Fragment key={opt.value}>
            {/* A heavier divider marks a group break (e.g. award bodies → IMDb lists) */}
            {i > 0 && (
              <span
                aria-hidden
                className={cn("w-px shrink-0", opt.groupStart ? "mx-1 h-5 bg-white/20" : "h-4 bg-white/10")}
              />
            )}
            <button
              type="button"
              role="radio"
              aria-checked={active}
              tabIndex={i === tabbableIndex ? 0 : -1}
              ref={(node) => { buttonsRef.current[i] = node; }}
              onKeyDown={(event) => handleKeyDown(event, i)}
              onClick={() => onChange(opt.value)}
              className={cn(
                "h-8 shrink-0 rounded px-3 font-[family-name:var(--font-geist-mono)] text-[12px] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]/40",
                restricting && "bg-[#e8453c] text-[#09090f] shadow-[0_0_24px_rgba(232,69,60,0.24)]",
                active && !restricting && "bg-white/[0.09] text-[#f1eff8]",
                !active && "text-[#7f7a91] hover:bg-white/[0.055] hover:text-[#f1eff8]",
              )}
            >
              {opt.label}
            </button>
          </Fragment>
        );
      })}
      </div>
    </div>
  );
}
