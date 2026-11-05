import type { BodyDecades, DecadeCell } from "../data-page-types";

const NUMBER = new Intl.NumberFormat("en-US");

/**
 * Decades down, award bodies across. Each cell: ceremonies on record out of
 * the years that decade could have held, shaded in one hue by that share, with
 * the film count under it. The number is always printed — shade never stands alone.
 */
export function DecadeCoverageGrid({ bodies }: { bodies: BodyDecades[] }) {
  const first = Math.min(...bodies.map((body) => body.firstYear));
  const last = Math.max(...bodies.map((body) => body.lastYear));
  const decades: number[] = [];
  for (let start = Math.floor(first / 10) * 10; start <= last; start += 10) decades.push(start);

  return (
    <div className="overflow-x-auto rounded-lg border border-white/10">
      <table className="w-full min-w-[32rem] border-separate border-spacing-0.5 text-sm">
        <caption className="sr-only">
          Ceremonies on record per award body per decade, with the number of nominated films
        </caption>
        <thead className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.2em] text-fg-muted">
          <tr>
            <th scope="col" className="px-3 py-3 text-left font-medium">Decade</th>
            {bodies.map((body) => (
              <th key={body.slug} scope="col" className="px-3 py-3 text-center font-medium">
                {body.shortName}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {decades.map((start) => (
            <tr key={start}>
              <th scope="row" className="px-3 py-2 text-left font-normal tabular-nums text-fg-dim">
                {start}s
              </th>
              {bodies.map((body) => (
                <Cell key={body.slug} body={body} start={start} cell={body.decades[start]} />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Cell({ body, start, cell }: { body: BodyDecades; start: number; cell: DecadeCell | undefined }) {
  // Only the years inside this body's own run count: the Berlinale's 1950s
  // start in 1951, and the current decade ends at the latest ceremony.
  const possible = Math.min(start + 9, body.lastYear) - Math.max(start, body.firstYear) + 1;
  if (!cell || possible <= 0) {
    return <td className="rounded px-3 py-2 text-center text-fg-muted">—</td>;
  }

  const share = Math.min(cell.ceremonies / possible, 1);
  const label = `${body.name}, ${start}s: ${cell.ceremonies} of ${possible} ceremonies on record, ${NUMBER.format(cell.films)} films, ${NUMBER.format(cell.wins)} wins`;

  return (
    <td
      title={label}
      className="rounded px-3 py-2 text-center"
      style={{ backgroundColor: `color-mix(in srgb, var(--color-accent) ${Math.round(8 + share * 30)}%, transparent)` }}
    >
      <span className="block tabular-nums text-fg-hi">
        {cell.ceremonies}/{possible}
      </span>
      <span className="block text-[11px] tabular-nums text-fg-muted">{NUMBER.format(cell.films)} films</span>
    </td>
  );
}
