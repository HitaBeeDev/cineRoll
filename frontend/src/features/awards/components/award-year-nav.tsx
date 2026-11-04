import Link from "next/link";

const LINK =
  "rounded-md border border-edge px-4 py-2 text-sm text-fg-dim transition-colors hover:border-edge-hover hover:text-fg-hi";

/** Previous / next ceremony links, so year pages chain into each other. */
export function AwardYearNav({
  basePath,
  label,
  prev,
  next,
}: {
  basePath: string;
  label: string;
  prev: number | null;
  next: number | null;
}) {
  if (!prev && !next) return null;
  return (
    <nav aria-label={`Other ${label} years`} className="flex flex-wrap justify-between gap-3">
      {prev ? (
        <Link href={`${basePath}/${prev}`} className={LINK}>
          ← {prev} {label}
        </Link>
      ) : (
        <span />
      )}
      {next && (
        <Link href={`${basePath}/${next}`} className={LINK}>
          {next} {label} →
        </Link>
      )}
    </nav>
  );
}
