import { EditorialSectionLabel } from "@/components/editorial-section-label";
import type { AwardHistoryProps } from "../component-props";
import { AwardBodyCard } from "./award-body-card";

export function AwardHistorySection({ awardBodies }: AwardHistoryProps) {
  if (awardBodies.length === 0) return null;

  return (
    <section>
      <EditorialSectionLabel>Award History</EditorialSectionLabel>
      <div className="mt-10 space-y-6">
        {awardBodies.map((body) => (
          <AwardBodyCard key={body.code} body={body} />
        ))}
      </div>
    </section>
  );
}
