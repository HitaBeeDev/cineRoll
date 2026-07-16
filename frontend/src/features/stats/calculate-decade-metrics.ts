import type { DecadeDatum } from "./types";

export type DecadeMetrics = {
  maximumFilmCount: number;
  averageFilmCount: number;
  totalFilms: number;
};

export function calculateDecadeMetrics(decades: DecadeDatum[]): DecadeMetrics {
  const totalFilms = decades.reduce((sum, decade) => sum + decade.filmCount, 0);
  return {
    maximumFilmCount: Math.max(...decades.map(({ filmCount }) => filmCount), 1),
    averageFilmCount: decades.length > 0 ? totalFilms / decades.length : 0,
    totalFilms,
  };
}
