"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ProviderFacetCount } from "@cineroll/types";
import { FilterSelect } from "@/components/browse/filter-select";
import { fetchFacetCounts } from "@/lib/api";
import type { RollFilm } from "@/lib/api/roll-types";
import { regionName } from "@/lib/streaming/region-name";
import { STREAMING_REGIONS } from "@/lib/streaming/streaming-regions";
import { useViewerRegion } from "@/lib/streaming/use-viewer-region";
import { rollTonight } from "../roll-tonight";
import { saveChoice } from "../save-choice";
import { TONIGHT_DEFAULT_REGION } from "../tonight-constants";
import { useSavedChoice } from "../use-saved-choice";

const TIMES = [
  { label: "Any length", value: null },
  { label: "Under 2 hours", value: 120 },
  { label: "Under 90 minutes", value: 90 },
] as const;

// Enough to cover the services most people have; the rest sit behind "More".
const SHOWN_SERVICES = 12;

const STEP = "font-[family-name:var(--font-geist-mono)] text-[11px] font-semibold uppercase tracking-[0.3em] text-fg-muted";
const CHIP =
  "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50";

type Result =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "film"; film: RollFilm }
  | { kind: "empty" }
  | { kind: "error" };

/**
 * The page's answer to "what should I watch tonight": where you are, which
 * services you pay for, how long you have — then one film, not a list. Country
 * and services are remembered in this browser for next time.
 */
export function TonightPicker() {
  const saved = useSavedChoice();
  const viewer = useViewerRegion();
  const [pickedRegion, setPickedRegion] = useState<string | null>(null);
  const [pickedProviders, setPickedProviders] = useState<number[] | null>(null);
  const [runtimeMax, setRuntimeMax] = useState<number | null>(null);
  const [services, setServices] = useState<ProviderFacetCount[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [result, setResult] = useState<Result>({ kind: "idle" });
  const [seen, setSeen] = useState<string[]>([]);

  const region = pickedRegion ?? saved?.region ?? viewer ?? TONIGHT_DEFAULT_REGION;
  const providers = pickedProviders ?? (saved?.region === region ? saved.providers : []);

  // The services in this country that carry award feature films, most first.
  useEffect(() => {
    const controller = new AbortController();
    fetchFacetCounts({ streamingRegion: region, contentTypes: ["movie"] }, controller.signal)
      .then((counts) => setServices([...counts.providers].sort((a, b) => b.count - a.count)))
      .catch(() => {
        if (!controller.signal.aborted) setServices([]);
      });
    return () => controller.abort();
  }, [region]);

  const regionOptions = useMemo(
    () =>
      [...new Set<string>([...STREAMING_REGIONS, region])]
        .map((code) => ({ value: code, label: regionName(code) }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [region],
  );

  const shown = showAll ? services : services.slice(0, SHOWN_SERVICES);

  function toggle(id: number) {
    setPickedProviders(providers.includes(id) ? providers.filter((other) => other !== id) : [...providers, id]);
  }

  async function pick(excludeIds: string[]) {
    setResult({ kind: "loading" });
    saveChoice({ region, providers });
    try {
      const { film } = await rollTonight({ region, providers, runtimeMax, excludeIds });
      setSeen([...excludeIds, film.id]);
      setResult({ kind: "film", film });
    } catch (error) {
      const status = (error as { status?: number }).status;
      setResult({ kind: status === 404 ? "empty" : "error" });
    }
  }

  return (
    <section aria-labelledby="tonight-picker" className="rounded-xl border border-white/10 bg-white/[0.02] p-5 sm:p-7">
      <h2 id="tonight-picker" className="sr-only">
        Pick a film for tonight
      </h2>

      <div className="space-y-6">
        <div className="space-y-2">
          <p className={STEP}>1 · Where are you?</p>
          <FilterSelect
            value={region}
            ariaLabel="Country"
            options={regionOptions}
            className="w-full text-fg-hi sm:w-64"
            onValueChange={(value) => {
              setPickedRegion(value);
              // Service ids are per country; a choice made for one means nothing in another.
              setPickedProviders([]);
              setShowAll(false);
            }}
          />
        </div>

        <div className="space-y-2">
          <p className={STEP}>2 · Your services</p>
          {services.length === 0 ? (
            <p className="text-sm text-fg-muted">
              No service list for {regionName(region)} yet — we&apos;ll pick from anything streaming there.
            </p>
          ) : (
            <>
              <ul className="flex flex-wrap gap-2">
                {shown.map((service) => {
                  const id = Number(service.value);
                  const on = providers.includes(id);
                  return (
                    <li key={service.value}>
                      <button
                        type="button"
                        aria-pressed={on}
                        onClick={() => toggle(id)}
                        className={`${CHIP} ${on ? "border-accent/70 bg-accent/15 text-fg-hi" : "border-white/10 text-fg-dim hover:border-white/25"}`}
                      >
                        {service.logoPath && (
                          <Image
                            src={`https://image.tmdb.org/t/p/w92${service.logoPath}`}
                            alt=""
                            width={18}
                            height={18}
                            unoptimized
                            className="h-[18px] w-[18px] rounded-sm"
                          />
                        )}
                        {service.name}
                      </button>
                    </li>
                  );
                })}
              </ul>
              <p className="text-xs text-fg-muted">
                {providers.length === 0 ? "None picked: any service in " + regionName(region) + "." : `${providers.length} picked.`}
                {services.length > SHOWN_SERVICES && (
                  <>
                    {" "}
                    <button type="button" onClick={() => setShowAll(!showAll)} className="underline underline-offset-4 hover:text-accent">
                      {showAll ? "Fewer services" : `All ${services.length} services`}
                    </button>
                  </>
                )}
              </p>
            </>
          )}
        </div>

        <div className="space-y-2">
          <p className={STEP}>3 · How long have you got?</p>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Running time">
            {TIMES.map((time) => (
              <button
                key={time.label}
                type="button"
                role="radio"
                aria-checked={runtimeMax === time.value}
                onClick={() => setRuntimeMax(time.value)}
                className={`${CHIP} ${runtimeMax === time.value ? "border-accent/70 bg-accent/15 text-fg-hi" : "border-white/10 text-fg-dim hover:border-white/25"}`}
              >
                {time.label}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => void pick([])}
          disabled={result.kind === "loading"}
          className="inline-flex h-11 items-center rounded-md bg-accent px-6 text-sm font-semibold text-white transition-colors hover:bg-accent-hi disabled:opacity-60"
        >
          {result.kind === "loading" ? "Picking…" : "Pick tonight's film"}
        </button>
      </div>

      <div aria-live="polite" className="mt-6">
        {result.kind === "film" && (
          <TonightResult film={result.film} region={region} onAnother={() => void pick(seen)} />
        )}
        {result.kind === "empty" && (
          <p className="text-sm text-fg-dim">
            Nothing matches that. Add a service or allow more time.
            {seen.length > 0 && " You may also have seen every match already."}
          </p>
        )}
        {result.kind === "error" && <p className="text-sm text-fg-dim">Something went wrong. Try again.</p>}
      </div>
    </section>
  );
}

function TonightResult({ film, region, onAnother }: { film: RollFilm; region: string; onAnother: () => void }) {
  const wins = film.oscarWins + film.ggWins + film.cannesWins + film.berlinWins;
  const href = `/film/${film.slug}?region=${region}`;
  return (
    <article className="flex flex-col gap-5 border-t border-white/10 pt-6 sm:flex-row">
      {film.posterUrl && (
        <Link href={href} className="w-32 shrink-0">
          <Image
            src={film.posterUrl}
            alt={`${film.title} (${film.year}) poster`}
            width={128}
            height={192}
            unoptimized
            className="aspect-[2/3] w-32 rounded-md object-cover"
          />
        </Link>
      )}
      <div className="min-w-0 space-y-2">
        <h3 className="font-[family-name:var(--font-display)] text-2xl font-bold text-fg-hi">
          <Link href={href} className="hover:text-accent">
            {film.title}
          </Link>
        </h3>
        <p className="text-sm text-fg-muted">
          {[film.year, film.runtime ? `${film.runtime} min` : null, film.director, wins > 0 ? `${wins} major award ${wins === 1 ? "win" : "wins"}` : null]
            .filter(Boolean)
            .join(" · ")}
        </p>
        {film.plot && <p className="line-clamp-3 max-w-2xl text-sm leading-6 text-fg-dim">{film.plot}</p>}
        <div className="flex flex-wrap gap-3 pt-2">
          <Link href={href} className="inline-flex h-9 items-center rounded-md border border-white/20 px-4 text-sm text-fg-hi hover:border-accent/60">
            Where to stream it
          </Link>
          <button type="button" onClick={onAnother} className="inline-flex h-9 items-center rounded-md px-4 text-sm text-fg-dim underline underline-offset-4 hover:text-accent">
            Something else
          </button>
        </div>
      </div>
    </article>
  );
}
