import { prisma } from "../../lib/prisma";
import { filmSummarySelect } from "./selects";

// Up to four posters are shown as the cover stack on the lists overview card.
const PREVIEW_POSTER_COUNT = 4;

export function countLists(userId: string) {
  return prisma.userList.count({ where: { userId } });
}

/**
 * All of a user's lists, newest-touched first, each with its film count and a
 * few recent posters for the overview cover stack. Film membership (for the
 * "Save to list" popover) is resolved separately via findListIdsContainingFilm.
 */
export function findLists(userId: string) {
  return prisma.userList.findMany({
    where: { userId },
    orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
    select: {
      id: true,
      name: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { entries: true } },
      entries: {
        orderBy: [{ addedAt: "desc" }, { id: "desc" }],
        take: PREVIEW_POSTER_COUNT,
        select: { film: { select: { posterUrl: true, posterColor: true } } },
      },
    },
  });
}

/** List ids (for this user) that already contain the given film. */
export async function findListIdsContainingFilm(userId: string, filmId: string): Promise<string[]> {
  const rows = await prisma.userListEntry.findMany({
    where: { filmId, list: { userId } },
    select: { listId: true },
  });
  return rows.map((r) => r.listId);
}

export function findListMeta(userId: string, listId: string) {
  return prisma.userList.findFirst({
    where: { id: listId, userId },
    select: {
      id: true,
      name: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { entries: true } },
    },
  });
}

export function findListPage(listId: string, limit: number, cursor?: string) {
  return prisma.userListEntry.findMany({
    where: { listId },
    orderBy: [{ addedAt: "desc" }, { id: "desc" }],
    include: { film: { select: filmSummarySelect } },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });
}

export function createList(userId: string, name: string) {
  return prisma.userList.create({
    data: { userId, name },
    select: {
      id: true,
      name: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { entries: true } },
    },
  });
}

export async function updateListName(userId: string, listId: string, name: string) {
  // Scope the update by userId so one user can never rename another's list.
  const result = await prisma.userList.updateMany({
    where: { id: listId, userId },
    data: { name },
  });
  if (result.count === 0) return null;
  return findListMeta(userId, listId);
}

export async function deleteList(userId: string, listId: string): Promise<boolean> {
  const result = await prisma.userList.deleteMany({ where: { id: listId, userId } });
  return result.count > 0;
}

export function createListEntry(listId: string, filmId: string) {
  return prisma.userListEntry.create({
    data: { listId, filmId },
    include: { film: { select: filmSummarySelect } },
  });
}

export async function deleteListEntry(listId: string, filmId: string): Promise<boolean> {
  const result = await prisma.userListEntry.deleteMany({ where: { listId, filmId } });
  return result.count > 0;
}

/** Bump a list's updatedAt so it sorts to the top after an add/remove. */
export function touchList(listId: string) {
  return prisma.userList.update({ where: { id: listId }, data: { updatedAt: new Date() } });
}
