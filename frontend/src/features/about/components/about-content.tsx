import type { BodyCoverage } from "@/features/methodology/coverage-types";
import type { MOODS } from "@/features/moods/moods";
import type { MakingOfData } from "../making-of/making-of-types";
import { AboutChapter } from "./about-chapter";
import { BehindTheRecords } from "./behind-the-records";
import { CataloguePreviews } from "./catalogue-previews";
import { WhyCineRollSection } from "./why-cineroll-section";
import { WhoMakesIt } from "./who-makes-it";

/**
 * The Making Of tour: four reels with varied compositions — a wide visual band,
 * a full-bleed film demo, a narrow centered matching demo, a split credit.
 */
export function AboutContent({
  archiveSize,
  coverage,
  moods,
  data,
}: {
  archiveSize: number | null;
  coverage: BodyCoverage[];
  moods: readonly (typeof MOODS)[number][];
  data: MakingOfData;
}) {
  const size = archiveSize ? archiveSize.toLocaleString("en-US") : "thousands of";

  return (
    <div>
      <AboutChapter
        number="01"
        title="The catalogue"
        lede={
          <p>
            CineRoll holds {size} films and series nominated at the Academy Awards, the Golden
            Globes, the Cannes Film Festival and the Berlin International Film Festival. Each title
            page puts its nominations and wins at all four in one place.
          </p>
        }
      >
        <CataloguePreviews pool={data.pool} coverage={coverage} moods={moods} />
      </AboutChapter>

      <WhyCineRollSection
        spotlight={data.spotlight}
        lede={
          <p>
            On IMDb, awards are one detail on a title&apos;s page; Letterboxd is built for logging
            what you watch. CineRoll starts from the award records: it only holds films the four
            juries or academies singled out, and puts a film&apos;s record at all four side by
            side.{data.spotlight ? " Pick an award to see this film's record there." : ""}
          </p>
        }
      />

      <AboutChapter
        number="03"
        title="Behind the records"
        layout="centered"
        lede={
          <p>
            The same film is often listed under different titles by different awards. Each
            nomination is matched to a single TMDB record, so its wins and nominations land on one
            page.
          </p>
        }
      >
        <BehindTheRecords match={data.match} />
      </AboutChapter>

      <AboutChapter number="04" title="Who makes it">
        <WhoMakesIt />
      </AboutChapter>
    </div>
  );
}
