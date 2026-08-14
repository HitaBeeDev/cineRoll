/** Pulsing placeholder for a taste card while the set loads. */
export function TasteCardSkeleton() {
  return (
    <div
      className="animate-pulse border border-white/10 bg-ink-800/80"
      style={{ aspectRatio: "2/3" }}
    />
  );
}
