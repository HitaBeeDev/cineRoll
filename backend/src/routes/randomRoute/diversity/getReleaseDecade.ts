export const getReleaseDecade = (year: number | null): number | null =>
  year == null ? null : Math.floor(year / 10) * 10;
