import Image from "next/image";
import type { PersonAvatarProps } from "../component-props";

export function PersonAvatar({
  person,
  avatarHue,
  initials,
}: PersonAvatarProps) {
  if (person.photoUrl) {
    return (
      <div
        className="relative h-32 w-32 overflow-hidden rounded-full sm:h-44 sm:w-44"
        style={{
          boxShadow: `0 0 0 1px rgba(255,255,255,0.09), 0 24px 60px rgba(0,0,0,0.7), 0 0 40px hsl(${avatarHue},25%,20%)`,
        }}
      >
        <Image
          src={person.photoUrl}
          alt={person.name}
          fill
          sizes="(max-width: 640px) 128px, 176px"
          className="object-cover object-top"
          priority
        />
      </div>
    );
  }

  return (
    <div
      className="flex h-32 w-32 items-center justify-center rounded-full border border-white/8 sm:h-44 sm:w-44"
      style={{
        background: `radial-gradient(circle at 40% 35%, hsl(${avatarHue},12%,16%), hsl(${avatarHue},6%,9%))`,
        boxShadow: "0 0 0 1px rgba(255,255,255,0.06), 0 24px 60px rgba(0,0,0,0.7)",
      }}
    >
      <span
        className="font-[family-name:var(--font-display)] text-4xl font-bold sm:text-5xl"
        style={{ color: `hsl(${avatarHue},35%,65%)` }}
      >
        {initials}
      </span>
    </div>
  );
}
