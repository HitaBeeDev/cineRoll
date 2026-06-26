export type PersonStat = { name: string; count: number };

export type FilmStat = {
  id: string;
  slug: string;
  title: string;
  releaseYear: number;
  posterUrl: string | null;
  count: number;
};

export type YearStat = { awardYear: number; totalNominations: number };
export type DecadeStat = { decade: number; filmCount: number; avgNominations: number };

export type AwardBodyBreakdown = {
  coverage: { oscar: number; goldenGlobe: number; cannes: number; berlin: number };
  composition: {
    oscarOnly: number;
    goldenGlobeOnly: number;
    cannesOnly: number;
    berlinOnly: number;
    multiple: number;
  };
  total: number;
};

export type PersonStatRow = { name: string; count: bigint };
export type FilmStatRow = Omit<FilmStat, "count"> & { count: bigint };
export type YearStatRow = { awardYear: number; totalNominations: bigint };
export type DecadeStatRow = { decade: number; filmCount: bigint; avgNominations: number };

export type AwardBodyBreakdownRow = {
  oscar: bigint;
  goldenGlobe: bigint;
  cannes: bigint;
  berlin: bigint;
  oscarOnly: bigint;
  goldenGlobeOnly: bigint;
  cannesOnly: bigint;
  berlinOnly: bigint;
  multiple: bigint;
  total: bigint;
};

export type SummaryCountRow = { count: bigint };
export type SummaryTotalRow = { total: bigint };

export type StatsRows = {
  mostNominatedPersonRows: PersonStatRow[];
  mostWinningPersonRows: PersonStatRow[];
  mostNominatedFilmRows: FilmStatRow[];
  mostWinningFilmRows: FilmStatRow[];
  mostCompetitiveYearRows: YearStatRow[];
  decadeRows: DecadeStatRow[];
  awardBodyRows: AwardBodyBreakdownRow[];
  topRolledRows: FilmStatRow[];
  topWatchlistedRows: FilmStatRow[];
  totalFilmsRow: SummaryCountRow[];
  totalNominationsRow: SummaryTotalRow[];
  totalWinsRow: SummaryTotalRow[];
};
