"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ExternalLink } from "lucide-react";

type Provider = {
  logo_path: string;
  provider_id: number;
  provider_name: string;
  display_priority: number;
};

type CountryData = {
  link?: string;
  flatrate?: Provider[];
  buy?: Provider[];
  rent?: Provider[];
};

function parseProviders(raw: Record<string, unknown>): Record<string, CountryData> {
  const result: Record<string, CountryData> = {};
  for (const [code, value] of Object.entries(raw)) {
    if (value && typeof value === "object") {
      result[code] = value as CountryData;
    }
  }
  return result;
}

function detectCountry(): string {
  const lang = navigator.language ?? "en-US";
  const parts = lang.split("-");
  return (parts[1] ?? parts[0] ?? "US").toUpperCase();
}

function ProviderGroup({
  label,
  providers,
  accent,
}: {
  label: string;
  providers: Provider[];
  accent: string;
}) {
  if (providers.length === 0) return null;
  const sorted = [...providers].sort(
    (a, b) => a.display_priority - b.display_priority,
  );
  return (
    <div>
      <p
        className="mb-3 font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-[0.5em]"
        style={{ color: `${accent}66` }}
      >
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {sorted.map((p) => (
          <div
            key={p.provider_id}
            title={p.provider_name}
            className="group relative h-11 w-11 overflow-hidden rounded-xl border border-[#1a1a26] bg-[#0c0c14] transition-colors hover:border-[#2a2a3e]"
          >
            <Image
              src={`https://image.tmdb.org/t/p/w92${p.logo_path}`}
              alt={p.provider_name}
              fill
              sizes="44px"
              className="object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function WhereToWatch({
  watchProviders,
  accent,
}: {
  watchProviders: Record<string, unknown> | null;
  accent: string;
}) {
  const [country, setCountry] = useState<string | null>(null);

  useEffect(() => {
    setCountry(detectCountry());
  }, []);

  const noData = !watchProviders;
  const providers = watchProviders ? parseProviders(watchProviders) : {};

  // While country is being detected, show nothing to avoid a flash
  if (!noData && country === null) return null;

  const countryData = country ? providers[country] : undefined;
  const flatrate = countryData?.flatrate ?? [];
  const rent = countryData?.rent ?? [];
  const buy = countryData?.buy ?? [];
  const hasAny = flatrate.length > 0 || rent.length > 0 || buy.length > 0;

  return (
    <section id="where-to-watch" className="scroll-mt-24">
      <div className="flex items-center gap-4">
        <span className="font-[family-name:var(--font-geist-mono)] text-[8px] text-[#e8453c]/40">
          ◆
        </span>
        <h2 className="font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-[0.6em] text-[#484858]">
          Where to Watch
        </h2>
        <div className="h-px flex-1 bg-gradient-to-r from-[#1a1a26] to-transparent" />
      </div>

      <div className="mt-8 border border-[#111118] bg-[#08080d] p-6">
        {noData ? (
          <p className="font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-[0.4em] text-[#2a2a38]">
            Streaming data not yet available
          </p>
        ) : hasAny ? (
          <div className="flex flex-col gap-7">
            <ProviderGroup label="Stream" providers={flatrate} accent={accent} />
            <ProviderGroup label="Rent" providers={rent} accent={accent} />
            <ProviderGroup label="Buy" providers={buy} accent={accent} />

            {countryData?.link && (
              <a
                href={countryData.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex w-fit items-center gap-2 font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-[0.4em] text-[#444458] transition-colors hover:text-[#888898]"
              >
                More options on JustWatch
                <ExternalLink className="h-3 w-3 text-[#333342] transition-colors group-hover:text-[#e8453c]" aria-hidden />
              </a>
            )}
          </div>
        ) : (
          <p className="font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-[0.4em] text-[#2a2a38]">
            Not available for streaming in your region
          </p>
        )}
      </div>
    </section>
  );
}
