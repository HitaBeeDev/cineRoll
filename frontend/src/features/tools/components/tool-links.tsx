import Link from "next/link";
import { TOOLS } from "../tools";

/** Links to the other tools, so every tool page feeds the rest. */
export function ToolLinks({ currentSlug }: { currentSlug?: string }) {
  const others = TOOLS.filter((tool) => tool.slug !== currentSlug);

  return (
    <nav aria-label="More random film tools">
      <h2 className="font-[family-name:var(--font-geist-mono)] text-[11px] font-semibold uppercase tracking-[0.4em] text-accent">
        More random film tools
      </h2>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {others.map((tool) => (
          <li key={tool.slug}>
            <Link
              href={`/tools/${tool.slug}`}
              className="block rounded-md border border-edge px-4 py-3 text-sm text-fg-dim transition-colors hover:border-edge-hover hover:text-fg-hi focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
            >
              {tool.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
