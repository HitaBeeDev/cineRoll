import type { FilmOgRating } from "../filmOgTypes";
import { FilmOgBadge } from "./FilmOgBadge";
import { FilmOgRatingPill } from "./FilmOgRatingPill";

type FilmOgSignalListProps = {
  badges: string[];
  ratings: FilmOgRating[];
};

export function FilmOgSignalList({ badges, ratings }: FilmOgSignalListProps) {
  return (
    <div style={{ display: "flex", marginTop: 30, gap: 12, flexWrap: "wrap", alignItems: "center" }}>
      {ratings.map((rating) => (
        <FilmOgRatingPill key={rating.label} rating={rating} />
      ))}
      {badges.slice(0, 3).map((badge) => (
        <FilmOgBadge badge={badge} key={badge} />
      ))}
    </div>
  );
}
