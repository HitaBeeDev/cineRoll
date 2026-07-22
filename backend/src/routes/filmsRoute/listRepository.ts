import type { ListQuery } from "../../lib/filmFilters/listQuerySchema";
import { getOnboardingSample } from "./getOnboardingSample";
import { getPagedFilmList } from "./getPagedFilmList";
import type { FilmListPayload } from "./filmListPayload";

export const getFilmList = (query: ListQuery): Promise<FilmListPayload> =>
  query.sample === "onboarding"
    ? getOnboardingSample(query)
    : getPagedFilmList(query);
