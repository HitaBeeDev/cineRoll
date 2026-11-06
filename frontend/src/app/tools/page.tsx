import type { Metadata } from "next";
import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { RelatedPages } from "@/features/awards/components/related-pages";
import { TOOLS } from "@/features/tools/tools";
import { DiscoveryPaths } from "@/features/tools/components/discovery-paths";
import { DISCOVERY_PATHS } from "@/features/tools/discovery-paths";
import { JsonLd } from "@/components/json-ld";
import { buildLinkItemList } from "@/lib/seo/build-link-item-list";

export const metadata: Metadata = {
  alternates: { canonical: "/tools" },
  title: "Movie Pickers & Random Movie Generators",
  description:
    "Find your next movie with random movie generators, movie roulette, AI recommendations and streaming picks. Choose by mood, genre, decade, runtime or award.",
};

export default function ToolsIndexPage() {
  return (
    <main className="min-h-screen bg-ink-950 text-fg-hi">
      <JsonLd data={buildLinkItemList("Movie pickers and discovery tools", "/tools", [
        ...TOOLS.map((tool) => ({ path: `/tools/${tool.slug}`, name: tool.h1 })),
        ...DISCOVERY_PATHS.flatMap((group) => group.links.map((link) => ({ path: link.href, name: link.label }))),
      ])} />
      <AppHeader />
      <section className="border-b border-white/10 bg-[#0b0b12]">
        <div className="mx-auto max-w-4xl px-6 py-14 lg:px-10">
          <p className="font-[family-name:var(--font-geist-mono)] text-[11px] font-semibold uppercase tracking-[0.45em] text-accent">
            Random film tools
          </p>
          <h1 className="mt-5 font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight sm:text-5xl">
            Movie Pickers &amp; Random Movie Generators
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[#b4b4c4]">
            What should I watch tonight? Start with movie roulette for a surprise, choose a
            genre or mood, or let a random movie generator pick an award winner. Each tool below
            draws from films recognised at the Oscars, Golden Globes, Cannes or the Berlinale.
          </p>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[#b4b4c4]">
            Unlike most random movie generators, these only draw from films that a jury or an
            academy actually singled out, and they skip titles with weak ratings, so every roll is
            worth your evening. Roll as often as you like: recent picks are kept out so you
            don&apos;t see the same film twice in a row, and every result links to the film&apos;s
            full award history.
          </p>
        </div>
      </section>
      <ul className="mx-auto grid max-w-4xl gap-3 px-6 py-12 sm:grid-cols-2 lg:px-10">
        {TOOLS.map((tool) => (
          <li key={tool.slug}>
            <Link
              href={`/tools/${tool.slug}`}
              className="block h-full rounded-lg border border-edge bg-ink-900 p-5 transition-colors hover:border-edge-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
            >
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold">{tool.h1}</h2>
              <p className="mt-2 text-sm leading-6 text-fg-muted">{tool.description}</p>
            </Link>
          </li>
        ))}
      </ul>
      <div className="mx-auto max-w-4xl space-y-12 px-6 pb-12 lg:px-10">
        <DiscoveryPaths />
        <RelatedPages current="/tools" />
      </div>
    </main>
  );
}
