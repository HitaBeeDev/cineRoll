import { FILM_RECORD_TYPE_CONDITIONS } from "./filmRecordTypeConditions";
import { getTopNominatedRowsForType } from "./getTopNominatedRowsForType";
import { getTopWinningRowsForType } from "./getTopWinningRowsForType";
import {
  FILM_RECORD_TYPES,
  type FilmRecordRowsByType,
  type FilmRecordType,
} from "../types";

export const getFilmRecordRowsByType = async (): Promise<FilmRecordRowsByType> => {
  const entries = await Promise.all(FILM_RECORD_TYPES.map(loadTypeRecords));

  return Object.fromEntries(entries) as FilmRecordRowsByType;
};

const loadTypeRecords = async (type: FilmRecordType) => {
  const condition = FILM_RECORD_TYPE_CONDITIONS[type];
  const [winning, nominated] = await Promise.all([
    getTopWinningRowsForType(condition),
    getTopNominatedRowsForType(condition),
  ]);

  return [type, { winning, nominated }] as const;
};
