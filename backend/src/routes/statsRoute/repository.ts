import {
  getAwardBodyRows,
  getDecadeRows,
  getMostCompetitiveYearRows,
  getTotalFilmsRow,
  getTotalNominationsRow,
  getTotalWinsRow,
} from "./awardStatsRepository";
import { getDecadeTopFilmRows } from "./filmStats/getDecadeTopFilmRows";
import { getFilmRecordRowsByType } from "./filmStats/getFilmRecordRowsByType";
import { getTopNominatedFilmRows } from "./filmStats/getTopNominatedFilmRows";
import { getTopRolledRows } from "./filmStats/getTopRolledRows";
import { getTopWatchlistedRows } from "./filmStats/getTopWatchlistedRows";
import { getTopWinningFilmRows } from "./filmStats/getTopWinningFilmRows";
import {
  getTopNominatedPersonRows,
  getTopWinningPersonRows,
} from "./personStatsRepository";
import { hasWatchlist } from "./tableRepository";
import { StatsRows } from "./types";

export async function getStatsRows(): Promise<StatsRows> {
  const useWatchlist = await hasWatchlist();
  const [
    topNominatedPersonRows,
    topWinningPersonRows,
    topNominatedFilmRows,
    topWinningFilmRows,
    filmRecordRowsByType,
    mostCompetitiveYearRows,
    decadeRows,
    decadeTopFilmRows,
    awardBodyRows,
    topRolledRows,
    topWatchlistedRows,
    totalFilmsRow,
    totalNominationsRow,
    totalWinsRow,
  ] = await Promise.all([
    getTopNominatedPersonRows(),
    getTopWinningPersonRows(),
    getTopNominatedFilmRows(),
    getTopWinningFilmRows(),
    getFilmRecordRowsByType(),
    getMostCompetitiveYearRows(),
    getDecadeRows(),
    getDecadeTopFilmRows(),
    getAwardBodyRows(),
    getTopRolledRows(),
    getTopWatchlistedRows(useWatchlist),
    getTotalFilmsRow(),
    getTotalNominationsRow(),
    getTotalWinsRow(),
  ]);

  return {
    topNominatedPersonRows,
    topWinningPersonRows,
    topNominatedFilmRows,
    topWinningFilmRows,
    filmRecordRowsByType,
    mostCompetitiveYearRows,
    decadeRows,
    decadeTopFilmRows,
    awardBodyRows,
    topRolledRows,
    topWatchlistedRows,
    totalFilmsRow,
    totalNominationsRow,
    totalWinsRow,
  };
}
