import {
  AwardBodyBreakdown,
  AwardBodyBreakdownRow,
  DecadeStat,
  DecadeStatRow,
  DecadeTopFilmRow,
  FILM_RECORD_TYPES,
  FilmRecordRowsByType,
  FilmRecordsByType,
  FilmStat,
  FilmStatRow,
  PersonStat,
  PersonStatRow,
  StatsRows,
  YearStat,
  YearStatRow,
} from "./types";

export function statsPayload(rows: StatsRows) {
  const decadeTopFilms = new Map(
    rows.decadeTopFilmRows.map((row) => [row.decade, row]),
  );

  return {
    summary: {
      totalFilms: toBigIntNumber(rows.totalFilmsRow[0]?.count),
      totalNominations: toBigIntNumber(rows.totalNominationsRow[0]?.total),
      totalWins: toBigIntNumber(rows.totalWinsRow[0]?.total),
    },
    topNominatedPeople: rows.topNominatedPersonRows.map(personStat),
    topWinningPeople: rows.topWinningPersonRows.map(personStat),
    topNominatedFilms: rows.topNominatedFilmRows.map(filmStatRow),
    topWinningFilms: rows.topWinningFilmRows.map(filmStatRow),
    filmRecordsByType: filmRecordsByType(rows.filmRecordRowsByType),
    mostCompetitiveYear: yearStat(rows.mostCompetitiveYearRows),
    decadeBreakdown: rows.decadeRows.map((row) => decadeStat(row, decadeTopFilms)),
    awardBodyBreakdown: awardBodyBreakdown(rows.awardBodyRows),
    topRolledFilms: rows.topRolledRows.map(filmStatRow),
    topWatchlistedFilms: rows.topWatchlistedRows.map(filmStatRow),
  };
}

function personStat(row: PersonStatRow): PersonStat {
  return { name: row.name, count: toBigIntNumber(row.count) };
}

function filmStatRow(row: FilmStatRow): FilmStat {
  return { ...row, count: toBigIntNumber(row.count) };
}

function filmRecordsByType(rows: FilmRecordRowsByType): FilmRecordsByType {
  return Object.fromEntries(
    FILM_RECORD_TYPES.map(type => [
      type,
      {
        topWinning: rows[type].winning.map(filmStatRow),
        topNominated: rows[type].nominated.map(filmStatRow),
      },
    ]),
  ) as FilmRecordsByType;
}

function yearStat(rows: YearStatRow[]): YearStat | null {
  return rows[0]
    ? {
        awardYear: rows[0].awardYear,
        totalNominations: toBigIntNumber(rows[0].totalNominations),
      }
    : null;
}

function decadeStat(
  row: DecadeStatRow,
  topFilms: Map<number, DecadeTopFilmRow>,
): DecadeStat {
  const top = topFilms.get(row.decade);
  return {
    decade: row.decade,
    filmCount: toBigIntNumber(row.filmCount),
    avgNominations: row.avgNominations,
    topFilm: top
      ? { title: top.title, slug: top.slug, count: toBigIntNumber(top.count) }
      : null,
  };
}

function awardBodyBreakdown(rows: AwardBodyBreakdownRow[]): AwardBodyBreakdown | null {
  return rows[0]
    ? {
        coverage: {
          oscar: toBigIntNumber(rows[0].oscar),
          goldenGlobe: toBigIntNumber(rows[0].goldenGlobe),
          cannes: toBigIntNumber(rows[0].cannes),
          berlin: toBigIntNumber(rows[0].berlin),
        },
        composition: {
          oscarOnly: toBigIntNumber(rows[0].oscarOnly),
          goldenGlobeOnly: toBigIntNumber(rows[0].goldenGlobeOnly),
          cannesOnly: toBigIntNumber(rows[0].cannesOnly),
          berlinOnly: toBigIntNumber(rows[0].berlinOnly),
          multiple: toBigIntNumber(rows[0].multiple),
        },
        total: toBigIntNumber(rows[0].total),
      }
    : null;
}

function toBigIntNumber(value: bigint | number | null | undefined): number {
  return Number(value ?? 0);
}
