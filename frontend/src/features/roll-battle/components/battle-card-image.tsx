import { Clapperboard } from "lucide-react";
import Image from "next/image";
import type { BattleCardImageProps } from "../component-props";

export function BattleCardImage({ film }: BattleCardImageProps) {
  const imageUrl = film.posterUrl ?? film.backdropUrl;

  return imageUrl ? (
    <Image
      src={imageUrl}
      alt={film.title}
      fill
      sizes="(max-width: 639px) 100vw, (max-width: 768px) 45vw, 300px"
      className="object-cover transition duration-300 group-hover:brightness-110 group-hover:saturate-110"
    />
  ) : (
    <div className="absolute inset-0 flex items-center justify-center bg-[#1a1a28]">
      <Clapperboard className="h-10 w-10 text-[#2a2a3e]" aria-hidden />
    </div>
  );
}
