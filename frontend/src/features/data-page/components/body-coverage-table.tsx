import Link from "next/link";
import type { BodyDecades } from "../data-page-types";

const NUMBER = new Intl.NumberFormat("en-US");

export function BodyCoverageTable({ bodies }: { bodies: BodyDecades[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-white/10">
      <table className="w-full min-w-[32rem] text-left text-sm">
        <thead className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.2em] text-fg-muted">
          <tr className="border-b border-white/10">
            <th scope="col" className="px-4 py-3 font-medium">Award</th>
            <th scope="col" className="px-4 py-3 text-right font-medium">Films</th>
            <th scope="col" className="px-4 py-3 font-medium">Years</th>
            <th scope="col" className="px-4 py-3 text-right font-medium">Ceremonies</th>
            <th scope="col" className="px-4 py-3 text-right font-medium">Missing years</th>
          </tr>
        </thead>
        <tbody>
          {bodies.map((body) => (
            <tr key={body.slug} className="border-b border-white/5 last:border-0">
              <th scope="row" className="px-4 py-3 font-normal">
                <Link
                  href={`/awards/${body.slug}`}
                  className="text-fg-hi underline decoration-white/25 underline-offset-4 transition-colors hover:text-accent"
                >
                  {body.name}
                </Link>
              </th>
              <td className="px-4 py-3 text-right tabular-nums">{NUMBER.format(body.filmCount)}</td>
              <td className="px-4 py-3 tabular-nums">
                {body.firstYear}–{body.lastYear}
              </td>
              <td className="px-4 py-3 text-right tabular-nums">
                {body.lastYear - body.firstYear + 1 - body.missingYears.length}
              </td>
              <td className="px-4 py-3 text-right tabular-nums">{body.missingYears.length}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
