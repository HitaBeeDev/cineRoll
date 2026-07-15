import { EditorialSectionLabel } from "@/components/editorial-section-label";
import type { SynopsisSectionProps } from "../component-props";

export function SynopsisSection({
  plot,
  accent,
}: SynopsisSectionProps) {
  return (
    <section id="overview">
      <EditorialSectionLabel>Synopsis</EditorialSectionLabel>
      <div className="relative mt-8 pl-7">
        <div
          className="absolute bottom-0 left-0 top-0 w-[4px] rounded-full"
          style={{
            background: `linear-gradient(to bottom, ${accent}, ${accent}66, ${accent}14)`,
            boxShadow: `0 0 18px ${accent}40`,
          }}
        />
        <p className="max-w-3xl text-[1.2rem] font-light leading-[1.8] tracking-wide text-[#efedf8] sm:text-[1.3rem]">
          {plot}
        </p>
      </div>
    </section>
  );
}
