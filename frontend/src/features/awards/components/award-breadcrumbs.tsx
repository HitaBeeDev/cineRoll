import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { SITE_URL } from "@/lib/site-url";

export type Crumb = { label: string; href: string };

/** Visible trail plus BreadcrumbList data, so search results show the path. */
export function AwardBreadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: crumbs.map((crumb, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: crumb.label,
            item: `${SITE_URL}${crumb.href}`,
          })),
        }}
      />
      <nav aria-label="Breadcrumb">
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
