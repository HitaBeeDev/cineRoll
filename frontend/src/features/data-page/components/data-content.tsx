import Link from "next/link";
import { PolicySection } from "@/features/legal/components/policy-section";
import type { DataPageData } from "../data-page-types";
import { BodyCoverageTable } from "./body-coverage-table";
import { DataStatTiles } from "./data-stat-tiles";
import { DecadeCoverageGrid } from "./decade-coverage-grid";

const LINK_CLASS =
  "text-fg-hi underline decoration-white/25 underline-offset-4 transition-colors hover:text-accent";

export function DataContent({ data }: { data: DataPageData }) {
  const { bodies } = data;
  const withGaps = bodies.filter((body) => body.missingYears.length > 0);

  return (
    <div className="mx-auto max-w-4xl space-y-12 px-6 py-14 text-[#c8c8d8] lg:px-10">
      <DataStatTiles summary={data.summary} crossover={data.crossover} />

      {bodies.length > 0 && (
        <PolicySection title="Per award">
          <p>
            Films with at least one nomination at each award, the ceremony years on record, and the
            years in that range with nothing on record.
          </p>
          <BodyCoverageTable bodies={bodies} />
        </PolicySection>
      )}

      {bodies.length > 0 && (
        <PolicySection title="Coverage by decade">
          <p>
            Each cell shows how many ceremonies are on record out of the ones that decade could
            have held, and how many films they nominated. A film nominated in two different years
            counts once in each. Darker means more complete.
          </p>
          <DecadeCoverageGrid bodies={bodies} />
        </PolicySection>
      )}

      <PolicySection title="Known gaps">
        {withGaps.length > 0 && (
          <>
            <p>
              Years with nothing on record. Some had no ceremony at all — Cannes was not held in
              1948 or 1950 — so not every year here is missing data.
            </p>
            <ul>
              {withGaps.map((body) => (
                <li key={body.slug}>
                  <strong>{body.name}</strong> — {body.missingYears.join(", ")}
                </li>
              ))}
            </ul>
          </>
        )}
        <p>
          What is left out on purpose (honorary prizes, festival side prizes, other awards) and how
          films are matched is on the <Link href="/methodology" className={LINK_CLASS}>methodology page</Link>.
          Spotted something missing? Use the feedback button at the bottom of the page.
        </p>
      </PolicySection>
    </div>
  );
}
