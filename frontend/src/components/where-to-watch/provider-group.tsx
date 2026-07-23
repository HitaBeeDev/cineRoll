import Image from "next/image";
import type { Provider } from "@/components/where-to-watch/types";

/** One labelled row of provider logos (Stream / Rent / Buy), sorted by TMDB
 *  display priority. Renders nothing when the group is empty. */
export function ProviderGroup({
  label,
  providers,
  accent,
}: {
  label: string;
  providers: Provider[];
  accent: string;
}) {
  if (providers.length === 0) return null;
  const sorted = [...providers].sort(
    (a, b) => a.display_priority - b.display_priority,
  );

  return (
    <div>
      <p
        className="mb-3 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.5em]"
        style={{ color: `${accent}cc` }}
      >
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {sorted.map((p) => (
          <div
            key={p.provider_id}
            title={p.provider_name}
            className="group relative h-11 w-11 overflow-hidden rounded-xl border border-[#1a1a26] bg-[#0c0c14] transition-colors hover:border-[#2a2a3e]"
          >
            <Image
              src={`https://image.tmdb.org/t/p/w92${p.logo_path}`}
              alt={p.provider_name}
              fill
              sizes="44px"
              className="object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
