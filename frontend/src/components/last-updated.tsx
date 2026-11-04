const FORMAT = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});

/**
 * "Last updated <date>" from a real record timestamp — never the time the page
 * was rendered. Renders nothing without a valid date.
 */
export function LastUpdated({ iso, className = "" }: { iso: string | null | undefined; className?: string }) {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;

  return (
    <p
      className={`font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.2em] text-fg-muted ${className}`}
    >
      Last updated <time dateTime={date.toISOString()}>{FORMAT.format(date)}</time>
    </p>
  );
}
