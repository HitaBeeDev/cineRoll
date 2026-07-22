import { HttpError } from "../../middleware/errorHandler";
import { isUniqueConstraintError } from "./helpers";
import { assertFilmExists } from "./filmRepository";
import { mapEntryFilm, paginatedFilmEntries } from "./filmMapper";
import {
  countLists,
  createList,
  createListEntry,
  deleteList,
  deleteListEntry,
  findListIdsContainingFilm,
  findListMeta,
  findListPage,
  findLists,
  touchList,
  updateListName,
} from "./listsRepository";

// A user keeps at most this many custom lists (product spec). Enforced here so
// the cap holds regardless of which client calls the API.
const MAX_LISTS_PER_USER = 20;

type ListMeta = NonNullable<Awaited<ReturnType<typeof findListMeta>>>;

function mapListMeta(list: ListMeta) {
  const { _count, ...rest } = list;
  return { ...rest, filmCount: _count.entries };
}

export async function listLists(userId: string, filmId?: string) {
  const [lists, containingIds] = await Promise.all([
    findLists(userId),
    filmId ? findListIdsContainingFilm(userId, filmId) : Promise.resolve<string[]>([]),
  ]);
  const containing = new Set(containingIds);

  return {
    lists: lists.map((list) => {
      const { _count, entries, ...rest } = list;
      return {
        ...rest,
        filmCount: _count.entries,
        previewPosters: entries
          .map((e) => e.film.posterUrl)
          .filter((url): url is string => Boolean(url)),
        // Only meaningful when a filmId was queried; false otherwise.
        containsFilm: containing.has(list.id),
      };
    }),
    total: lists.length,
    maxLists: MAX_LISTS_PER_USER,
  };
}

export async function createUserList(userId: string, name: string) {
  if ((await countLists(userId)) >= MAX_LISTS_PER_USER) {
    throw new HttpError(
      409,
      `You can keep up to ${MAX_LISTS_PER_USER} lists`,
      "LIST_LIMIT_REACHED",
    );
  }

  const list = await createList(userId, name);
  return mapListMeta(list);
}

export async function renameUserList(userId: string, listId: string, name: string) {
  const updated = await updateListName(userId, listId, name);
  if (!updated) throw listNotFound();
  return mapListMeta(updated);
}

export async function deleteUserList(userId: string, listId: string): Promise<void> {
  if (!(await deleteList(userId, listId))) throw listNotFound();
}

export async function getUserList(userId: string, listId: string, limit: number, cursor?: string) {
  const meta = await findListMeta(userId, listId);
  if (!meta) throw listNotFound();

  const entries = await findListPage(listId, limit, cursor);
  const { page, nextCursor } = paginatedFilmEntries(entries, limit);

  return {
    list: mapListMeta(meta),
    films: page.map(mapEntryFilm),
    nextCursor,
  };
}

export async function addFilmToUserList(userId: string, listId: string, filmId: string) {
  // Both the list (ownership) and the film must exist before we insert.
  await assertListOwned(userId, listId);
  await assertFilmExists(filmId);

  try {
    const entry = await createListEntry(listId, filmId);
    await touchList(listId);
    return mapEntryFilm(entry);
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new HttpError(409, "Film is already in this list", "LIST_ENTRY_ALREADY_EXISTS");
    }
    throw error;
  }
}

export async function removeFilmFromUserList(userId: string, listId: string, filmId: string): Promise<void> {
  await assertListOwned(userId, listId);

  if (!(await deleteListEntry(listId, filmId))) {
    throw new HttpError(404, "Film is not in this list", "LIST_ENTRY_NOT_FOUND");
  }
  await touchList(listId);
}

async function assertListOwned(userId: string, listId: string): Promise<void> {
  if (!(await findListMeta(userId, listId))) throw listNotFound();
}

function listNotFound() {
  return new HttpError(404, "List not found", "LIST_NOT_FOUND");
}
