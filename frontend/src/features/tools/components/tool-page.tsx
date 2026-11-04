import type { Film } from "@cineroll/types";
import { AppHeader } from "@/components/app-header";
import { FilmTile } from "@/components/film-tile";
import { JsonLd } from "@/components/json-ld";
import { SITE_URL } from "@/lib/site-url";
import type { ToolDefinition } from "../tool-types";
import { ToolLinks } from "./tool-links";
import { ToolRoller } from "./tool-roller";

/**
 * One random-film tool page. Everything but the roll itself is server-rendered:
 * the heading, the intro, real example films and links to the other tools —
 * so the page answers its query before any JavaScript runs.
 */
export function ToolPage({
  tool,
  examples,
  total,
}: {
  tool: ToolDefinition;
  examples: Film[];
  total: number | null;
}) {
  const count = total ? total.toLocaleString("en-US") : "thousands of";

  return (
    <main className="min-h-screen bg-ink-950 text-fg-hi">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: tool.h1,
          url: `${SITE_URL}/tools/${tool.slug}`,
          description: tool.description,
          applicationCategory: "EntertainmentApplication",
          operatingSystem: "Any",
          isAccessibleForFree: true,
          offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
        }}
      />
      <AppHeader />

      <section className="border-b border-white/10 bg-[#0b0b12]">
        <div className="mx-auto max-w-4xl px-6 py-14 lg:px-10">
          <p className="font-[family-name:var(--font-geist-mono)] text-[11px] font-semibold uppercase tracking-[0.45em] text-accent">
            Random film tools
          </p>
          <h1 className="mt-5 font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight sm:text-5xl">
            {tool.h1}
          </h1>
          <div className="mt-5 max-w-2xl space-y-4 text-base leading-7 text-[#b4b4c4]">
            {tool.intro.map((paragraph) => (
              <p key={paragraph.slice(0, 32)}>{paragraph.replace("{count}", count)}</p>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-4xl space-y-14 px-6 py-12 lg:px-10">
        <ToolRoller params={tool.params} choices={tool.choices} />

        {examples.length > 0 && (
          <section>
            <h2 className="font-[family-name:var(--font-geist-mono)] text-[11px] font-semibold uppercase tracking-[0.4em] text-accent">
              Films you might land on
            </h2>
            {/* Six examples: 2, 3 or 6 per row, so the grid never ends on a lone tile. */}
            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {examples.map((film) => (
                <FilmTile key={film.id} film={film} />
              ))}
            </div>
          </section>
        )}

        <ToolLinks currentSlug={tool.slug} />
      </div>
    </main>
  );
}
