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
export type DecadeTopFilm = { title: string; slug: string; count: number };
export type DecadeStat = {
  decade: number;
  filmCount: number;
  avgNominations: number;
  topFilm: DecadeTopFilm | null;
};

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

// Hall of Records type buckets. "movie" here means feature film (the `types`
// facet), not the contentType namespace default.
export const FILM_RECORD_TYPES = [
  "movie",
  "series",
  "animation",
  "documentary",
  "short",
] as const;
export type FilmRecordType = (typeof FILM_RECORD_TYPES)[number];

export type FilmRecordGroup = { topWinning: FilmStat[]; topNominated: FilmStat[] };
export type FilmRecordsByType = Record<FilmRecordType, FilmRecordGroup>;

export type PersonStatRow = { name: string; count: bigint };
export type FilmStatRow = Omit<FilmStat, "count"> & { count: bigint };
export type YearStatRow = { awardYear: number; totalNominations: bigint };
export type DecadeStatRow = { decade: number; filmCount: bigint; avgNominations: number };
export type DecadeTopFilmRow = { decade: number; title: string; slug: string; count: bigint };

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

export type FilmRecordRowsByType = Record<
  FilmRecordType,
  { winning: FilmStatRow[]; nominated: FilmStatRow[] }
>;

export type SummaryCountRow = { count: bigint };
export type SummaryTotalRow = { total: bigint };

export type StatsRows = {
  topNominatedPersonRows: PersonStatRow[];
  topWinningPersonRows: PersonStatRow[];
  topNominatedFilmRows: FilmStatRow[];
  topWinningFilmRows: FilmStatRow[];
  filmRecordRowsByType: FilmRecordRowsByType;
  mostCompetitiveYearRows: YearStatRow[];
  decadeRows: DecadeStatRow[];
  decadeTopFilmRows: DecadeTopFilmRow[];
  awardBodyRows: AwardBodyBreakdownRow[];
  topRolledRows: FilmStatRow[];
  topWatchlistedRows: FilmStatRow[];
  totalFilmsRow: SummaryCountRow[];
  totalNominationsRow: SummaryTotalRow[];
  totalWinsRow: SummaryTotalRow[];
};
