import Image from "next/image";
import { blurDataUrl, tmdbImageUrl } from "@/lib/images";

/**
 * The framed poster that floats on the right of the film detail hero
 * (desktop only). Owns its own responsive visibility so the hero layout
 * stays declarative.
 */
export function PosterCard({
  posterUrl,
  title,
  accent,
}: {
  posterUrl: string;
  title: string;
  accent: string;
}) {
  return (
    <div className="hidden shrink-0 lg:block">
      <div
        className="relative h-[460px] w-[307px] overflow-hidden"
        style={{
          boxShadow: `0 48px 100px rgba(0,0,0,0.92), 0 0 0 1px rgba(255,255,255,0.10), 0 20px 60px ${accent}40`,
        }}
      >
        <Image
          src={tmdbImageUrl(posterUrl, "w500") ?? posterUrl}
          alt={`${title} poster`}
          fill
          sizes="307px"
          placeholder="blur"
          blurDataURL={blurDataUrl(accent)}
          className="object-cover"
          priority
        />
        {/* Poster edge shimmer */}
        <div className="absolute inset-0 ring-1 ring-inset ring-white/10" />
      </div>
    </div>
  );
}
