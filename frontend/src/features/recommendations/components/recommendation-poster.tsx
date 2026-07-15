"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { blurDataUrl, tmdbImageUrl } from "@/lib/images";
import { cn } from "@/lib/utils";
import type { RecommendationPosterProps } from "../recommendation-component-types";
import { RecommendationActionBar } from "./recommendation-action-bar";

export function RecommendationPoster({
  recommendation,
  actions,
}: RecommendationPosterProps) {
  const [loaded, setLoaded] = useState(false);
  const posterUrl = recommendation.posterUrl
    ? tmdbImageUrl(recommendation.posterUrl, "w342") ?? recommendation.posterUrl
    : null;

  return (
    <div className="group relative aspect-[2/3] w-full overflow-hidden rounded-lg border border-[#1e1e2a] bg-[#111120] transition-colors hover:border-[#e8453c]/60">
      {posterUrl ? (
        <Image
          src={posterUrl}
          alt={recommendation.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          placeholder="blur"
          blurDataURL={blurDataUrl(null)}
          onLoad={() => setLoaded(true)}
          className={cn(
            "object-cover transition-all duration-500 group-hover:scale-[1.03]",
            loaded ? "opacity-100" : "opacity-0",
          )}
        />
      ) : (
        <div className="flex h-full items-center justify-center px-3 text-center font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-widest text-[#888899]">
          {recommendation.title}
        </div>
      )}
      <Link
        href={`/film/${recommendation.slug}`}
        aria-label={recommendation.title}
        className="absolute inset-0 z-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#e8453c]"
      />
      <RecommendationActionBar actions={actions} />
    </div>
  );
}
