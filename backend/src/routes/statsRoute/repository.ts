import {
  getAwardBodyRows,
  getDecadeRows,
  getMostCompetitiveYearRows,
  getTotalFilmsRow,
  getTotalNominationsRow,
  getTotalWinsRow,
} from "./awardStatsRepository";
import {
  getMostNominatedFilmRows,
  getMostWinningFilmRows,
  getTopRolledRows,
  getTopWatchlistedRows,
} from "./filmStatsRepository";
import {
  getMostNominatedPersonRows,
  getMostWinningPersonRows,
} from "./personStatsRepository";
import { hasWatchlist } from "./tableRepository";
import { StatsRows } from "./types";

export async function getStatsRows(): Promise<StatsRows> {
  const useWatchlist = await hasWatchlist();
  const [
    mostNominatedPersonRows,
    mostWinningPersonRows,
    mostNominatedFilmRows,
    mostWinningFilmRows,
    mostCompetitiveYearRows,
    decadeRows,
    awardBodyRows,
    topRolledRows,
    topWatchlistedRows,
    totalFilmsRow,
    totalNominationsRow,
    totalWinsRow,
  ] = await Promise.all([
    getMostNominatedPersonRows(),
    getMostWinningPersonRows(),
    getMostNominatedFilmRows(),
    getMostWinningFilmRows(),
    getMostCompetitiveYearRows(),
    getDecadeRows(),
    getAwardBodyRows(),
    getTopRolledRows(),
    getTopWatchlistedRows(useWatchlist),
    getTotalFilmsRow(),
    getTotalNominationsRow(),
    getTotalWinsRow(),
  ]);

  return {
    mostNominatedPersonRows,
    mostWinningPersonRows,
    mostNominatedFilmRows,
    mostWinningFilmRows,
    mostCompetitiveYearRows,
    decadeRows,
    awardBodyRows,
    topRolledRows,
    topWatchlistedRows,
    totalFilmsRow,
    totalNominationsRow,
    totalWinsRow,
  };
}
