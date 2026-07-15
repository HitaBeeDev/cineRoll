import type { AwardBody, AwardRow, PersonData } from "./domain-types";

export function getAwardBodies(person: PersonData): AwardBody[] {
  return [
    createAwardBody("Academy Awards", "OSCARS", person.oscarRecords),
    createAwardBody("Golden Globes", "GG", person.ggRecords),
    createAwardBody("Cannes Film Festival", "CANNES", person.cannesRecords),
  ].filter((body) => body.records.length > 0);
}

function createAwardBody(
  label: string,
  code: string,
  records: AwardRow[],
): AwardBody {
  return {
    label,
    code,
    records,
    wins: records.filter((record) => record.won).length,
  };
}
