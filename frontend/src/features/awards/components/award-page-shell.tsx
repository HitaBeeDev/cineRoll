import type { ReactNode } from "react";
import { AppHeader } from "@/components/app-header";
import { LastUpdated } from "@/components/last-updated";
import { fetchCatalogUpdated } from "@/lib/api/fetch-catalog-updated";
import { Breadcrumbs, type Crumb } from "@/components/breadcrumbs/breadcrumbs";
import { RelatedPages, type RelatedLink } from "./related-pages";

/**
 * Layout every hub page shares: header, breadcrumbs, h1, intro, content, and a
 * "Related pages" block ending every page.
 */
export async function AwardPageShell({
  crumbs,
  title,
  intro,
  related,
  children,
}: {
  crumbs: Crumb[];
  title: string;
  intro: ReactNode;
  /** Links that fit this page, shown before the standard hubs. */
  related?: RelatedLink[];
  children: ReactNode;
}) {
  // Hub pages are built from the whole catalogue, so they date from its last change.
  const updatedAt = await fetchCatalogUpdated();

  return (
    <main className="min-h-screen bg-ink-950 text-fg-hi">
      <AppHeader />
      <section className="border-b border-white/10 bg-[#0b0b12]">
        <div className="mx-auto max-w-5xl px-6 py-12 lg:px-10">
          <Breadcrumbs crumbs={crumbs} />
          <h1 className="mt-5 font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight sm:text-5xl">
            {title}
          </h1>
          <div className="mt-5 max-w-3xl space-y-4 text-base leading-7 text-[#b4b4c4]">{intro}</div>
          <LastUpdated iso={updatedAt} className="mt-6" />
        </div>
      </section>
      <div className="mx-auto max-w-5xl space-y-12 px-6 py-12 lg:px-10">
        {children}
        <RelatedPages current={crumbs.at(-1)?.href ?? ""} links={related ?? []} />
      </div>
    </main>
  );
}
