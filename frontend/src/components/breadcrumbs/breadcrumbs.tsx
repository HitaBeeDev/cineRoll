import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { buildBreadcrumbList } from "@/lib/seo/build-breadcrumb-list";

export type Crumb = { label: string; href: string };

/** Visible trail plus BreadcrumbList data, so search results show the path. */
export function Breadcrumbs({ crumbs, className = "" }: { crumbs: Crumb[]; className?: string }) {
  return (
    <>
      <JsonLd data={buildBreadcrumbList(crumbs)} />
      <nav aria-label="Breadcrumb" className={className}>
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.2em] text-fg-muted">
          {crumbs.map((crumb, index) => {
            const last = index === crumbs.length - 1;
            return (
              <li key={crumb.href} className="flex items-center gap-2">
                {last ? (
                  <span aria-current="page" className="text-accent">
                    {crumb.label}
                  </span>
                ) : (
                  <Link href={crumb.href} className="transition-colors hover:text-fg-hi">
                    {crumb.label}
                  </Link>
                )}
                {!last && <span aria-hidden className="text-[#2e2e44]">/</span>}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
