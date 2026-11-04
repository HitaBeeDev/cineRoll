import { absoluteUrl } from "./absolute-url";

/** schema.org ItemList of site pages, in the order shown. */
export function buildLinkItemList(name: string, path: string, items: { path: string; name: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    url: absoluteUrl(path),
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl(item.path),
      name: item.name,
    })),
  };
}
