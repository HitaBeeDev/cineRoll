import Image from "next/image";
import Link from "next/link";
import type { StreamingService } from "../streaming-types";

/** The services with a page in one country, as linked cards: logo, name, film count. */
export function ServiceList({ region, services }: { region: string; services: StreamingService[] }) {
  return (
    <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {services.map((service) => (
        <li key={service.slug}>
          <Link
            href={`/streaming/${region.toLowerCase()}/${service.slug}`}
            className="flex items-center gap-3 rounded-md border border-white/10 bg-white/[0.03] p-3 transition-colors hover:border-accent/40"
          >
            {service.logoPath ? (
              <Image
                src={`https://image.tmdb.org/t/p/w92${service.logoPath}`}
                alt=""
                width={36}
                height={36}
                unoptimized
                className="h-9 w-9 shrink-0 rounded"
              />
            ) : (
              <span className="h-9 w-9 shrink-0 rounded bg-white/5" aria-hidden />
            )}
            <span className="min-w-0">
              <span className="block truncate text-sm text-fg-hi">{service.name}</span>
              <span className="block text-xs tabular-nums text-fg-muted">{service.films} award films</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
