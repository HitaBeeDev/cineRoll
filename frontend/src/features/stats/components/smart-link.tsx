"use client";

import Link from "next/link";
import type { ReactNode } from "react";

type SmartLinkProps = {
  href: string;
  className?: string;
  children: ReactNode;
  ariaLabel?: string;
};

export function SmartLink({ href, className, children, ariaLabel }: SmartLinkProps) {
  if (href.startsWith("#")) {
    return <a href={href} className={className} aria-label={ariaLabel}>{children}</a>;
  }
  return <Link href={href} className={className} aria-label={ariaLabel}>{children}</Link>;
}
