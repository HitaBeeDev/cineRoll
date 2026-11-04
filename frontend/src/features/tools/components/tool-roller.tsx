"use client";

import { useCallback, useRef, useState } from "react";
import type { RollFilm } from "@/lib/api/roll-types";
import { requestRandom } from "@/lib/api/fetch-random/request-random";
import { cn } from "@/lib/utils/cn";
import type { ToolChoice, ToolParams } from "../tool-types";
import { ToolRollCard } from "./tool-roll-card";

// Films already shown on this page, kept out of the next draws so a reroll
// never hands back the same title straight away.
const RECENT_LIMIT = 30;

type Status = "idle" | "rolling" | "done" | "empty" | "failed";

const CHIP =
  "rounded-full border px-3 py-1.5 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.16em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50";

/** The roll button for a tool page, with its optional choices (decade, genre). */
export function ToolRoller({
  params,
  choices,
}: {
  params: ToolParams;
  choices?: ToolChoice[] | undefined;
}) {
  const [choiceIndex, setChoiceIndex] = useState<number | null>(null);
  const [film, setFilm] = useState<RollFilm | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const recent = useRef<string[]>([]);

  const roll = useCallback(async () => {
    setStatus("rolling");
    const choice = choiceIndex === null ? undefined : choices?.[choiceIndex];
    const query = new URLSearchParams({ ...params, ...choice?.params });
    if (recent.current.length) query.set("excludeIds", recent.current.join(","));

    try {
      const result = await requestRandom(query);
      recent.current = [result.film.id, ...recent.current].slice(0, RECENT_LIMIT);
      setFilm(result.film);
      setStatus("done");
    } catch (error) {
      // The API answers an empty pool with a 404; anything else is a failure.
      const status = (error as { status?: number }).status;
      setStatus(status === 404 ? "empty" : "failed");
    }
  }, [choiceIndex, choices, params]);

  const pick = (index: number | null) => {
    setChoiceIndex(index);
    recent.current = [];
  };

  return (
    <div className="flex flex-col gap-5">
      {choices && (
        <div className="flex flex-wrap gap-2" role="group" aria-label="Narrow the roll">
          {[null, ...choices.map((_, index) => index)].map((index) => {
            const selected = choiceIndex === index;
            return (
              <button
                key={index ?? "any"}
                type="button"
                aria-pressed={selected}
                onClick={() => pick(index)}
                className={cn(
                  CHIP,
                  selected
                    ? "border-accent bg-accent/15 text-fg-hi"
                    : "border-edge text-fg-muted hover:border-edge-hover hover:text-fg-hi",
                )}
              >
                {index === null ? "Any" : choices[index]?.label}
              </button>
            );
          })}
        </div>
      )}

      <button
        type="button"
        onClick={roll}
        disabled={status === "rolling"}
        className="w-fit rounded-md bg-accent px-8 py-3.5 font-[family-name:var(--font-geist-mono)] text-sm font-bold uppercase tracking-[0.3em] text-ink-950 transition hover:brightness-110 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
      >
        {status === "rolling" ? "Rolling…" : film ? "Roll again" : "Roll"}
      </button>

      <div aria-live="polite">
        {film && status !== "empty" && <ToolRollCard film={film} />}
        {status === "empty" && (
          <p className="text-sm text-fg-muted">No films match that choice. Try another one.</p>
        )}
        {status === "failed" && (
          <p className="text-sm text-fg-muted">The roll didn&apos;t go through. Try again in a moment.</p>
        )}
      </div>
    </div>
  );
}
