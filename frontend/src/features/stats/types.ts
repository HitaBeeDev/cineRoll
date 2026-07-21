export type Accent = "red" | "blue";

export type PersonStat = {
  name: string;
  count: number;
};

export type FilmStat = {
  id: string;
  slug: string;
  title: string;
  releaseYear: number;
  posterUrl: string | null;
  count: number;
};

export type DecadeStat = {
  decade: number;
  filmCount: number;
  avgNominations: number;
  topFilm: { title: string; slug: string; count: number } | null;
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

export type FilmRecordType =
  | "movie"
  | "series"
  | "animation"
  | "documentary"
  | "short";

export type FilmRecordGroupStats = {
  topWinning: FilmStat[];
  topNominated: FilmStat[];
};

export type StatsResponse = {
  summary: { totalFilms: number; totalNominations: number; totalWins: number };
  topNominatedPeople: PersonStat[];
  topWinningPeople: PersonStat[];
  topNominatedFilms: FilmStat[];
  topWinningFilms: FilmStat[];
  filmRecordsByType?: Record<FilmRecordType, FilmRecordGroupStats>;
  mostCompetitiveYear: { awardYear: number; totalNominations: number } | null;
  decadeBreakdown: DecadeStat[];
  awardBodyBreakdown: AwardBodyBreakdown | null;
  topRolledFilms: FilmStat[];
  topWatchlistedFilms: FilmStat[];
};

export type Insight = { title: string; body: string };

export type ReelItem = {
  eyebrow: string;
  title: string;
  value: string;
  sub: string;
  href: string;
  accent: "red" | "blue" | "gold";
};

export type DecadeDatum = DecadeStat & { href: string };

export type StatsViewModel = {
  winRate: number;
  avgNominationsPerFilm: number;
  decadesSorted: number[];
  decadeSpan: string;
  reelItems: ReelItem[];
  peakDecade: number;
  decadeData: DecadeDatum[];
  insights: Insight[];
  winRateContext: string;
  densityContext: string;
  conclusionPoints: string[];
};
