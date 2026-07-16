import {
  getAwardBodyRows,
  getDecadeRows,
  getMostCompetitiveYearRows,
  getTotalFilmsRow,
  getTotalNominationsRow,
  getTotalWinsRow,
} from "./awardStatsRepository";
import {
  getDecadeTopFilmRows,
  getFilmRecordRowsByType,
  getTopNominatedFilmRows,
  getTopRolledRows,
  getTopWatchlistedRows,
  getTopWinningFilmRows,
} from "./filmStatsRepository";
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
