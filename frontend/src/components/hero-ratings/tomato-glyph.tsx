/** Minimal tomato mark for the Rotten Tomatoes score (fruit + leaf). */
export function TomatoGlyph({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" aria-hidden>
      <circle cx="12" cy="14" r="7" fill={color} />
      <path
        d="M12 7c-1.2-2.2-3.4-3-5-2.6 1 1.8 2.8 2.6 5 2.6Zm0 0c1.2-2.2 3.4-3 5-2.6-1 1.8-2.8 2.6-5 2.6Z"
        fill={color}
      />
    </svg>
  );
}
