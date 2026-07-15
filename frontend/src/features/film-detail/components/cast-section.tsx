import { normalizeCast } from "../normalize-cast";
import type { CastSectionProps } from "../component-props";
import { CastCard } from "./cast-card";
import { SectionLabel } from "./section-label";

export function CastSection({
  cast,
  accent,
}: CastSectionProps) {
  const visibleCast = normalizeCast(cast)
    .filter((member) => member.name.trim().length > 0)
    .slice(0, 8);
  if (visibleCast.length === 0) return null;

  return (
    <section id="cast" className="scroll-mt-24">
      <SectionLabel>Cast</SectionLabel>
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {visibleCast.map((member, index) => (
          <CastCard
            key={`${member.name}-${index}`}
            member={member}
            accent={accent}
          />
        ))}
      </div>
    </section>
  );
}
