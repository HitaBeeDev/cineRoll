import { SITE_URL } from "../filmOgConfig";

export function getDisplayShareUrl(slug: string): string {
  return new URL(`/film/${slug}`, SITE_URL).toString().replace(/^https?:\/\//, "");
}
