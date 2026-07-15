import { getPickMetadata } from "../get-pick-metadata";
import type { PickMetadataProps } from "../component-props";

export function PickMetadata({ film }: PickMetadataProps) {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-2.5 gap-y-1 font-[family-name:var(--font-geist-mono)] text-[12px] uppercase tracking-wider text-[#a6a6ba]">
      {getPickMetadata(film).map((metadata, index) => (
        <span key={metadata} className="flex items-center gap-2.5">
          {index > 0 && <span className="text-white/20" aria-hidden>·</span>}
          {metadata}
        </span>
      ))}
      {film.imdbRating != null && (
        <span className="flex items-center gap-2.5 text-[#d4d4e0]">
          <span className="text-white/20" aria-hidden>·</span>★ {film.imdbRating.toFixed(1)}
        </span>
      )}
      {film.rtScore != null && (
        <span className="flex items-center gap-2.5 text-[#d4d4e0]">
          <span className="text-white/20" aria-hidden>·</span>RT {film.rtScore}%
        </span>
      )}
    </div>
  );
}
