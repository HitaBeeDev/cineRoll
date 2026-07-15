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
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] to-[#09090f]" />
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#09090f] via-[#09090f]/35 to-[#09090f]/10" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#09090f]/85 via-[#09090f]/30 to-transparent" />
    </>
  );
}
