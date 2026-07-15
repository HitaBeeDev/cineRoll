import { Clapperboard } from "lucide-react";
import Image from "next/image";
import type { RollBattleWinnerPosterProps } from "../component-props";

export function RollBattleWinnerPoster({
  imageUrl,
  title,
}: RollBattleWinnerPosterProps) {
  return (
    <div
      className="relative mx-auto w-48 overflow-hidden rounded-xl border border-[#1e1e2a] bg-[#0d0d1a] shadow-[0_0_40px_rgba(212,175,55,0.10)] sm:w-full"
      style={{ aspectRatio: "2/3" }}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={title}
          fill
          sizes="(max-width: 640px) 192px, 220px"
          className="object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <Clapperboard className="h-12 w-12 text-[#2a2a3e]" aria-hidden />
        </div>
      )}
    </div>
  );
}
