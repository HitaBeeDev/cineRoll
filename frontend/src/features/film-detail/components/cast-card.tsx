import Image from "next/image";
import Link from "next/link";
import { nameToSlug } from "@/lib/utils";
import { getNameHue, getNameInitials } from "../cast-avatar";
import type { CastCardProps } from "../component-props";

export function CastCard({ member, accent }: CastCardProps) {
  const initials = getNameInitials(member.name);
  const hue = getNameHue(member.name);

  return (
    <Link
      href={`/person/${nameToSlug(member.name)}`}
      className="group relative flex flex-col overflow-hidden border border-[#1e1e30] bg-[#0d0d18] transition-colors hover:border-[#e8453c]/30"
    >
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: "2/3" }}>
        {member.photoUrl ? (
          <Image
            src={member.photoUrl}
            alt={member.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 200px"
            className="object-cover object-top grayscale-[55%] transition-all duration-500 group-hover:scale-[1.04] group-hover:grayscale-0"
          />
        ) : (
          <div
            className="flex h-full w-full flex-col items-center justify-center gap-4"
            style={{ background: `linear-gradient(160deg, hsl(${hue},10%,10%), hsl(${hue},6%,7%))` }}
          >
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full border border-white/8 font-[family-name:var(--font-display)] text-2xl font-bold text-white/22"
              style={{ background: `hsl(${hue},14%,14%)` }}
            >
              {initials}
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#08080d] via-[#08080d]/30 to-transparent" />
      </div>
      <div className="px-3 pb-4 pt-2.5">
        <p className="truncate text-[0.8rem] font-semibold leading-5 text-[#d4d4e8]">
          {member.name}
        </p>
        {member.character && (
          <p
            className="mt-0.5 truncate font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.2em]"
            style={{ color: `${accent}cc` }}
          >
            {member.character}
          </p>
        )}
      </div>
    </Link>
  );
}
