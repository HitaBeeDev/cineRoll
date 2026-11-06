import Link from "next/link";
import { DISCOVERY_PATHS } from "../discovery-paths";

export function DiscoveryPaths() {
  return (
    <section aria-labelledby="discovery-title" className="space-y-8 border-t border-white/10 pt-10">
      <h2 id="discovery-title" className="font-[family-name:var(--font-display)] text-3xl font-bold">
        More ways to find your next movie
      </h2>
      {DISCOVERY_PATHS.map((group) => (
        <div key={group.title}>
          <h3 className="text-lg font-semibold text-fg-hi">{group.title}</h3>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {group.links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block h-full rounded-lg border border-edge bg-ink-900 p-5 transition-colors hover:border-edge-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
                >
                  <span className="font-semibold text-fg-hi">{link.label}</span>
                  <p className="mt-2 text-sm leading-6 text-fg-muted">{link.description}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
