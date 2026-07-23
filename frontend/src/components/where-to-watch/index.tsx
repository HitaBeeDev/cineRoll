"use client";

import { ExternalLink } from "lucide-react";
import { useWatchOptions } from "@/components/where-to-watch/useWatchOptions";
import { ProviderGroup } from "@/components/where-to-watch/provider-group";

export function WhereToWatch({
  watchProviders,
  accent,
}: {
  watchProviders: Record<string, unknown> | null;
  accent: string;
}) {
  const options = useWatchOptions(watchProviders);

  // Pending (country still resolving) or nothing to stream/rent/buy → render
  // nothing at all, rather than an empty placeholder that adds dead weight.
  if (options.status !== "ready") return null;

  const { flatrate, rent, buy, link } = options;

  return (
    <section id="where-to-watch" className="scroll-mt-24">
      <div className="flex items-center gap-4">
        <span className="font-[family-name:var(--font-geist-mono)] text-[11px] text-[#e8453c]">
          ◆
        </span>
        <h2 className="font-[family-name:var(--font-geist-mono)] text-[11px] font-semibold uppercase tracking-[0.5em] text-[#a0a0c0]">
          Where to Watch
        </h2>
        <div className="h-px flex-1 bg-gradient-to-r from-[#2a2a42] to-transparent" />
      </div>

      <div className="mt-8 border border-[#1e1e30] bg-[#0d0d18] p-6">
        <div className="flex flex-col gap-7">
          <ProviderGroup label="Stream" providers={flatrate} accent={accent} />
          <ProviderGroup label="Rent" providers={rent} accent={accent} />
          <ProviderGroup label="Buy" providers={buy} accent={accent} />

          {link && (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex w-fit items-center gap-2 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.4em] text-[#7878a0] transition-colors hover:text-[#c0c0d8]"
            >
              More options on JustWatch
              <ExternalLink className="h-3 w-3 text-[#7878a0] transition-colors group-hover:text-[#e8453c]" aria-hidden />
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
