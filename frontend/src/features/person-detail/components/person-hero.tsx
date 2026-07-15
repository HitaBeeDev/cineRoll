import { getNameInitials } from "@/lib/name-avatar";
import type { PersonHeroProps } from "../component-props";
import { PersonAvatar } from "./person-avatar";
import { PersonInfo } from "./person-info";

export function PersonHero({ person, avatarHue }: PersonHeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-[#111118] bg-[#07070b]">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 60% 80% at 80% 50%, hsl(${avatarHue},22%,14%) 0%, transparent 65%),
            radial-gradient(ellipse 40% 60% at 0% 100%, #e8453c0a, transparent 60%)
          `,
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "256px 256px",
        }}
      />
      <div className="relative mx-auto max-w-5xl px-6 py-16 sm:py-24 lg:px-10">
        <div className="flex flex-col items-start gap-10 sm:flex-row sm:items-center">
          <div className="shrink-0">
            <PersonAvatar
              person={person}
              avatarHue={avatarHue}
              initials={getNameInitials(person.name)}
            />
          </div>
          <PersonInfo person={person} />
        </div>
      </div>
    </section>
  );
}
