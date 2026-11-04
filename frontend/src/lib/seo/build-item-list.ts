import { buildLinkItemList } from "./build-link-item-list";

/** schema.org ItemList for a page that lists films, in the order shown. */
export function buildItemList(name: string, path: string, films: { slug: string; title: string }[]) {
  return buildLinkItemList(
    name,
    path,
    films.map((film) => ({ path: `/film/${film.slug}`, name: film.title })),
  );
}
