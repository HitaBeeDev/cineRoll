import type { AwardRecord, Film } from "@cineroll/types";

// The top prize of each body, by every name it has carried. Matched whole, case-insensitive.
// `alone`: how the prize reads when it is the body's only win ("the Palme d'Or at Cannes").
const TOP_PRIZES: Record<AwardRecord["awardBody"], { names: string[]; label: string; alone: string }[]> = {
  oscar: [
    {
      names: ["best picture", "best motion picture", "outstanding picture", "outstanding production", "outstanding motion picture"],
      label: "Best Picture",
      alone: "the Oscar for Best Picture",
    },
    {
      names: ["international feature film", "foreign language film"],
      label: "Best International Feature",
      alone: "the Oscar for Best International Feature",
    },
  ],
  goldenglobe: [
    { names: ["best motion picture - drama"], label: "Best Motion Picture – Drama", alone: "the Golden Globe for Best Motion Picture – Drama" },
    {
      names: ["best motion picture - musical or comedy"],
      label: "Best Motion Picture – Musical or Comedy",
      alone: "the Golden Globe for Best Motion Picture – Musical or Comedy",
    },
  ],
  cannes: [{ names: ["palme d'or"], label: "the Palme d'Or", alone: "the Palme d'Or at Cannes" }],
  berlin: [{ names: ["golden bear", "golden bear for best film"], label: "the Golden Bear", alone: "the Golden Bear at the Berlinale" }],
};

const BODIES: { key: AwardRecord["awardBody"]; one: string; many: string; records: (film: Film) => AwardRecord[] }[] = [
  { key: "oscar", one: "Oscar", many: "Oscars", records: (film) => film.oscarCategories ?? [] },
  { key: "cannes", one: "prize at Cannes", many: "prizes at Cannes", records: (film) => film.cannesCategories ?? [] },
  { key: "goldenglobe", one: "Golden Globe", many: "Golden Globes", records: (film) => film.ggCategories ?? [] },
  { key: "berlin", one: "prize at the Berlinale", many: "prizes at the Berlinale", records: (film) => film.berlinCategories ?? [] },
];

function listJoin(items: string[]): string {
  return items.length <= 1 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`;
}

const normalize = (name: string) => name.replace(/[–—]/g, "-").replace(/\s+/g, " ").trim().toLowerCase();

function yearSpan(records: AwardRecord[]): string {
  const years = [...new Set(records.map((record) => record.awardYear))].sort((a, b) => a - b);
  if (years.length === 0) return "";
  return years.length === 1 ? ` (${years[0]})` : ` (${years[0]}–${years.at(-1)})`;
}

/**
 * The film's award record in one sentence, answer first: "Parasite won 4 Oscars
 * from 6 nominations (2020), including Best Picture, …". Built only from the
 * award rows on the page — counts, ceremony years, top prizes — so every word is
 * a checked fact. Null for a film with no award rows.
 */
export function filmAwardAnswer(film: Film, title: string): string | null {
  const won: string[] = [];
  const nominated: string[] = [];

  for (const body of BODIES) {
    const records = body.records(film);
    if (records.length === 0) continue;
    const wins = records.filter((record) => record.won);
    const span = yearSpan(records);
    if (wins.length > 0) {
      const prizes = TOP_PRIZES[body.key].filter((prize) =>
        wins.some((record) => prize.names.includes(normalize(record.category))),
      );
      const top = prizes.map((prize) => prize.label);
      const only = prizes[0];
      if (wins.length === 1 && only) {
        const from = records.length > 1 ? `, from ${records.length} nominations` : "";
        won.push(`${only.alone}${span}${from}`);
        continue;
      }
      won.push(
        `${wins.length} ${wins.length === 1 ? body.one : body.many} from ${records.length} ${records.length === 1 ? "nomination" : "nominations"}${span}${top.length ? `, including ${listJoin(top)}` : ""}`,
      );
    } else {
      nominated.push(`${records.length} ${records.length === 1 ? body.one : body.many}${span}`);
    }
  }

  if (won.length > 0) {
    const wonList = won.length > 1 ? `${won.slice(0, -1).join("; ")}; and ${won.at(-1)}` : won.join("");
    return `${title} won ${wonList}${nominated.length ? `. It was also nominated for ${listJoin(nominated)}` : ""}.`;
  }
  if (nominated.length > 0) return `${title} was nominated for ${listJoin(nominated)}.`;
  return null;
}
