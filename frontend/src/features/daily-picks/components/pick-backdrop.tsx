import Image from "next/image";
import type { PickBackdropProps } from "../component-props";

export function PickBackdrop({ film, priority }: PickBackdropProps) {
  const imageUrl = film.backdropUrl ?? film.posterUrl;

  return (
    <>
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={film.title}
          fill
          sizes="100vw"
          className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.03]"
          priority={priority}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] to-ink-900" />
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/35 to-ink-900/10" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink-900/85 via-ink-900/30 to-transparent" />
    </>
  );
}
