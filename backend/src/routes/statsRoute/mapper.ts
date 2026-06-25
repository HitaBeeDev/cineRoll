import {
  AwardBodyBreakdown,
  AwardBodyBreakdownRow,
  DecadeStat,
  DecadeStatRow,
  FilmStat,
  FilmStatRow,
  PersonStat,
  PersonStatRow,
  StatsRows,
  YearStat,
  YearStatRow,
} from "./types";

export function statsPayload(rows: StatsRows) {
  return {
    summary: {
      totalFilms: toBigIntNumber(rows.totalFilmsRow[0]?.count),
      totalNominations: toBigIntNumber(rows.totalNominationsRow[0]?.total),
      totalWins: toBigIntNumber(rows.totalWinsRow[0]?.total),
    },
    mostNominatedPerson: personStat(rows.mostNominatedPersonRows),
    mostWinningPerson: personStat(rows.mostWinningPersonRows),
    mostNominatedFilm: filmStat(rows.mostNominatedFilmRows),
    mostWinningFilm: filmStat(rows.mostWinningFilmRows),
    mostCompetitiveYear: yearStat(rows.mostCompetitiveYearRows),
    decadeBreakdown: rows.decadeRows.map(decadeStat),
    awardBodyBreakdown: awardBodyBreakdown(rows.awardBodyRows),
    topRolledFilms: rows.topRolledRows.map(filmStatRow),
    topWatchlistedFilms: rows.topWatchlistedRows.map(filmStatRow),
  };
}

function personStat(rows: PersonStatRow[]): PersonStat | null {
  return rows[0]
    ? { name: rows[0].name, count: toBigIntNumber(rows[0].count) }
    : null;
}

function filmStat(rows: FilmStatRow[]): FilmStat | null {
  return rows[0] ? filmStatRow(rows[0]) : null;
}

function filmStatRow(row: FilmStatRow): FilmStat {
  return { ...row, count: toBigIntNumber(row.count) };
}

function yearStat(rows: YearStatRow[]): YearStat | null {
  return rows[0]
    ? {
        awardYear: rows[0].awardYear,
        totalNominations: toBigIntNumber(rows[0].totalNominations),
      }
    : null;
}

function decadeStat(row: DecadeStatRow): DecadeStat {
  return {
    decade: row.decade,
    filmCount: toBigIntNumber(row.filmCount),
    avgNominations: row.avgNominations,
  };
}

function awardBodyBreakdown(rows: AwardBodyBreakdownRow[]): AwardBodyBreakdown | null {
  return rows[0]
    ? {
        oscarOnly: toBigIntNumber(rows[0].oscarOnly),
        ggOnly: toBigIntNumber(rows[0].ggOnly),
        cannesOnly: toBigIntNumber(rows[0].cannesOnly),
        berlin: toBigIntNumber(rows[0].berlin),
        total: toBigIntNumber(rows[0].total),
      }
    : null;
}

function toBigIntNumber(value: bigint | number | null | undefined): number {
  return Number(value ?? 0);
}
