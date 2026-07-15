import Image from "next/image";
import { blurDataUrl, tmdbImageUrl } from "@/lib/images";
import { cn } from "@/lib/utils";
import type { FilmHeroBackgroundProps } from "../component-props";

export function FilmHeroBackground({
  film,
  accent,
  image,
}: FilmHeroBackgroundProps) {
  return (
    <>
      {image.url && (
        <Image
          src={tmdbImageUrl(image.url, image.size) ?? image.url}
          alt=""
          fill
          priority
          sizes="100vw"
          placeholder="blur"
          blurDataURL={blurDataUrl(film.posterColor)}
          className={cn(
            "object-cover object-center",
            image.isPoster
              ? "scale-110 opacity-50 blur-2xl saturate-[0.9]"
              : "opacity-[0.82] saturate-[1.15]",
          )}
        />
      )}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `${image.scrim},
            linear-gradient(to top, rgba(7,7,11,0.99) 0%, rgba(7,7,11,0.58) 14%, rgba(7,7,11,0.0) 42%),
            radial-gradient(ellipse 60% 70% at 76% 20%, ${accent}38, transparent 65%),
            radial-gradient(ellipse 35% 25% at 15% 95%, ${accent}12, transparent 70%)`,
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.032]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitchTiles'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "256px 256px",
        }}
      />
    </>
  );
}
