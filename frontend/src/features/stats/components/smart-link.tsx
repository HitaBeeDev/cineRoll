"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { newTabPropsFor } from "@/lib/film-link/new-tab-props-for";

type SmartLinkProps = {
  href: string;
  className?: string;
  children: ReactNode;
  ariaLabel?: string;
};

/**
 * A record-reel row links to whatever the record is about — a film, a person, or
 * a decade further down this same page. Only the destination is known here, not
 * the kind, so the film rule is applied by inspecting it (`newTabPropsFor`)
 * rather than by the caller remembering which rows are films.
 */
export function SmartLink({ href, className, children, ariaLabel }: SmartLinkProps) {
  if (href.startsWith("#")) {
    return <a href={href} className={className} aria-label={ariaLabel}>{children}</a>;
  }
  return (
    <Link href={href} className={className} aria-label={ariaLabel} {...newTabPropsFor(href)}>
      {children}
    </Link>
  );
}
