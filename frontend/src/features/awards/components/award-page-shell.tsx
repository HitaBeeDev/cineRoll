import type { ReactNode } from "react";
import { AppHeader } from "@/components/app-header";
import { AwardBreadcrumbs, type Crumb } from "./award-breadcrumbs";

/** Layout every award page shares: header, breadcrumbs, h1, intro, content. */
export function AwardPageShell({
  crumbs,
  title,
  intro,
  children,
}: {
  crumbs: Crumb[];
  title: string;
  intro: ReactNode;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-ink-950 text-fg-hi">
      <AppHeader />
      <section className="border-b border-white/10 bg-[#0b0b12]">
        <div className="mx-auto max-w-5xl px-6 py-12 lg:px-10">
          <AwardBreadcrumbs crumbs={crumbs} />
          <h1 className="mt-5 font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight sm:text-5xl">
            {title}
          </h1>
          <div className="mt-5 max-w-3xl space-y-4 text-base leading-7 text-[#b4b4c4]">{intro}</div>
        </div>
      </section>
      <div className="mx-auto max-w-5xl space-y-12 px-6 py-12 lg:px-10">{children}</div>
    </main>
  );
}
