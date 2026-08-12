import Link from "next/link";
import type { ComponentProps } from "react";
import { NEW_TAB_PROPS } from "@/lib/film-link/new-tab-props";
import { filmHref } from "@/lib/film-link/film-href";

type FilmLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  /** The film's slug — this component owns the path it turns into. */
  slug: string;
  /** A section of the detail page to land on, e.g. `awards`. */
  hash?: string;
};

/**
 * A link to a film detail page. Takes the slug rather than an href so no call
 * site can build the path, or the target, its own way — see lib/film-link.ts for
 * why every one of them opens in a new tab.
 *
 * `target` and `rel` are spread before `...props` rather than after, so a caller
 * that genuinely needs same-tab navigation can still say so explicitly; nothing
 * does today.
 *
 * `ref` rides along in `props` (React 19 — no forwardRef), which the browse tiles
 * need for their impression observer.
 */
export function FilmLink({ slug, hash, ...props }: FilmLinkProps) {
  return <Link href={filmHref(slug, hash)} {...NEW_TAB_PROPS} {...props} />;
}
