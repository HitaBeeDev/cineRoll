import type { Film } from "@cineroll/types";
import { SimilarFilmsSlider } from "@/components/similar-films-slider";
import { EditorialSectionLabel } from "@/components/editorial-section-label";
import type { SimilarFilmsProps } from "../component-props";

export function SimilarFilmsSection({ films }: SimilarFilmsProps) {
  if (films.length < 3) return null;

  return (
    <section id="similar" className="scroll-mt-24">
      <EditorialSectionLabel>You Might Also Like</EditorialSectionLabel>
      <p className="mt-3 max-w-2xl font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.22em] text-[#7c7ca0]">
        Ranked by shared director, genre &amp; award era
      </p>
      <div className="mt-8">
        <SimilarFilmsSlider films={films as unknown as Film[]} />
      </div>
    </section>
  );
}
